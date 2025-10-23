/**
 * 💾 Document Storer
 *
 * Stores documents in database.
 * Phase 0: STUB - Just logs, doesn't actually store.
 */

import { logger } from '../utils/logger.js';
import type { EmbeddedDocument } from './embedder.js';

/**
 * Store documents in database
 *
 * STUB: Just logs, doesn't actually store
 */
export async function storeDocuments(documents: EmbeddedDocument[]): Promise<void> {
  logger.info({ count: documents.length }, '💾 Storing documents (STUB)');

  // TODO Phase 1: Use storage adapter
  // - Batch inserts
  // - Deduplication by content hash
  // - Transaction handling
}
