/**
 * 🔌 Storage Adapter Interface
 *
 * Abstract interface that all storage adapters must implement.
 * This allows Codex7 to support multiple database backends (PostgreSQL, SQLite, Qdrant, etc.)
 */
import type { Result } from '@jenova-marie/ts-rust-result';
import type { Document, Library, LibraryVersion, IndexingJob } from '../types/index.js';
import type { SearchOptions, SearchResult, VectorSearchParams } from '../types/search.js';
import type { StorageConfig, StorageStats, MigrationInfo } from './types.js';
/**
 * 📦 Main storage adapter interface
 *
 * All storage adapters must implement this interface to ensure compatibility
 * with the rest of the Codex7 system.
 */
export interface StorageAdapter {
    /**
     * 🔧 Initialize the storage adapter
     */
    initialize(config: StorageConfig): Promise<Result<void, Error>>;
    /**
     * 🔌 Close the storage connection
     */
    close(): Promise<Result<void, Error>>;
    /**
     * 🏥 Health check
     */
    healthCheck(): Promise<Result<boolean, Error>>;
    /**
     * 📊 Get storage statistics
     */
    getStats(): Promise<Result<StorageStats, Error>>;
    /**
     * 🔄 Run database migrations
     */
    migrate(): Promise<Result<MigrationInfo[], Error>>;
    /**
     * Create a new library
     */
    createLibrary(library: Omit<Library, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Library, Error>>;
    /**
     * Get library by ID
     */
    getLibrary(id: string): Promise<Result<Library | null, Error>>;
    /**
     * Get library by identifier
     */
    getLibraryByIdentifier(identifier: string): Promise<Result<Library | null, Error>>;
    /**
     * List all libraries
     */
    listLibraries(options?: {
        limit?: number;
        offset?: number;
    }): Promise<Result<Library[], Error>>;
    /**
     * Update library
     */
    updateLibrary(id: string, updates: Partial<Library>): Promise<Result<Library, Error>>;
    /**
     * Delete library (and all associated data)
     */
    deleteLibrary(id: string): Promise<Result<void, Error>>;
    /**
     * Search libraries by name or description
     */
    searchLibraries(query: string): Promise<Result<Library[], Error>>;
    /**
     * Create a new version
     */
    createVersion(version: Omit<LibraryVersion, 'id' | 'createdAt'>): Promise<Result<LibraryVersion, Error>>;
    /**
     * Get version by ID
     */
    getVersion(id: string): Promise<Result<LibraryVersion | null, Error>>;
    /**
     * List versions for a library
     */
    listVersions(libraryId: string): Promise<Result<LibraryVersion[], Error>>;
    /**
     * Get latest version for a library
     */
    getLatestVersion(libraryId: string): Promise<Result<LibraryVersion | null, Error>>;
    /**
     * Update version
     */
    updateVersion(id: string, updates: Partial<LibraryVersion>): Promise<Result<LibraryVersion, Error>>;
    /**
     * Delete version (and all associated documents)
     */
    deleteVersion(id: string): Promise<Result<void, Error>>;
    /**
     * Index a document with its embedding
     */
    indexDocument(document: Omit<Document, 'id' | 'indexedAt' | 'updatedAt'>): Promise<Result<Document, Error>>;
    /**
     * Batch index multiple documents
     */
    indexDocuments(documents: Array<Omit<Document, 'id' | 'indexedAt' | 'updatedAt'>>): Promise<Result<Document[], Error>>;
    /**
     * Get document by ID
     */
    getDocument(id: string): Promise<Result<Document | null, Error>>;
    /**
     * Delete document
     */
    deleteDocument(id: string): Promise<Result<void, Error>>;
    /**
     * Delete all documents for a version
     */
    deleteDocumentsByVersion(versionId: string): Promise<Result<number, Error>>;
    /**
     * Check if document exists by content hash
     */
    documentExistsByHash(contentHash: string): Promise<Result<boolean, Error>>;
    /**
     * Perform semantic search using vector similarity
     */
    semanticSearch(options: SearchOptions): Promise<Result<SearchResult[], Error>>;
    /**
     * Perform vector similarity search (low-level)
     */
    vectorSearch(params: VectorSearchParams): Promise<Result<SearchResult[], Error>>;
    /**
     * Perform full-text search (keyword-based)
     */
    fullTextSearch(options: SearchOptions): Promise<Result<SearchResult[], Error>>;
    /**
     * Hybrid search (combines vector + full-text)
     */
    hybridSearch(options: SearchOptions): Promise<Result<SearchResult[], Error>>;
    /**
     * Create indexing job
     */
    createIndexingJob(job: Omit<IndexingJob, 'id' | 'startedAt'>): Promise<Result<IndexingJob, Error>>;
    /**
     * Get indexing job by ID
     */
    getIndexingJob(id: string): Promise<Result<IndexingJob | null, Error>>;
    /**
     * Update indexing job
     */
    updateIndexingJob(id: string, updates: Partial<IndexingJob>): Promise<Result<IndexingJob, Error>>;
    /**
     * List indexing jobs
     */
    listIndexingJobs(options?: {
        limit?: number;
        offset?: number;
    }): Promise<Result<IndexingJob[], Error>>;
}
/**
 * 🏭 Storage adapter factory interface
 */
export interface StorageAdapterFactory {
    /**
     * Create a storage adapter instance
     */
    createAdapter(config: StorageConfig): Promise<Result<StorageAdapter, Error>>;
    /**
     * Get adapter name
     */
    getName(): string;
    /**
     * Check if configuration is valid
     */
    validateConfig(config: StorageConfig): Result<boolean, Error>;
}
