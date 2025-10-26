/**
 * Codex7 - Shared Types, Models, and Utilities
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
// ts-to-json.ts
// Generate JSON Schema files from TypeScript model files using `typescript-json-schema`
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
const generateSchema = (tsPath, typeName, outFile) => {
    try {
        const command = `npx typescript-json-schema tsconfig.schema.json ${typeName} --required --noExtraProps --strictNullChecks --out ${outFile}`;
        execSync(command, { stdio: 'inherit' });
        // Add codex7-required metadata to the generated schema
        const schema = JSON.parse(fs.readFileSync(outFile, 'utf-8'));
        schema.version = 0;
        schema.primaryKey = 'id';
        schema.additionalProperties = false;
        fs.writeFileSync(outFile, JSON.stringify(schema, null, 2));
    }
    catch (error) {
        console.error(`❌ Error generating schema for ${typeName}:`, error);
        console.log(`\n🔍 Troubleshooting tips for ${typeName}:`);
        console.log('1. Check for complex default values like object literals {}');
        console.log('2. Check for enum values as defaults');
        console.log('3. Check for union types with complex initializers');
        console.log('4. Consider using simpler default values or removing defaults');
        throw error;
    }
};
const convertTsFilesToSchemas = (inputDir, outputDir) => {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }
    // Only process model TypeScript files, exclude index files
    const tsFiles = fs.readdirSync(inputDir)
        .filter(f => f.endsWith('.ts'))
        .filter(f => f !== 'index.ts');
    console.log(`\n📦 Converting TypeScript models to JSON schemas...`);
    console.log(`📂 Input: ${inputDir}`);
    console.log(`📂 Output: ${outputDir}\n`);
    for (const file of tsFiles) {
        const fullPath = path.join(inputDir, file);
        const fileName = path.basename(file, '.ts');
        const typeName = fileName;
        const outputPath = path.join(outputDir, `${fileName}.json`);
        console.log(`🔄 Generating schema for ${typeName}...`);
        try {
            generateSchema(fullPath, typeName, outputPath);
            console.log(`✅ Generated ${outputPath}`);
        }
        catch (error) {
            console.error(`❌ Failed to generate schema for ${typeName}`);
            // Continue with other files even if one fails
        }
    }
    console.log(`\n✨ Schema generation complete!\n`);
};
// CLI usage: tsx ts-to-json.ts ./input ./output
// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
    const [, , inputDir, outputDir] = process.argv;
    if (!inputDir || !outputDir) {
        console.error('Usage: tsx ts-to-json.ts <input-folder> <output-folder>');
        process.exit(1);
    }
    convertTsFilesToSchemas(inputDir, outputDir);
}
export { convertTsFilesToSchemas };
//# sourceMappingURL=ts-to-json.js.map