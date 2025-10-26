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
  /** Migration name/filename */
  name: string;

  /** Executed timestamp (Unix ms) */
  executedAt: number;

  /** Whether migration succeeded */
  success: boolean;

  /** Error message (if failed) */
  error?: string;
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

/**
 * Indexing job status
 */
export type IndexingJobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

/**
 * Document processing job
 */
export interface IndexingJob {
  /** Job ID */
  id: string;

  /** Library ID being indexed */
  libraryId: string;

  /** Version ID being indexed */
  versionId: string;

  /** Current status */
  status: IndexingJobStatus;

  /** Total documents to process */
  totalDocuments?: number;

  /** Documents processed so far */
  processedDocuments: number;

  /** Documents that failed */
  failedDocuments: number;

  /** Error message (if failed) */
  error?: string;

  /** Job start time (Unix ms) */
  startedAt: number;

  /** Job completion time (Unix ms) */
  completedAt?: number;

  /** Job metadata */
  metadata: Record<string, unknown>;
}
