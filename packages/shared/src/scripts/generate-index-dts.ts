// generate-index-dts.ts
// Auto-generate index.d.ts barrel export files for TypeScript declaration files

import fs from 'fs';
import path from 'path';

/**
 * Recursively walk a directory and collect all .d.ts files
 */
function walkDir(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, fileList);
    } else if (file.endsWith('.d.ts') && file !== 'index.d.ts') {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

/**
 * Convert absolute path to relative import path
 */
function toRelativeImport(from: string, to: string): string {
  let rel = path.relative(path.dirname(from), to).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel.replace(/\.d\.ts$/, '');
}

/**
 * Generate index.d.ts file with barrel exports
 */
function generateIndexFile(inputDir: string, outputFile: string) {
  const files = walkDir(inputDir);
  const exports = files.map(file => `export * from '${toRelativeImport(outputFile, file)}';`);

  fs.writeFileSync(outputFile, exports.join('\n') + '\n', 'utf-8');

  console.log(`✅ Generated ${outputFile} with ${files.length} exports.`);
}

// CLI usage: tsx generate-index-dts.ts <input-dir> <output-file>
// ESM equivalent of require.main === module
if (import.meta.url === `file://${process.argv[1]}`) {
  const [,, inputDir, outputFile] = process.argv;
  if (!inputDir) {
    // Default to lib/types/index.d.ts
    const defaultInputDir = 'lib/types';
    const defaultOutputFile = path.join(defaultInputDir, 'index.d.ts');
    generateIndexFile(defaultInputDir, defaultOutputFile);
  } else {
    const finalOutputFile = outputFile || path.join(inputDir, 'index.d.ts');
    generateIndexFile(inputDir, finalOutputFile);
  }
}

export { generateIndexFile };
