/**
 * 🔖 Library ID Utilities
 *
 * Functions for parsing and formatting library identifiers
 */
import { Result } from '@jenova-marie/ts-rust-result';
import type { LibraryId } from '../types/library.js';
/**
 * Parse a Context7-compatible library ID into components
 *
 * @param id - Library ID in format: /org/project or /org/project/version
 * @returns Result containing parsed components or error
 *
 * @example
 * ```typescript
 * parseLibraryId('/vercel/next.js')
 * // => ok({ org: 'vercel', project: 'next.js', version: undefined })
 *
 * parseLibraryId('/vercel/next.js/v14.0.0')
 * // => ok({ org: 'vercel', project: 'next.js', version: 'v14.0.0' })
 * ```
 */
export declare function parseLibraryId(id: string): Result<LibraryId, Error>;
/**
 * Format library components into a library ID string
 *
 * @param components - Library ID components
 * @returns Formatted library ID
 *
 * @example
 * ```typescript
 * formatLibraryId({ org: 'vercel', project: 'next.js' })
 * // => '/vercel/next.js'
 *
 * formatLibraryId({ org: 'vercel', project: 'next.js', version: 'v14.0.0' })
 * // => '/vercel/next.js/v14.0.0'
 * ```
 */
export declare function formatLibraryId(components: LibraryId): string;
/**
 * Extract library ID from a GitHub repository URL
 *
 * @param url - GitHub repository URL
 * @returns Result containing library ID or error
 *
 * @example
 * ```typescript
 * extractLibraryIdFromGitHub('https://github.com/vercel/next.js')
 * // => ok('/vercel/next.js')
 * ```
 */
export declare function extractLibraryIdFromGitHub(url: string): Result<string, Error>;
/**
 * Check if a string is a valid library ID
 *
 * @param id - String to validate
 * @returns True if valid library ID format
 */
export declare function isValidLibraryId(id: string): boolean;
/**
 * Normalize a library ID (ensure consistent formatting)
 *
 * @param id - Library ID to normalize
 * @returns Result containing normalized ID or error
 */
export declare function normalizeLibraryId(id: string): Result<string, Error>;
