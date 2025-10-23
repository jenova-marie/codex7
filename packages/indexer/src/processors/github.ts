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
