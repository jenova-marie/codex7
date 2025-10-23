/**
 * ✨ Embedding Generator
 *
 * Generates vector embeddings for document chunks.
 * Phase 0: STUB - Returns chunks with empty embeddings.
 */

import { logger } from '../utils/logger.js';
import type { DocumentChunk } from './chunker.js';

/**
 * Document chunk with embedding
 */
export interface EmbeddedDocument extends DocumentChunk {
  embedding: number[];
}

/**
 * Generate embeddings for document chunks
 *
 * STUB: Returns chunks with empty embeddings
 */
export async function generateEmbeddings(chunks: DocumentChunk[]): Promise<EmbeddedDocument[]> {
  logger.info({ count: chunks.length }, '✨ Generating embeddings (STUB)');

  // TODO Phase 1: Call OpenAI embeddings API
  // - Batch chunks for efficiency
  // - Handle rate limits
  // - Retry on failure

  return chunks.map((chunk) => ({
    ...chunk,
    embedding: [], // Placeholder
  }));
}
