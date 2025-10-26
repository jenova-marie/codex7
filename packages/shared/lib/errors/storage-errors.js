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
export class LibraryNotFoundError extends Codex7Error {
    constructor(libraryId) {
        super(`Library not found: ${libraryId}`, 'LIBRARY_NOT_FOUND', 404, { libraryId });
    }
}
/**
 * Thrown when a requested document is not found in storage
 */
export class DocumentNotFoundError extends Codex7Error {
    constructor(documentId) {
        super(`Document not found: ${documentId}`, 'DOCUMENT_NOT_FOUND', 404, { documentId });
    }
}
/**
 * Thrown when a requested version is not found
 */
export class VersionNotFoundError extends Codex7Error {
    constructor(versionId) {
        super(`Version not found: ${versionId}`, 'VERSION_NOT_FOUND', 404, { versionId });
    }
}
/**
 * Thrown when a database query fails
 */
export class DatabaseQueryError extends Codex7Error {
    constructor(query, originalError) {
        super(`Database query failed: ${originalError.message}`, 'DATABASE_QUERY_ERROR', 500, { query, originalError: originalError.message });
    }
}
/**
 * Thrown when storage connection fails
 */
export class StorageConnectionError extends Codex7Error {
    constructor(details) {
        super(`Failed to connect to storage: ${details}`, 'STORAGE_CONNECTION_ERROR', 503, { details });
    }
}
/**
 * Thrown when attempting to create a duplicate entry
 */
export class DuplicateEntryError extends Codex7Error {
    constructor(entity, identifier) {
        super(`Duplicate ${entity} entry: ${identifier}`, 'DUPLICATE_ENTRY', 409, { entity, identifier });
    }
}
/**
 * Thrown when a vector search operation fails
 */
export class VectorSearchError extends Codex7Error {
    constructor(details, originalError) {
        super(`Vector search failed: ${details}`, 'VECTOR_SEARCH_ERROR', 500, { details, originalError: originalError?.message });
    }
}
/**
 * Thrown when storage initialization fails
 */
export class StorageInitializationError extends Codex7Error {
    constructor(details, originalError) {
        super(`Storage initialization failed: ${details}`, 'STORAGE_INITIALIZATION_ERROR', 503, { details, originalError: originalError?.message });
    }
}
//# sourceMappingURL=storage-errors.js.map