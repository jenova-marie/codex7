/**
 * 📚 Library-related type definitions
 */
import type { SOURCE_TYPES } from '../constants.js';
/**
 * Unique identifier for a library
 *
 * @example '/vercel/next.js'
 * @example '/vercel/next.js/v14.0.0'
 */
export type LibraryIdentifier = string;
/**
 * Parsed library ID components
 */
export interface LibraryId {
    /** Organization or author name */
    org: string;
    /** Project/library name */
    project: string;
    /** Optional version specifier */
    version?: string;
}
/**
 * Library metadata stored in the database
 */
export interface Library {
    /** Unique identifier (UUID) */
    id: string;
    /** Human-readable library name */
    name: string;
    /** Unique identifier (e.g., '/vercel/next.js') */
    identifier: LibraryIdentifier;
    /** Repository URL (if applicable) */
    repositoryUrl?: string;
    /** Homepage URL */
    homepageUrl?: string;
    /** Library description */
    description?: string;
    /** Trust score (1-10) */
    trustScore: number;
    /** Additional metadata */
    metadata: Record<string, unknown>;
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
}
/**
 * Library version information
 */
export interface LibraryVersion {
    /** Unique identifier (UUID) */
    id: string;
    /** Parent library ID */
    libraryId: string;
    /** Version string (e.g., 'v18.2.0', 'latest') */
    versionString: string;
    /** Git commit SHA (if applicable) */
    gitCommitSha?: string;
    /** Release date */
    releaseDate?: Date;
    /** Whether this is the latest version */
    isLatest: boolean;
    /** Creation timestamp */
    createdAt: Date;
}
/**
 * Documentation source configuration
 */
export interface DocumentationSource {
    /** Source type */
    type: (typeof SOURCE_TYPES)[keyof typeof SOURCE_TYPES];
    /** Source URL */
    url: string;
    /** Optional authentication token */
    authToken?: string;
    /** Include patterns (glob) */
    include?: string[];
    /** Exclude patterns (glob) */
    exclude?: string[];
    /** Additional source-specific options */
    options?: Record<string, unknown>;
}
/**
 * Request to add a new library
 */
export interface AddLibraryRequest {
    /** Library name */
    name: string;
    /** Documentation source configuration */
    source: DocumentationSource;
    /** Optional library description */
    description?: string;
    /** Optional homepage URL */
    homepageUrl?: string;
}
/**
 * Response when adding a library
 */
export interface AddLibraryResponse {
    /** Created library */
    library: Library;
    /** Indexing job ID */
    jobId: string;
    /** Estimated completion time */
    estimatedCompletionTime?: Date;
}
