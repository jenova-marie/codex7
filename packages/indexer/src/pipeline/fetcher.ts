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
