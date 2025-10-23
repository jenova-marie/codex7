// json-to-drizzle.ts
// Convert JSON schemas to Drizzle ORM pgTable() definitions with pgvector support
// Enhanced for Codex7 with vector embedding support

import fs from 'fs';
import path from 'path';

const typeMap: Record<string, string> = {
  string: 'text',
  number: 'integer',
  boolean: 'boolean',
  array: 'json',
  object: 'json',
  null: 'text',
};

// Convert singular class name to plural lowercase table name
const toPluralTableName = (name: string): string => {
  // Simple pluralization rules
  if (name.endsWith('y')) {
    return name.slice(0, -1).toLowerCase() + 'ies';
  }
  if (name.endsWith('s') || name.endsWith('sh') || name.endsWith('ch') || name.endsWith('x') || name.endsWith('z')) {
    return name.toLowerCase() + 'es';
  }
  return name.toLowerCase() + 's';
};

const getColumnDefinition = (key: string, prop: any, required: string[], tableName: string): string => {
  let drizzleType = typeMap[prop.type] || 'text';

  // 🎯 SPECIAL HANDLING: pgvector for embedding arrays
  // Detect if this is the embedding field (array of numbers with specific length)
  if (key === 'embedding' && prop.type === 'array' && prop.items?.type === 'number') {
    // OpenAI text-embedding-3-small uses 1536 dimensions
    const dimensions = 1536;
    const col = `vector('${key}', { dimensions: ${dimensions} })`;
    const constraints: string[] = [];

    // Don't mark as notNull if it's optional (embeddings are added after document creation)
    // Add default empty array? No - pgvector doesn't support defaults well

    return `  ${key}: ${col},`;
  }

  // Handle maxLength for string types
  if (prop.type === 'string' && prop.maxLength) {
    drizzleType = 'varchar';
  }

  // Handle timestamp fields
  if (prop.type === 'number' && prop.format === 'timestamp') {
    drizzleType = 'timestamp';
  }

  // Handle date fields
  if (prop.type === 'string' && prop.format === 'date') {
    drizzleType = 'date';
  }

  // Handle date-time fields
  if (prop.type === 'string' && prop.format === 'date-time') {
    drizzleType = 'timestamp';
  }

  // Handle UUID fields
  if (prop.type === 'string' && prop.format === 'uuid') {
    drizzleType = 'uuid';
  }

  // Handle email fields
  if (prop.type === 'string' && prop.format === 'email') {
    drizzleType = 'varchar';
  }

  // Handle URL fields
  if (prop.type === 'string' && prop.format === 'uri') {
    drizzleType = 'varchar';
  }

  // Handle decimal/numeric fields
  if (prop.type === 'number' && (prop.multipleOf || prop.format === 'decimal')) {
    drizzleType = 'decimal';
  }

  // Handle bigint fields
  if (prop.type === 'number' && prop.format === 'int64') {
    drizzleType = 'bigint';
  }

  const col = drizzleType === 'varchar'
    ? `varchar('${key}', { length: ${prop.maxLength || 255} })`
    : drizzleType === 'timestamp'
    ? `timestamp('${key}')`
    : drizzleType === 'date'
    ? `date('${key}')`
    : drizzleType === 'uuid'
    ? `uuid('${key}')`
    : drizzleType === 'decimal'
    ? `decimal('${key}', { precision: ${prop.precision || 10}, scale: ${prop.scale || 2} })`
    : drizzleType === 'bigint'
    ? `bigint('${key}', { mode: 'number' })`
    : `${drizzleType}('${key}')`;

  const constraints: string[] = [];

  // Required fields
  if (required.includes(key)) constraints.push('notNull()');

  // Primary key
  if (key === 'id') constraints.push('primaryKey()');

  // Unique constraint
  if (prop.unique === true) constraints.push('unique()');

  // Default values
  if (prop.default !== undefined) {
    if (prop.default === 'now' && drizzleType === 'timestamp') {
      constraints.push('defaultNow()');
    } else if (prop.default === 'uuid_generate_v4()' && drizzleType === 'uuid') {
      constraints.push('default(sql`gen_random_uuid()`)');
    } else if (typeof prop.default === 'string') {
      constraints.push(`default('${prop.default}')`);
    } else if (typeof prop.default === 'number') {
      constraints.push(`default(${prop.default})`);
    } else if (typeof prop.default === 'boolean') {
      constraints.push(`default(${prop.default})`);
    }
  }

  return `  ${key}: ${[col, ...constraints].join('.')},`;
};

const processSchemaFile = (filePath: string, outputPath: string) => {
  try {
    const schema = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Basic schema validation
    if (!schema.properties || typeof schema.properties !== 'object') {
      console.warn(`⚠️  Warning: ${filePath} doesn't appear to be a valid JSON Schema`);
    }

    const name = path.basename(filePath, path.extname(filePath));
    const tableName = toPluralTableName(name);

    const properties = schema.properties || {};
    const required = schema.required || [];

    const columns = Object.entries(properties)
      .map(([key, prop]) => getColumnDefinition(key, prop, required, tableName))
      .join('\n');

    // 🎯 Generate indexes with pgvector support
    const indexes: string[] = [];
    let hasVectorIndex = false;

    // Check if we have an embedding field for vector index
    if (properties.embedding && properties.embedding.type === 'array') {
      hasVectorIndex = true;
      // Note: Vector indexes must be created manually via SQL migration
      // Drizzle doesn't yet support .op() or custom operator classes
      indexes.push(`
// NOTE: Vector index must be created manually in a migration SQL file
// Add this to your migration:
//
// CREATE INDEX ${tableName}_embedding_idx ON ${tableName}
//   USING ivfflat (embedding vector_cosine_ops)
//   WITH (lists = 274);
//
// Where lists = sqrt(row_count) ≈ 274 for ~75k documents`);
    }

    // Standard indexes from schema
    if (schema.indexes && Array.isArray(schema.indexes)) {
      schema.indexes.forEach((index: string | string[]) => {
        if (typeof index === 'string') {
          indexes.push(`export const ${tableName}_${index}_idx = index('${tableName}_${index}_idx').on(${tableName}.${index});`);
        } else if (Array.isArray(index)) {
          const indexName = index.join('_');
          const indexColumns = index.map(col => `${tableName}.${col}`).join(', ');
          indexes.push(`export const ${tableName}_${indexName}_idx = index('${tableName}_${indexName}_idx').on(${indexColumns});`);
        }
      });
    }

    // 🎯 Determine imports based on what's actually used
    const imports = [
      'pgTable', 'text', 'integer', 'boolean', 'varchar', 'json', 'timestamp',
      'date', 'uuid', 'decimal', 'bigint', 'index'
    ];

    // Add vector import if we have embedding field
    if (hasVectorIndex) {
      imports.push('vector');
    }

    const out = `import { ${imports.join(', ')} } from 'drizzle-orm/pg-core';\n\nexport const ${tableName} = pgTable('${tableName}', {\n${columns}\n});\n${indexes.length > 0 ? '\n' + indexes.join('\n\n') + '\n' : ''}`;

    fs.writeFileSync(path.join(outputPath, `${tableName}.drizzle.ts`), out);
    console.log(`✅ Converted: ${filePath} → ${tableName}.drizzle.ts${hasVectorIndex ? ' (with pgvector support)' : ''}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error instanceof Error ? error.message : error);
  }
};

const convertSchemasInFolder = (inputDir: string, outputDir: string) => {
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.json'));
  console.log(`\n📦 Converting JSON schemas to Drizzle table definitions...`);
  console.log(`📂 Input: ${inputDir}`);
  console.log(`📂 Output: ${outputDir}`);
  console.log(`📁 Found ${files.length} JSON schema file(s)\n`);

  for (const file of files) {
    const fullPath = path.join(inputDir, file);
    processSchemaFile(fullPath, outputDir);
  }

  console.log(`\n✨ Schema conversion complete!\n`);
};

// CLI usage: tsx json-to-drizzle.ts ./schemas ./drizzle
// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, inputDir, outputDir] = process.argv;
  if (!inputDir || !outputDir) {
    console.error('Usage: tsx json-to-drizzle.ts <input-folder> <output-folder>');
    process.exit(1);
  }
  convertSchemasInFolder(inputDir, outputDir);
}

export { convertSchemasInFolder };
