/**
 * 🧪 MCP Tools Integration Tests
 *
 * Tests all MCP tool handlers against a REAL database
 * Uses the test database on port 5433 (codex7_test)
 *
 * Run with: TEST_DATABASE_URL=postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test pnpm test
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { StorageAdapter } from '@codex7/shared';
import { handleResolveLibraryId } from '../../tools/resolve-library-id.js';
import { handleGetLibraryDocs } from '../../tools/get-library-docs.js';
import { handleGetVersions } from '../../tools/get-versions.js';
import { handleSearchDocs } from '../../tools/search-docs.js';
import { createTestAdapter, seedTestData } from '../helpers/test-storage.js';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test';

describe.skipIf(!TEST_DATABASE_URL)('MCP Tools Integration Tests', () => {
  let adapter: StorageAdapter;
  let testLibraryId: string;

  beforeAll(async () => {
    // Create and initialize test adapter
    adapter = await createTestAdapter();

    // Seed test data
    const { library } = await seedTestData(adapter);
    testLibraryId = `/facebook/react`;
  });

  afterAll(async () => {
    // Clean up
    await adapter.close();
  });

  describe('resolve-library-id', () => {
    it('should resolve library name to identifier', async () => {
      const result = await handleResolveLibraryId({ libraryName: 'react' }, adapter);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data.query).toBe('react');
      expect(data.matches).toBeDefined();
      expect(Array.isArray(data.matches)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(0);

      // Should not have stub marker
      expect(data._stub).toBeUndefined();
    });

    it('should find React library with correct metadata', async () => {
      const result = await handleResolveLibraryId({ libraryName: 'react' }, adapter);
      const data = JSON.parse(result.content[0].text);

      const reactMatch = data.matches.find((m: any) => m.name === 'React');
      expect(reactMatch).toBeDefined();
      expect(reactMatch.id).toBe('/facebook/react');
      expect(reactMatch.description).toBe('A JavaScript library for building user interfaces');
      expect(reactMatch.trust_score).toBe(10);
      expect(reactMatch.repository_url).toBe('https://github.com/facebook/react');
      expect(reactMatch.homepage_url).toBe('https://react.dev');
      expect(reactMatch.versions).toBeDefined();
      expect(Array.isArray(reactMatch.versions)).toBe(true);
    });

    it('should return empty matches for unknown library', async () => {
      const result = await handleResolveLibraryId(
        { libraryName: 'nonexistent-library-xyz' },
        adapter
      );
      const data = JSON.parse(result.content[0].text);

      expect(data.matches).toBeDefined();
      expect(data.total).toBe(0);
    });
  });

  describe('get-library-docs', () => {
    it('should fetch documentation for React library', async () => {
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react',
        },
        adapter
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const data = JSON.parse(result.content[0].text);
      expect(data.library).toBe('React');
      expect(data.library_id).toBe('/facebook/react');
      expect(data.version).toBe('v18.2.0');
      expect(data.content).toBeDefined();
      expect(typeof data.content).toBe('string');
      expect(data.content.length).toBeGreaterThan(0);
      expect(data.metadata).toBeDefined();
      expect(data.metadata.chunks_returned).toBeGreaterThan(0);

      // Should not have stub marker
      expect(data.metadata._stub).toBeUndefined();
    });

    it('should handle topic parameter for focused search', async () => {
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react',
          topic: 'hooks',
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.topic).toBe('hooks');
      expect(data.content).toBeDefined();
      // Content should be related to hooks
      expect(data.content.toLowerCase()).toContain('hook');
    });

    it('should handle token limit parameter', async () => {
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react',
          tokens: 1000,
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.metadata.max_tokens).toBe(1000);
      expect(data.metadata.approx_tokens).toBeLessThanOrEqual(1000);
    });

    it('should return error for unknown library', async () => {
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/unknown/library',
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.error).toBeDefined();
      expect(data.error).toBe('Library not found');
    });

    it('should handle specific version request', async () => {
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react/v18.2.0',
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      if (!data.error) {
        expect(data.version).toBe('v18.2.0');
      }
    });
  });

  describe('get-library-versions', () => {
    it('should list all versions for React library', async () => {
      const result = await handleGetVersions({ library_id: '/facebook/react' }, adapter);

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);

      expect(data.library).toBe('React');
      expect(data.library_id).toBe('/facebook/react');
      expect(data.versions).toBeDefined();
      expect(Array.isArray(data.versions)).toBe(true);
      expect(data.total).toBeGreaterThan(0);

      // Should not have stub marker
      expect(data._stub).toBeUndefined();
    });

    it('should include version metadata', async () => {
      const result = await handleGetVersions({ library_id: '/facebook/react' }, adapter);
      const data = JSON.parse(result.content[0].text);

      const version = data.versions[0];
      expect(version).toBeDefined();
      expect(version.version).toBeDefined();
      expect(version.indexed_at).toBeDefined();
      expect(version.documentation_chunks).toBeDefined();
      expect(version.is_latest).toBeDefined();
      expect(version.is_deprecated).toBeDefined();

      // Check that at least one version is marked as latest
      const hasLatest = data.versions.some((v: any) => v.is_latest === true);
      expect(hasLatest).toBe(true);
    });

    it('should return error for unknown library', async () => {
      const result = await handleGetVersions({ library_id: '/unknown/library' }, adapter);
      const data = JSON.parse(result.content[0].text);

      expect(data.error).toBeDefined();
      expect(data.error).toBe('Library not found');
    });
  });

  describe('search-documentation', () => {
    it('should search across all documentation', async () => {
      const result = await handleSearchDocs(
        {
          query: 'hooks',
        },
        adapter
      );

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);

      expect(data.query).toBe('hooks');
      expect(data.results).toBeDefined();
      expect(Array.isArray(data.results)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(0);

      // Should not have stub marker
      expect(data._stub).toBeUndefined();
    });

    it('should return relevant results for hooks query', async () => {
      const result = await handleSearchDocs(
        {
          query: 'hooks state component',
          limit: 10,
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);

      if (data.results.length > 0) {
        const firstResult = data.results[0];
        expect(firstResult.title).toBeDefined();
        expect(firstResult.content).toBeDefined();
        expect(firstResult.score).toBeDefined();
        expect(firstResult.library).toBeDefined();

        // Content should contain hooks-related terms
        const content = firstResult.content.toLowerCase();
        expect(
          content.includes('hook') || content.includes('state') || content.includes('component')
        ).toBe(true);
      }
    });

    it('should handle limit parameter', async () => {
      const result = await handleSearchDocs(
        {
          query: 'react',
          limit: 2,
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.limit).toBe(2);
      expect(data.results.length).toBeLessThanOrEqual(2);
    });

    it('should handle library filter', async () => {
      const result = await handleSearchDocs(
        {
          query: 'hooks',
          filters: {
            library: '/facebook/react',
          },
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.filters.library).toBe('/facebook/react');

      // All results should be from React library
      if (data.results.length > 0) {
        data.results.forEach((result: any) => {
          if (result.library) {
            expect(result.library.identifier).toBe('/facebook/react');
          }
        });
      }
    });

    it('should handle version filter', async () => {
      const result = await handleSearchDocs(
        {
          query: 'hooks',
          filters: {
            version: 'v18.2.0',
          },
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.filters.version).toBe('v18.2.0');
    });

    it('should handle sourceType filter', async () => {
      const result = await handleSearchDocs(
        {
          query: 'react',
          filters: {
            sourceType: 'api-reference',
          },
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.filters.sourceType).toBe('api-reference');
    });

    it('should return empty results for nonsense query', async () => {
      const result = await handleSearchDocs(
        {
          query: 'xyzabc123notfound999',
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.results).toBeDefined();
      expect(data.total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid library ID format', async () => {
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: 'invalid-format',
        },
        adapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.error).toBeDefined();
    });

    it('should handle missing required parameters gracefully', async () => {
      // TypeScript would prevent this, but test runtime behavior
      const result = await handleSearchDocs({ query: '' }, adapter);

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.query).toBe('');
    });
  });
});
