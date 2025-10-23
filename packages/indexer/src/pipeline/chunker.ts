/**
 * ✂️ Document Chunker
 *
 * Splits documents into structured chunks.
 * Phase 0: STUB - Returns empty array.
 */

import { logger } from '../utils/logger.js';
import type { RawDocument } from './fetcher.js';

/**
 * Document chunk
 */
export interface DocumentChunk {
  title: string;
  content: string;
  hierarchy: string[];
  sectionLevel: number;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * Chunk documents by structure
 *
 * STUB: Returns empty array
 */
export async function chunkDocuments(documents: RawDocument[]): Promise<DocumentChunk[]> {
  logger.info({ count: documents.length }, '✂️ Chunking documents (STUB)');

  // TODO Phase 1: Implement structural chunking
  // - Parse markdown AST
  // - Split by headers
  // - Preserve hierarchy

  return [];
}
