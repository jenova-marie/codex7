/**
 * Codex7 - Documentation Indexing Service
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
