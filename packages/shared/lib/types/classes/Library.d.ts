import { type Result } from '@jenova-marie/ts-rust-result';
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
export declare class Library {
    /** Unique identifier (BSON ObjectId hex string) */
    id: string;
    /** Human-readable library name */
    name: string;
    /** Organization or author name */
    org: string;
    /** Project/library name */
    project: string;
    /** Unique identifier (e.g., '/vercel/next.js') */
    identifier: string;
    /** Repository URL */
    repositoryUrl: string;
    /** Homepage URL */
    homepageUrl: string;
    /** Library description */
    description: string;
    /** Trust score (1-10, default 5) */
    trustScore: number;
    /** Additional metadata */
    metadata: LibraryMetadata;
    /** Creation timestamp (Unix ms) */
    created: number;
    /** Last update timestamp (Unix ms) */
    updated: number;
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
    validate(): Result<boolean, Error>;
    /**
     * Create a new Library instance with defaults
     */
    static create(data: CreateLibraryInput): Result<Library, Error>;
    /**
     * Update library fields and refresh timestamp
     */
    update(data: Partial<Omit<Library, 'id' | 'created'>>): Result<Library, Error>;
    /**
     * Convert to plain object (for JSON serialization, DB storage)
     */
    toJSON(): Record<string, unknown>;
    /**
     * Create instance from plain object (from DB, JSON)
     */
    static fromJSON(data: Record<string, unknown>): Result<Library, Error>;
}
