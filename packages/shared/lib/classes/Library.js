import { ok, err } from '@jenova-marie/ts-rust-result';
import { randomUUID } from 'node:crypto';
/**
 * Library domain entity
 * Represents a library/project (e.g., React, Next.js, Express)
 */
export class Library {
    constructor() {
        /** Unique identifier  */
        this.id = '';
        /** Human-readable library name */
        this.name = '';
        /** Organization or author name */
        this.org = '';
        /** Project/library name */
        this.project = '';
        /** Unique identifier (e.g., '/vercel/next.js') */
        this.identifier = '';
        /** Repository URL */
        this.repositoryUrl = '';
        /** Homepage URL */
        this.homepageUrl = '';
        /** Library description */
        this.description = '';
        /** Trust score (1-10, default 5) */
        this.trustScore = 5;
        /** Additional metadata */
        this.metadata = {};
        /** Creation timestamp (Unix ms) */
        this.created = 0;
        /** Last update timestamp (Unix ms) */
        this.updated = 0;
    }
    /**
     * Check if library data is stale (not updated in 30 days)
     */
    isStale() {
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
        return Date.now() - this.updated > thirtyDaysMs;
    }
    /**
     * Generate library identifier from org and project name
     * Format: /org/project (e.g., /vercel/next.js)
     */
    generateIdentifier() {
        return `/${this.org}/${this.project}`;
    }
    /**
     * Validate library has minimum required fields
     */
    validate() {
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
    static create(data) {
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
        }
        catch (e) {
            return err(new Error(`Failed to create Library: ${e instanceof Error ? e.message : String(e)}`));
        }
    }
    /**
     * Update library fields and refresh timestamp
     */
    update(data) {
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
        }
        catch (e) {
            return err(new Error(`Failed to update Library: ${e instanceof Error ? e.message : String(e)}`));
        }
    }
    /**
     * Convert to plain object (for JSON serialization, DB storage)
     */
    toJSON() {
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
    static fromJSON(data) {
        try {
            const lib = new Library();
            Object.assign(lib, data);
            const validation = lib.validate();
            if (!validation.ok) {
                return err(validation.error);
            }
            return ok(lib);
        }
        catch (e) {
            return err(new Error(`Failed to deserialize Library: ${e instanceof Error ? e.message : String(e)}`));
        }
    }
}
//# sourceMappingURL=Library.js.map