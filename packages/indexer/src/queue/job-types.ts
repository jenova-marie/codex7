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
 * 🎯 Job Type Definitions
 *
 * Defines all job types for the indexing queue.
 * Phase 0: Complete type definitions, no implementation yet.
 */

/**
 * Source types that can be indexed
 */
export enum SourceType {
  GitHub = 'github',
  Web = 'web',
  PDF = 'pdf',
}

/**
 * Base job data interface
 */
export interface BaseJobData {
  libraryId: string;
  source: string; // URL or path
  sourceType: SourceType;
  options?: Record<string, unknown>;
}

/**
 * GitHub repository indexing job
 */
export interface GitHubJobData extends BaseJobData {
  sourceType: SourceType.GitHub;
  branch?: string;
  path?: string; // Subdirectory to index
}

/**
 * Web scraping job
 */
export interface WebJobData extends BaseJobData {
  sourceType: SourceType.Web;
  maxDepth?: number;
}

/**
 * PDF parsing job
 */
export interface PDFJobData extends BaseJobData {
  sourceType: SourceType.PDF;
}

/**
 * Union of all job data types
 */
export type IndexJobData = GitHubJobData | WebJobData | PDFJobData;

/**
 * Job result data
 */
export interface JobResult {
  success: boolean;
  documentsIndexed: number;
  error?: string;
}
