#!/usr/bin/env tsx
// run-migrations.ts
// Automated migration runner for Codex7 PostgreSQL + pgvector
// Runs all SQL migration files in order

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import postgres from 'postgres';

const MIGRATIONS_DIR = join(import.meta.dirname, '../migrations');

async function runMigrations() {
  console.log('🚀 Codex7 Migration Runner\n');

  // Get connection string from environment
  const connectionString = process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'codex7'}`;

  console.log(`📦 Connecting to database...`);
  const sql = postgres(connectionString, { max: 1 });

  try {
    // Test connection
    await sql`SELECT version()`;
    console.log(`✅ Connected successfully\n`);

    // Get all .sql files in migrations directory
    const files = await readdir(MIGRATIONS_DIR);
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Alphabetical order (0000_, 0001_, etc.)

    if (sqlFiles.length === 0) {
      console.log('⚠️  No migration files found');
      return;
    }

    console.log(`📋 Found ${sqlFiles.length} migration file(s):\n`);

    // Create migrations tracking table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS _drizzle_migrations (
        id serial PRIMARY KEY,
        filename text NOT NULL UNIQUE,
        executed_at timestamp DEFAULT now()
      );
    `;

    // Get already executed migrations
    const executed = await sql`
      SELECT filename FROM _drizzle_migrations;
    `;
    const executedSet = new Set(executed.map(row => row.filename));

    // Run pending migrations
    for (const file of sqlFiles) {
      if (executedSet.has(file)) {
        console.log(`⏭️  Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`🔄 Running ${file}...`);

      const filePath = join(MIGRATIONS_DIR, file);
      const sqlContent = await readFile(filePath, 'utf-8');

      try {
        // Execute migration
        await sql.unsafe(sqlContent);

        // Record execution
        await sql`
          INSERT INTO _drizzle_migrations (filename)
          VALUES (${file});
        `;

        console.log(`✅ Completed ${file}\n`);
      } catch (error) {
        console.error(`❌ Failed to execute ${file}:`);
        if (error instanceof Error) {
          console.error(error.message);
        }
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    if (error instanceof Error) {
      console.error(error.message);
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Ensure PostgreSQL is running (docker compose ps)');
      console.error('   2. Check DATABASE_URL or POSTGRES_* environment variables');
      console.error('   3. Verify pgvector extension is enabled\n');
    }
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
