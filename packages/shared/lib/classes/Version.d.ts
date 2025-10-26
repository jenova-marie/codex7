import { type Result } from '@jenova-marie/ts-rust-result';
/**
 * Version metadata stored in database
 */
export interface VersionMetadata {
    /** Release notes URL */
    releaseNotesUrl?: string;
    /** Breaking changes flag */
    hasBreakingChanges?: boolean;
    /** Additional custom metadata */
    [key: string]: unknown;
}
/**
 * Input for creating a new version
 */
export interface CreateVersionInput {
    libraryId: string;
    versionString: string;
    gitCommitSha?: string;
    releaseDate?: number;
    isLatest?: boolean;
    metadata?: VersionMetadata;
}
/**
 * Version domain entity
 * Represents a specific version of a library (e.g., React v18.2.0, Next.js v14.0.0)
 */
export declare class Version {
    /** Unique identifier  */
    id: string;
    /** Parent library ID */
    libraryId: string;
    /** Version string (e.g., 'v18.2.0', 'latest') */
    versionString: string;
    /** Normalized version (semver format: 1.2.3) */
    versionNormalized: string;
    /** Git commit SHA (if applicable) */
    gitCommitSha: string;
    /** Release date (Unix ms) */
    releaseDate: number;
    /** Whether this is the latest version */
    isLatest: boolean;
    /** Whether this version is deprecated */
    isDeprecated: boolean;
    /** Number of indexed documents */
    documentCount: number;
    /** Additional metadata */
    metadata: VersionMetadata;
    /** Indexing timestamp (Unix ms) */
    indexed: number;
    /** Last update timestamp (Unix ms) */
    updated: number;
    /**
     * Check if version data is stale (not updated in 7 days)
     */
    isStale(): boolean;
    /**
     * Check if version is ready for indexing
     */
    isReadyForIndexing(): boolean;
    /**
     * Normalize version string to semver format
     * Example: "v1.2.3" -> "1.2.3", "1.2" -> "1.2.0"
     */
    normalizeVersionString(): string;
    /**
     * Validate version has minimum required fields
     */
    validate(): Result<boolean, Error>;
    /**
     * Create a new Version instance with defaults
     */
    static create(data: CreateVersionInput): Result<Version, Error>;
    /**
     * Update version fields and refresh timestamp
     */
    update(data: Partial<Omit<Version, 'id' | 'indexed'>>): Result<Version, Error>;
    /**
     * Mark this version as indexed with document count
     */
    markIndexed(documentCount: number): Result<Version, Error>;
    /**
     * Mark this version as the latest
     */
    markAsLatest(): Result<Version, Error>;
    /**
     * Deprecate this version
     */
    deprecate(): Result<Version, Error>;
    /**
     * Convert to plain object (for JSON serialization, DB storage)
     */
    toJSON(): Record<string, unknown>;
    /**
     * Create instance from plain object (from DB, JSON)
     */
    static fromJSON(data: Record<string, unknown>): Result<Version, Error>;
}
