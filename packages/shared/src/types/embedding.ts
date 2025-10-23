/**
 * 🎯 Embedding-related type definitions
 */

import type { EMBEDDING_PROVIDERS } from '../constants.js';

/**
 * Embedding provider configuration
 */
export interface EmbeddingProvider {
  /** Provider name */
  provider: (typeof EMBEDDING_PROVIDERS)[keyof typeof EMBEDDING_PROVIDERS];

  /** Model name */
  model: string;

  /** Embedding dimensions */
  dimensions: number;

  /** API configuration */
  config: Record<string, unknown>;
}

/**
 * Request to generate embeddings
 */
export interface EmbeddingRequest {
  /** Text to embed */
  texts: string[];

  /** Provider configuration */
  provider?: Partial<EmbeddingProvider>;
}

/**
 * Response with generated embeddings
 */
export interface EmbeddingResponse {
  /** Generated embeddings */
  embeddings: number[][];

  /** Model used */
  model: string;

  /** Token usage */
  usage: {
    /** Prompt tokens */
    promptTokens: number;

    /** Total tokens */
    totalTokens: number;
  };
}

/**
 * Embedding generation job
 */
export interface EmbeddingJob {
  /** Job ID */
  id: string;

  /** Document IDs to embed */
  documentIds: string[];

  /** Current status */
  status: 'pending' | 'processing' | 'completed' | 'failed';

  /** Progress (0-1) */
  progress: number;

  /** Error message (if failed) */
  error?: string;

  /** Created timestamp */
  createdAt: Date;

  /** Completed timestamp */
  completedAt?: Date;
}
