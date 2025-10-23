/**
 * 🧪 Tests for Library ID Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  parseLibraryId,
  formatLibraryId,
  extractLibraryIdFromGitHub,
  isValidLibraryId,
  normalizeLibraryId,
} from '../library-id.js';

describe('parseLibraryId', () => {
  it('should parse valid library ID without version', () => {
    const result = parseLibraryId('/vercel/next.js');

    expect(result.isOk()).toBe(true);
    const parsed = result.unwrap();
    expect(parsed.org).toBe('vercel');
    expect(parsed.project).toBe('next.js');
    expect(parsed.version).toBeUndefined();
  });

  it('should parse valid library ID with version', () => {
    const result = parseLibraryId('/vercel/next.js/v14.0.0');

    expect(result.isOk()).toBe(true);
    const parsed = result.unwrap();
    expect(parsed.org).toBe('vercel');
    expect(parsed.project).toBe('next.js');
    expect(parsed.version).toBe('v14.0.0');
  });

  it('should reject invalid library ID format', () => {
    const result = parseLibraryId('vercel/next.js');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('Invalid library ID format');
  });

  it('should reject empty string', () => {
    const result = parseLibraryId('');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('non-empty string');
  });

  it('should reject library ID with too many segments', () => {
    const result = parseLibraryId('/org/project/version/extra');

    expect(result.isErr()).toBe(true);
  });
});

describe('formatLibraryId', () => {
  it('should format library ID without version', () => {
    const formatted = formatLibraryId({
      org: 'vercel',
      project: 'next.js',
    });

    expect(formatted).toBe('/vercel/next.js');
  });

  it('should format library ID with version', () => {
    const formatted = formatLibraryId({
      org: 'vercel',
      project: 'next.js',
      version: 'v14.0.0',
    });

    expect(formatted).toBe('/vercel/next.js/v14.0.0');
  });

  it('should handle special characters in project name', () => {
    const formatted = formatLibraryId({
      org: 'facebook',
      project: 'react-native',
    });

    expect(formatted).toBe('/facebook/react-native');
  });
});

describe('extractLibraryIdFromGitHub', () => {
  it('should extract library ID from GitHub HTTPS URL', () => {
    const result = extractLibraryIdFromGitHub('https://github.com/vercel/next.js');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('/vercel/next.js');
  });

  it('should extract library ID from GitHub HTTP URL', () => {
    const result = extractLibraryIdFromGitHub('http://github.com/facebook/react');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('/facebook/react');
  });

  it('should extract library ID from GitHub URL with trailing slash', () => {
    const result = extractLibraryIdFromGitHub('https://github.com/microsoft/typescript/');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('/microsoft/typescript');
  });

  it('should reject non-GitHub URLs', () => {
    const result = extractLibraryIdFromGitHub('https://gitlab.com/org/project');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('Invalid GitHub URL');
  });

  it('should reject malformed URLs', () => {
    const result = extractLibraryIdFromGitHub('not-a-url');

    expect(result.isErr()).toBe(true);
  });
});

describe('isValidLibraryId', () => {
  it('should validate correct library IDs', () => {
    expect(isValidLibraryId('/vercel/next.js')).toBe(true);
    expect(isValidLibraryId('/vercel/next.js/v14.0.0')).toBe(true);
    expect(isValidLibraryId('/facebook/react')).toBe(true);
  });

  it('should reject invalid library IDs', () => {
    expect(isValidLibraryId('vercel/next.js')).toBe(false);
    expect(isValidLibraryId('/vercel')).toBe(false);
    expect(isValidLibraryId('')).toBe(false);
    expect(isValidLibraryId('/vercel/next.js/v14/extra')).toBe(false);
  });
});

describe('normalizeLibraryId', () => {
  it('should normalize valid library ID', () => {
    const result = normalizeLibraryId('/vercel/next.js');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('/vercel/next.js');
  });

  it('should normalize library ID with version', () => {
    const result = normalizeLibraryId('/vercel/next.js/v14.0.0');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe('/vercel/next.js/v14.0.0');
  });

  it('should reject invalid library ID', () => {
    const result = normalizeLibraryId('invalid-id');

    expect(result.isErr()).toBe(true);
  });
});
