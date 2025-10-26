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
 * 🐙 GitHub Repository Processor
 *
 * Fetches documentation from GitHub repositories.
 * Phase 0: STUB - Returns empty array.
 */

import { logger } from '../utils/logger.js';
import type { GitHubJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Process GitHub repository
 *
 * STUB: Returns empty array
 */
export async function processGitHub(jobData: GitHubJobData): Promise<RawDocument[]> {
  logger.info({ jobData }, '🐙 Processing GitHub repo (STUB)');

  // TODO Phase 1:
  // 1. Clone repository or use GitHub API
  // 2. Find documentation files (README.md, docs/*)
  // 3. Extract markdown content
  // 4. Return raw documents

  return [];
}
