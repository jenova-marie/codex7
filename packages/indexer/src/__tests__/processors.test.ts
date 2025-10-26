/**
 * 🧪 Tests for Source Processors
 *
 * Tests verify processors handle different source types correctly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processGitHub } from '../processors/github.js';
import { processWeb } from '../processors/web.js';
import { processPDF } from '../processors/pdf.js';
import { SourceType } from '../queue/job-types.js';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

// Mock simple-git
vi.mock('simple-git', () => ({
  simpleGit: vi.fn(() => ({
    clone: vi.fn().mockResolvedValue(undefined),
  })),
}));

// Mock file system operations
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>('node:fs/promises');
  return {
    ...actual,
    readdir: vi.fn().mockResolvedValue([]),
    readFile: vi.fn().mockResolvedValue('# Test\n\nTest content'),
    rm: vi.fn().mockResolvedValue(undefined),
    mkdir: vi.fn().mockResolvedValue(undefined),
  };
});

describe('Source Processors', () => {
  describe('GitHub Processor', () => {
    it('should process repository and return documents', async () => {
      const jobData = {
        libraryId: 'test-lib',
        source: 'https://github.com/test/repo',
        sourceType: SourceType.GitHub,
      };

      const result = await processGitHub(jobData);

      // With mocked empty directory, should return empty array
      expect(result).toEqual([]);
    });
  });

  describe('Web Processor', () => {
    it('should return empty array (stub implementation)', async () => {
      const jobData = {
        libraryId: 'test-lib',
        source: 'https://example.com/docs',
        sourceType: SourceType.Web,
      };

      const result = await processWeb(jobData);

      expect(result).toEqual([]);
    });
  });

  describe('PDF Processor', () => {
    it('should return empty array (stub implementation)', async () => {
      const jobData = {
        libraryId: 'test-lib',
        source: '/path/to/doc.pdf',
        sourceType: SourceType.PDF,
      };

      const result = await processPDF(jobData);

      expect(result).toEqual([]);
    });
  });
});
