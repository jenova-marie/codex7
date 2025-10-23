/**
 * 📄 Document-related type definitions
 */

import type { SOURCE_TYPES, DOCUMENT_STATUS } from '../constants.js';

/**
 * A chunk of documentation with its vector embedding
 */
export interface Document {
  /** Unique identifier (UUID) */
  id: string;

  /** Parent version ID */
  versionId: string;

  /** Document title/heading */
  title: string;

  /** Text content */
  content: string;

  /** Content hash (SHA-256) for deduplication */
  contentHash: string;

  /** Vector embedding */
  embedding: number[];

  /** Position in parent document */
  chunkIndex?: number;

  /** Parent document ID (for hierarchical docs) */
  parentDocId?: string;

  /** Source URL */
  url?: string;

  /** Source type */
  sourceType: (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];

  /** Language code (e.g., 'en', 'es') */
  language: string;

  /** Additional metadata */
  metadata: DocumentMetadata;

  /** Indexing timestamp */
  indexedAt: Date;

  /** Last update timestamp */
  updatedAt: Date;
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  /** Section hierarchy (e.g., ['Getting Started', 'Installation']) */
  hierarchy?: string[];

  /** Header level (1-6) */
  headerLevel?: number;

  /** Whether this chunk contains code */
  hasCode?: boolean;

  /** Programming language (if code block) */
  codeLanguage?: string;

  /** Tags or keywords */
  tags?: string[];

  /** Any additional custom metadata */
  [key: string]: unknown;
}

/**
 * Document processing job status
 */
export interface IndexingJob {
  /** Job ID */
  id: string;

  /** Library ID being indexed */
  libraryId: string;

  /** Version ID being indexed */
  versionId: string;

  /** Current status */
  status: (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

  /** Total documents to process */
  totalDocuments?: number;

  /** Documents processed so far */
  processedDocuments: number;

  /** Documents that failed */
  failedDocuments: number;

  /** Error message (if failed) */
  error?: string;

  /** Job start time */
  startedAt: Date;

  /** Job completion time */
  completedAt?: Date;

  /** Job metadata */
  metadata: Record<string, unknown>;
}

/**
 * Raw document before processing
 */
export interface RawDocument {
  /** Source URL */
  url: string;

  /** Raw content */
  content: string;

  /** Content type (e.g., 'text/markdown', 'text/html') */
  contentType: string;

  /** Metadata */
  metadata: Record<string, unknown>;
}

/**
 * Chunking strategy configuration
 */
export interface ChunkingConfig {
  /** Strategy type */
  strategy: 'fixed' | 'structural' | 'semantic' | 'hybrid';

  /** Maximum chunk size (in characters) */
  maxChunkSize: number;

  /** Overlap between chunks */
  chunkOverlap: number;

  /** Whether to preserve hierarchy */
  preserveHierarchy: boolean;

  /** Additional strategy-specific options */
  options?: Record<string, unknown>;
}
