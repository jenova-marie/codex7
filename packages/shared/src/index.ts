// Models (plain data classes)
export { library } from './models/library';
export { version } from './models/version';
export { document } from './models/document';

// Business logic classes
export { Library } from './classes/Library/Library';
export { Version } from './classes/Version/Version';
export { Document } from './classes/Document/Document';

// Decorators
export { addFunction, addFunctions } from './decorators/function-injection';

// Error types and Result patterns
export type { CodexError } from './errors/types';
export type { CodexResult, LibraryResult, VersionResult, DocumentResult } from './errors/results';
export { ok, err } from './errors/results';

// Scripts (for build pipeline)
export { convertTsFilesToSchemas } from './scripts/ts-to-json';
export { generateIndexFile } from './scripts/generate-index-dts';
