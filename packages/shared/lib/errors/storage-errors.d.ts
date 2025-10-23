/**
 * 💾 Storage-Related Errors
 *
 * Errors specific to database and storage operations
 *
 * @module @codex7/shared/errors
 */
import { Codex7Error } from './base.js';
/**
 * Thrown when a requested library is not found in storage
 */
export declare class LibraryNotFoundError extends Codex7Error {
    constructor(libraryId: string);
}
/**
 * Thrown when a requested document is not found in storage
 */
export declare class DocumentNotFoundError extends Codex7Error {
    constructor(documentId: string);
}
/**
 * Thrown when a requested version is not found
 */
export declare class VersionNotFoundError extends Codex7Error {
    constructor(versionId: string);
}
/**
 * Thrown when a database query fails
 */
export declare class DatabaseQueryError extends Codex7Error {
    constructor(query: string, originalError: Error);
}
/**
 * Thrown when storage connection fails
 */
export declare class StorageConnectionError extends Codex7Error {
    constructor(details: string);
}
/**
 * Thrown when attempting to create a duplicate entry
 */
export declare class DuplicateEntryError extends Codex7Error {
    constructor(entity: string, identifier: string);
}
/**
 * Thrown when a vector search operation fails
 */
export declare class VectorSearchError extends Codex7Error {
    constructor(details: string, originalError?: Error);
}
/**
 * Thrown when storage initialization fails
 */
export declare class StorageInitializationError extends Codex7Error {
    constructor(details: string, originalError?: Error);
}
