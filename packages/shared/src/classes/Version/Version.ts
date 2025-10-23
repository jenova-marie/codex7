import { version } from '../../models/version';
import { addFunctions } from '../../decorators/function-injection';
import { ok, err, type VersionResult } from '../../errors';
import ObjectID from 'bson-objectid';

/**
 * Business logic class for Version domain entity
 * Extends plain model with methods and validation
 */
@addFunctions({})
export class Version extends version {
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
  validate(): VersionResult<boolean> {
    if (!this.libraryId) {
      return err({
        message: 'Version must be associated with a library',
        code: 'INVALID_VERSION'
      });
    }

    if (!this.versionString) {
      return err({
        message: 'Version must have a version string',
        code: 'INVALID_VERSION'
      });
    }

    return ok(true);
  }

  /**
   * Create a new Version instance with defaults
   */
  static create(data: {
    libraryId: string;
    versionString: string;
    gitCommitSha?: string;
    releaseDate?: number;
    isLatest?: boolean;
  }): VersionResult<Version> {
    try {
      const ver = new this();
      const objectId = new ObjectID();
      ver.id = objectId.toHexString();

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
      ver.isLatest = data.isLatest || false;

      // Validate before returning
      const validation = ver.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(ver);
    } catch (e) {
      return err({
        message: 'Failed to create Version instance',
        code: 'CREATE_FAILED',
        cause: e
      });
    }
  }

  /**
   * Update version fields and refresh timestamp
   */
  update(data: Partial<Omit<version, 'id' | 'indexed'>>): VersionResult<Version> {
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
      return err({
        message: 'Failed to update Version instance',
        code: 'UPDATE_FAILED',
        cause: e
      });
    }
  }

  /**
   * Mark this version as indexed with document count
   */
  markIndexed(documentCount: number): VersionResult<Version> {
    this.documentCount = documentCount;
    this.indexed = Date.now();
    this.updated = this.indexed;
    return ok(this);
  }

  /**
   * Mark this version as the latest
   */
  markAsLatest(): VersionResult<Version> {
    this.isLatest = true;
    this.updated = Date.now();
    return ok(this);
  }

  /**
   * Deprecate this version
   */
  deprecate(): VersionResult<Version> {
    this.isDeprecated = true;
    this.updated = Date.now();
    return ok(this);
  }
}
