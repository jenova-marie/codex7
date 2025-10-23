/**
 * 📥 Source Fetcher
 *
 * Coordinates fetching from different source types.
 * Phase 0: STUB - Returns empty array via processors.
 */

import { logger } from '../utils/logger.js';
import { processGitHub } from '../processors/github.js';
import { processWeb } from '../processors/web.js';
import { processPDF } from '../processors/pdf.js';
import { SourceType, type IndexJobData } from '../queue/job-types.js';

/**
 * Raw document from source
 */
export interface RawDocument {
  title: string;
  content: string;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * Fetch source and return raw documents
 *
 * STUB: Returns empty array
 */
export async function fetchSource(jobData: IndexJobData): Promise<RawDocument[]> {
  logger.info({ jobData }, '📥 Fetching source (STUB)');

  switch (jobData.sourceType) {
    case SourceType.GitHub:
      return processGitHub(jobData);

    case SourceType.Web:
      return processWeb(jobData);

    case SourceType.PDF:
      return processPDF(jobData);

    default:
      const unknownType = (jobData as { sourceType: string }).sourceType;
      throw new Error(`Unknown source type: ${unknownType}`);
  }
}
