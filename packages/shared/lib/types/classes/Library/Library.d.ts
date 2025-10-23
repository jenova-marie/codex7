import { library } from '../../models/library';
import { type LibraryResult } from '../../errors';
/**
 * Business logic class for Library domain entity
 * Extends plain model with methods and validation
 */
export declare class Library extends library {
    /**
     * Check if library data is stale (not updated in 30 days)
     */
    isStale(): boolean;
    /**
     * Generate library identifier from org and project name
     * Format: /org/project (e.g., /vercel/next.js)
     */
    generateIdentifier(): string;
    /**
     * Validate library has minimum required fields
     */
    validate(): LibraryResult<boolean>;
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
    }): LibraryResult<Library>;
    /**
     * Update library fields and refresh timestamp
     */
    update(data: Partial<Omit<library, 'id' | 'created'>>): LibraryResult<Library>;
}
