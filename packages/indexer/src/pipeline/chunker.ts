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
