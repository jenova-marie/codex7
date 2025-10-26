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
// generate-index-dts.ts
// Auto-generate index.d.ts barrel export files for TypeScript declaration files
import fs from 'fs';
import path from 'path';
/**
 * Recursively walk a directory and collect all .d.ts files
 */
function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath, fileList);
        }
        else if (file.endsWith('.d.ts') && file !== 'index.d.ts') {
            fileList.push(fullPath);
        }
    }
    return fileList;
}
/**
 * Convert absolute path to relative import path
 */
function toRelativeImport(from, to) {
    let rel = path.relative(path.dirname(from), to).replace(/\\/g, '/');
    if (!rel.startsWith('.')) {
        rel = './' + rel;
    }
    return rel.replace(/\.d\.ts$/, '');
}
/**
 * Generate index.d.ts file with barrel exports
 */
function generateIndexFile(inputDir, outputFile) {
    const files = walkDir(inputDir);
    const exports = files.map(file => `export * from '${toRelativeImport(outputFile, file)}';`);
    fs.writeFileSync(outputFile, exports.join('\n') + '\n', 'utf-8');
    console.log(`✅ Generated ${outputFile} with ${files.length} exports.`);
}
// CLI usage: tsx generate-index-dts.ts <input-dir> <output-file>
// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
    const [, , inputDir, outputFile] = process.argv;
    if (!inputDir) {
        // Default to lib/types/index.d.ts
        const defaultInputDir = 'lib/types';
        const defaultOutputFile = path.join(defaultInputDir, 'index.d.ts');
        generateIndexFile(defaultInputDir, defaultOutputFile);
    }
    else {
        const finalOutputFile = outputFile || path.join(inputDir, 'index.d.ts');
        generateIndexFile(inputDir, finalOutputFile);
    }
}
export { generateIndexFile };
//# sourceMappingURL=generate-index-dts.js.map