/**
 * 📄 PDF Documentation Processor
 *
 * Parses documentation from PDF files.
 * Phase 0: STUB - Returns empty array.
 */

import { logger } from '../utils/logger.js';
import type { PDFJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Process PDF documentation
 *
 * STUB: Returns empty array
 */
export async function processPDF(jobData: PDFJobData): Promise<RawDocument[]> {
  logger.info({ jobData }, '📄 Processing PDF (STUB)');

  // TODO Phase 1:
  // 1. Parse PDF file
  // 2. Extract text while preserving structure
  // 3. Return raw documents

  return [];
}
