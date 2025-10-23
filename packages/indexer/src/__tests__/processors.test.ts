/**
 * 🧪 Tests for Source Processors
 *
 * Phase 0: Tests verify stubs return empty arrays.
 */

import { describe, it, expect } from 'vitest';
import { processGitHub } from '../processors/github.js';
import { processWeb } from '../processors/web.js';
import { processPDF } from '../processors/pdf.js';
import { SourceType } from '../queue/job-types.js';

describe('Source Processors', () => {
  describe('GitHub Processor', () => {
    it('should return empty array (STUB)', async () => {
      const jobData = {
        libraryId: 'test-lib',
        source: 'https://github.com/test/repo',
        sourceType: SourceType.GitHub,
      };

      const result = await processGitHub(jobData);

      expect(result).toEqual([]);
    });
  });

  describe('Web Processor', () => {
    it('should return empty array (STUB)', async () => {
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
    it('should return empty array (STUB)', async () => {
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
