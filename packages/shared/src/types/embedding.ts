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
