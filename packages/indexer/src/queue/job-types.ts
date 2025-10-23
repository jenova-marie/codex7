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
