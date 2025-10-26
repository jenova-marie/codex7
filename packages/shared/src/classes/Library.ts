import { ok, err, type Result } from '@jenova-marie/ts-rust-result';
import { randomUUID } from 'node:crypto';

/**
 * Library metadata stored in database
 */
export interface LibraryMetadata {
  /** GitHub repository info */
  github?: {
    stars: number;
    forks: number;
    lastCommit: number;
  };
  /** NPM package info */
  npm?: {
    downloads: number;
    version: string;
  };
  /** Additional custom metadata */
  [key: string]: unknown;
}

/**
 * Input for creating a new library
 */
export interface CreateLibraryInput {
  org: string;
  project: string;
  name: string;
  repositoryUrl?: string;
  homepageUrl?: string;
  description?: string;
  trustScore?: number;
  metadata?: LibraryMetadata;
}

/**
 * Library domain entity
 * Represents a library/project (e.g., React, Next.js, Express)
 */
export class Library {
  /** Unique identifier  */
  id: string = '';

  /** Human-readable library name */
  name: string = '';

  /** Organization or author name */
  org: string = '';

  /** Project/library name */
  project: string = '';

  /** Unique identifier (e.g., '/vercel/next.js') */
  identifier: string = '';

  /** Repository URL */
  repositoryUrl: string = '';

  /** Homepage URL */
  homepageUrl: string = '';

  /** Library description */
  description: string = '';

  /** Trust score (1-10, default 5) */
  trustScore: number = 5;

  /** Additional metadata */
  metadata: LibraryMetadata = {};

  /** Creation timestamp (Unix ms) */
  created: number = 0;

  /** Last update timestamp (Unix ms) */
  updated: number = 0;

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
  validate(): Result<boolean, Error> {
    if (!this.org || !this.project) {
      return err(new Error('Library must have org and project name'));
    }

    if (!this.name) {
      return err(new Error('Library must have a display name'));
    }

    if (this.trustScore < 1 || this.trustScore > 10) {
      return err(new Error('Trust score must be between 1 and 10'));
    }

    return ok(true);
  }

  /**
   * Create a new Library instance with defaults
   */
  static create(data: CreateLibraryInput): Result<Library, Error> {
    try {
      const lib = new Library();
      lib.id = randomUUID();

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
      lib.trustScore = data.trustScore ?? 5;
      lib.metadata = data.metadata || {};

      // Validate before returning
      const validation = lib.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(lib);
    } catch (e) {
      return err(
        new Error(`Failed to create Library: ${e instanceof Error ? e.message : String(e)}`)
      );
    }
  }

  /**
   * Update library fields and refresh timestamp
   */
  update(data: Partial<Omit<Library, 'id' | 'created'>>): Result<Library, Error> {
    try {
      Object.assign(this, data);
      this.updated = Date.now();

      // Regenerate identifier if org/project changed
      if (data.org || data.project) {
        this.identifier = this.generateIdentifier();
      }

      // Re-validate after update
      const validation = this.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(this);
    } catch (e) {
      return err(
        new Error(`Failed to update Library: ${e instanceof Error ? e.message : String(e)}`)
      );
    }
  }

  /**
   * Convert to plain object (for JSON serialization, DB storage)
   */
  toJSON(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      org: this.org,
      project: this.project,
      identifier: this.identifier,
      repositoryUrl: this.repositoryUrl,
      homepageUrl: this.homepageUrl,
      description: this.description,
      trustScore: this.trustScore,
      metadata: this.metadata,
      created: this.created,
      updated: this.updated,
    };
  }

  /**
   * Create instance from plain object (from DB, JSON)
   */
  static fromJSON(data: Record<string, unknown>): Result<Library, Error> {
    try {
      const lib = new Library();
      Object.assign(lib, data);

      const validation = lib.validate();
      if (!validation.ok) {
        return err(validation.error);
      }

      return ok(lib);
    } catch (e) {
      return err(
        new Error(`Failed to deserialize Library: ${e instanceof Error ? e.message : String(e)}`)
      );
    }
  }
}
