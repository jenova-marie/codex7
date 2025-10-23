import { library } from '../../models/library';
import { addFunctions } from '../../decorators/function-injection';
import { ok, err, type LibraryResult } from '../../errors';
import ObjectID from 'bson-objectid';

/**
 * Business logic class for Library domain entity
 * Extends plain model with methods and validation
 */
@addFunctions({})
export class Library extends library {
  /**
   * Check if library data is stale (not updated in 30 days)
   */
  isStale(): boolean {
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return Date.now() - this.updated > thirtyDaysMs;
  }

  /**
   * Generate library identifier from org and project name
   * Format: /org/project (e.g., /vercel/next.js)
   */
  generateIdentifier(): string {
    return `/${this.org}/${this.project}`;
  }

  /**
   * Validate library has minimum required fields
   */
  validate(): LibraryResult<boolean> {
    if (!this.org || !this.project) {
      return err({
        message: 'Library must have org and project name',
        code: 'INVALID_LIBRARY'
      });
    }

    if (!this.name) {
      return err({
        message: 'Library must have a display name',
        code: 'INVALID_LIBRARY'
      });
    }

    return ok(true);
  }

  /**
   * Create a new Library instance with defaults
   */
  static create(data: {
    org: string;
    project: string;
    name: string;
    repositoryUrl?: string;
    homepageUrl?: string;
    description?: string;
  }): LibraryResult<Library> {
    try {
      const lib = new this();
      const objectId = new ObjectID();
      lib.id = objectId.toHexString();

      const now = Date.now();
      lib.created = now;
      lib.updated = now;

      // Set required fields
      lib.org = data.org;
      lib.project = data.project;
      lib.name = data.name;
      lib.identifier = `/${data.org}/${data.project}`;

      // Set optional fields
      lib.repositoryUrl = data.repositoryUrl || '';
      lib.homepageUrl = data.homepageUrl || '';
      lib.description = data.description || '';

      // Validate before returning
      const validation = lib.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(lib);
    } catch (e) {
      return err({
        message: 'Failed to create Library instance',
        code: 'CREATE_FAILED',
        cause: e
      });
    }
  }

  /**
   * Update library fields and refresh timestamp
   */
  update(data: Partial<Omit<library, 'id' | 'created'>>): LibraryResult<Library> {
    try {
      Object.assign(this, data);
      this.updated = Date.now();

      // Re-validate after update
      const validation = this.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(this);
    } catch (e) {
      return err({
        message: 'Failed to update Library instance',
        code: 'UPDATE_FAILED',
        cause: e
      });
    }
  }
}
