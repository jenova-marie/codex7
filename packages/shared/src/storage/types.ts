/**
 * 💾 Storage-related type definitions
 */

/**
 * Storage backend types
 */
export type StorageBackend = 'postgres' | 'sqlite' | 'qdrant';

/**
 * Storage configuration
 */
export interface StorageConfig {
  /** Storage backend type */
  backend: StorageBackend;

  /** Connection string or URL */
  connectionUrl: string;

  /** Connection pool configuration */
  pool?: {
    min?: number;
    max?: number;
    idleTimeout?: number;
  };

  /** Backend-specific options */
  options?: Record<string, unknown>;
}

/**
 * Storage statistics
 */
export interface StorageStats {
  /** Total number of libraries */
  libraryCount: number;

  /** Total number of versions */
  versionCount: number;

  /** Total number of documents */
  documentCount: number;

  /** Total storage size (bytes) */
  storageSize: number;

  /** Average documents per library */
  avgDocumentsPerLibrary: number;

  /** Database-specific stats */
  backendStats?: Record<string, unknown>;
}

/**
 * Migration information
 */
export interface MigrationInfo {
  /** Migration name */
  name: string;

  /** Migration version */
  version: number;

  /** Applied timestamp */
  appliedAt: Date;

  /** Execution time (ms) */
  executionTime?: number;
}

/**
 * Transaction context
 */
export interface TransactionContext {
  /** Transaction ID */
  id: string;

  /** Commit the transaction */
  commit(): Promise<void>;

  /** Rollback the transaction */
  rollback(): Promise<void>;
}
