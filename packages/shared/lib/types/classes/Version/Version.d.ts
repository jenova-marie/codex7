import { version } from '../../models/version';
import { type VersionResult } from '../../errors';
/**
 * Business logic class for Version domain entity
 * Extends plain model with methods and validation
 */
export declare class Version extends version {
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
    validate(): VersionResult<boolean>;
    /**
     * Create a new Version instance with defaults
     */
    static create(data: {
        libraryId: string;
        versionString: string;
        gitCommitSha?: string;
        releaseDate?: number;
        isLatest?: boolean;
    }): VersionResult<Version>;
    /**
     * Update version fields and refresh timestamp
     */
    update(data: Partial<Omit<version, 'id' | 'indexed'>>): VersionResult<Version>;
    /**
     * Mark this version as indexed with document count
     */
    markIndexed(documentCount: number): VersionResult<Version>;
    /**
     * Mark this version as the latest
     */
    markAsLatest(): VersionResult<Version>;
    /**
     * Deprecate this version
     */
    deprecate(): VersionResult<Version>;
}
