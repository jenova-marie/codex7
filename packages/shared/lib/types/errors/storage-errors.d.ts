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
