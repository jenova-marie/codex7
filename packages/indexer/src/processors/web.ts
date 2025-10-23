/**
 * 🌐 Web Documentation Processor
 *
 * Scrapes documentation from web sites.
 * Phase 0: STUB - Returns empty array.
 */

import { logger } from '../utils/logger.js';
import type { WebJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Process web documentation site
 *
 * STUB: Returns empty array
 */
export async function processWeb(jobData: WebJobData): Promise<RawDocument[]> {
  logger.info({ jobData }, '🌐 Processing web site (STUB)');

  // TODO Phase 1:
  // 1. Use Playwright to scrape pages
  // 2. Respect robots.txt
  // 3. Extract text content
  // 4. Return raw documents

  return [];
}
