import { ok, err, type Result } from '@jenova-marie/ts-rust-result';
import { randomUUID } from 'node:crypto';

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
export class Version {
  /** Unique identifier  */
  id: string = '';

  /** Parent library ID */
  libraryId: string = '';

  /** Version string (e.g., 'v18.2.0', 'latest') */
  versionString: string = '';

  /** Normalized version (semver format: 1.2.3) */
  versionNormalized: string = '';

  /** Git commit SHA (if applicable) */
  gitCommitSha: string = '';

  /** Release date (Unix ms) */
  releaseDate: number = 0;

  /** Whether this is the latest version */
  isLatest: boolean = false;

  /** Whether this version is deprecated */
  isDeprecated: boolean = false;

  /** Number of indexed documents */
  documentCount: number = 0;

  /** Additional metadata */
  metadata: VersionMetadata = {};

  /** Indexing timestamp (Unix ms) */
  indexed: number = 0;

  /** Last update timestamp (Unix ms) */
  updated: number = 0;

  /**
   * Check if version data is stale (not updated in 7 days)
   */
  isStale(): boolean {
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - this.updated > sevenDaysMs;
  }

  /**
   * Check if version is ready for indexing
   */
  isReadyForIndexing(): boolean {
    return !this.isDeprecated && this.indexed === 0;
  }

  /**
   * Normalize version string to semver format
   * Example: "v1.2.3" -> "1.2.3", "1.2" -> "1.2.0"
   */
  normalizeVersionString(): string {
    let normalized = this.versionString.replace(/^v/, '');
    const parts = normalized.split('.');

    // Ensure at least major.minor.patch
    while (parts.length < 3) {
      parts.push('0');
    }

    return parts.slice(0, 3).join('.');
  }

  /**
   * Validate version has minimum required fields
   */
  validate(): Result<boolean, Error> {
    if (!this.libraryId) {
      return err(new Error('Version must be associated with a library'));
    }

    if (!this.versionString) {
      return err(new Error('Version must have a version string'));
    }

    return ok(true);
  }

  /**
   * Create a new Version instance with defaults
   */
  static create(data: CreateVersionInput): Result<Version, Error> {
    try {
      const ver = new Version();

      ver.id = randomUUID();

      const now = Date.now();
      ver.indexed = now;
      ver.updated = now;

      // Set required fields
      ver.libraryId = data.libraryId;
      ver.versionString = data.versionString;
      ver.versionNormalized = ver.normalizeVersionString();

      // Set optional fields
      ver.gitCommitSha = data.gitCommitSha || '';
      ver.releaseDate = data.releaseDate || now;
      ver.isLatest = data.isLatest ?? false;
      ver.metadata = data.metadata || {};

      // Validate before returning
      const validation = ver.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(ver);
    } catch (e) {
      return err(
        new Error(`Failed to create Version: ${e instanceof Error ? e.message : String(e)}`)
      );
    }
  }

  /**
   * Update version fields and refresh timestamp
   */
  update(data: Partial<Omit<Version, 'id' | 'indexed'>>): Result<Version, Error> {
    try {
      Object.assign(this, data);
      this.updated = Date.now();

      // Re-normalize if version string changed
      if (data.versionString) {
        this.versionNormalized = this.normalizeVersionString();
      }

      // Re-validate after update
      const validation = this.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(this);
    } catch (e) {
      return err(
        new Error(`Failed to update Version: ${e instanceof Error ? e.message : String(e)}`)
      );
    }
  }

  /**
   * Mark this version as indexed with document count
   */
  markIndexed(documentCount: number): Result<Version, Error> {
    this.documentCount = documentCount;
    this.indexed = Date.now();
    this.updated = this.indexed;
    return ok(this);
  }

  /**
   * Mark this version as the latest
   */
  markAsLatest(): Result<Version, Error> {
    this.isLatest = true;
    this.updated = Date.now();
    return ok(this);
  }

  /**
   * Deprecate this version
   */
  deprecate(): Result<Version, Error> {
    this.isDeprecated = true;
    this.updated = Date.now();
    return ok(this);
  }

  /**
   * Convert to plain object (for JSON serialization, DB storage)
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      libraryId: this.libraryId,
      versionString: this.versionString,
      versionNormalized: this.versionNormalized,
      gitCommitSha: this.gitCommitSha,
      releaseDate: this.releaseDate,
      isLatest: this.isLatest,
      isDeprecated: this.isDeprecated,
      documentCount: this.documentCount,
      metadata: this.metadata,
      indexed: this.indexed,
      updated: this.updated,
    };
  }

  /**
   * Create instance from plain object (from DB, JSON)
   */
  static fromJSON(data: Record<string, unknown>): Result<Version, Error> {
    try {
      const ver = new Version();
      Object.assign(ver, data);

      const validation = ver.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(ver);
    } catch (e) {
      return err(
        new Error(`Failed to deserialize Version: ${e instanceof Error ? e.message : String(e)}`)
      );
    }
  }
}
