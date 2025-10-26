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
