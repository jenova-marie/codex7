/**
 * 🧪 Tests for Processing Pipeline
 *
 * Tests verify pipeline orchestrates all steps correctly.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SourceType } from '../queue/job-types.js';
import { ok } from '@jenova-marie/ts-rust-result';

// Mock the PostgreSQL adapter with factory function
vi.mock('@codex7/storage-postgres', () => {
  return {
    PostgresAdapter: class MockPostgresAdapter {
      async initialize() {
        return ok(undefined);
      }
      async indexDocuments() {
        return ok([]);
      }
      async close() {
        return ok(undefined);
      }
    },
  };
});

// Mock the processor modules before importing the pipeline
vi.mock('../processors/github.js', () => ({
  processGitHub: vi.fn(async () => []),
}));

vi.mock('../processors/web.js', () => ({
  processWeb: vi.fn(async () => []),
}));

vi.mock('../processors/pdf.js', () => ({
  processPDF: vi.fn(async () => []),
}));

// Now import after mocks are set up
import { processJob } from '../pipeline/index.js';

describe('Processing Pipeline', () => {
  it('should process GitHub job and return success result', async () => {
    const jobData = {
      libraryId: 'test-lib',
      source: 'https://github.com/test/repo',
      sourceType: SourceType.GitHub,
    };

    const result = await processJob(jobData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.documentsIndexed).toBe(0); // Mock returns empty array
  });

  it('should process Web job and return success result', async () => {
    const jobData = {
      libraryId: 'test-lib',
      source: 'https://example.com/docs',
      sourceType: SourceType.Web,
    };

    const result = await processJob(jobData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.documentsIndexed).toBe(0); // Mock returns empty array
  });

  it('should process PDF job and return success result', async () => {
    const jobData = {
      libraryId: 'test-lib',
      source: '/path/to/doc.pdf',
      sourceType: SourceType.PDF,
    };

    const result = await processJob(jobData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.documentsIndexed).toBe(0); // Mock returns empty array
  });
});
