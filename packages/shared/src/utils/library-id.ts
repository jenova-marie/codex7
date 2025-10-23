/**
 * 🔖 Library ID Utilities
 *
 * Functions for parsing and formatting library identifiers
 */

import { Result, ok, err } from '@jenova-marie/ts-rust-result';
import type { LibraryId } from '../types/library.js';
import { PATTERNS } from '../constants.js';

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
export function parseLibraryId(id: string): Result<LibraryId, Error> {
  if (!id || typeof id !== 'string') {
    return err(new Error('Library ID must be a non-empty string'));
  }

  if (!PATTERNS.LIBRARY_ID.test(id)) {
    return err(new Error(`Invalid library ID format: ${id}. Expected format: /org/project or /org/project/version`));
  }

  const parts = id.split('/').filter(Boolean);

  if (parts.length < 2 || parts.length > 3) {
    return err(new Error(`Invalid library ID: ${id}`));
  }

  const [org, project, version] = parts;

  return ok({
    org: org!,
    project: project!,
    version,
  });
}

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
export function formatLibraryId(components: LibraryId): string {
  const { org, project, version } = components;
  const base = `/${org}/${project}`;
  return version ? `${base}/${version}` : base;
}

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
export function extractLibraryIdFromGitHub(url: string): Result<string, Error> {
  const match = PATTERNS.GITHUB_REPO.exec(url);

  if (!match) {
    return err(new Error(`Invalid GitHub URL: ${url}`));
  }

  const [, org, repo] = match;
  return ok(`/${org}/${repo}`);
}

/**
 * Check if a string is a valid library ID
 *
 * @param id - String to validate
 * @returns True if valid library ID format
 */
export function isValidLibraryId(id: string): boolean {
  return PATTERNS.LIBRARY_ID.test(id);
}

/**
 * Normalize a library ID (ensure consistent formatting)
 *
 * @param id - Library ID to normalize
 * @returns Result containing normalized ID or error
 */
export function normalizeLibraryId(id: string): Result<string, Error> {
  const result = parseLibraryId(id);

  if (result.ok === false) {
    return result as Result<string, Error>;
  }

  return ok(formatLibraryId(result.value));
}
