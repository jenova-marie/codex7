/**
 * 🧪 Tests for Tool Handlers (Unit Tests with Mocks)
 */

import { describe, it, expect, vi } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { StorageAdapter } from '@codex7/shared';
import { Library, Version, Document } from '@codex7/shared';
import { handleResolveLibraryId } from '../tools/resolve-library-id.js';
import { handleGetLibraryDocs } from '../tools/get-library-docs.js';
import { handleSearchDocs } from '../tools/search-docs.js';
import { handleGetVersions } from '../tools/get-versions.js';
import { registerTools } from '../tools/index.js';

// Mock storage adapter factory
function createMockAdapter(): StorageAdapter {
  const mockLibrary = Library.create({
    name: 'React',
    org: 'facebook',
    project: 'react',
    description: 'A JavaScript library for building user interfaces',
    repositoryUrl: 'https://github.com/facebook/react',
    homepageUrl: 'https://react.dev',
    trustScore: 10,
    metadata: {},
  }).value!;
  mockLibrary.id = 'mock-lib-1';

  const mockVersion = Version.create({
    libraryId: mockLibrary.id,
    versionString: 'v18.2.0',
    indexed: new Date(),
    releaseDate: new Date('2023-06-14'),
    isLatest: true,
    isDeprecated: false,
    documentCount: 3,
    gitCommitSha: 'abc123',
    metadata: {},
  }).value!;
  mockVersion.id = 'mock-ver-1';

  const mockDocument = Document.create({
    title: 'React Hooks',
    content:
      'Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.',
    url: 'https://react.dev/reference/react/hooks',
    versionId: mockVersion.id,
    hierarchyPath: '/reference/react/hooks',
    sourceType: 'api-reference',
    language: 'en',
    chunkIndex: 0,
    metadata: {},
  }).value!;
  mockDocument.id = 'mock-doc-1';

  return {
    initialize: vi.fn().mockResolvedValue({ ok: true, value: true }),
    close: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
    healthCheck: vi.fn().mockResolvedValue({ ok: true, value: true }),

    // Library operations
    createLibrary: vi.fn().mockResolvedValue({ ok: true, value: mockLibrary }),
    getLibrary: vi.fn().mockResolvedValue({ ok: true, value: mockLibrary }),
    updateLibrary: vi.fn().mockResolvedValue({ ok: true, value: mockLibrary }),
    deleteLibrary: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
    searchLibraries: vi.fn().mockResolvedValue({ ok: true, value: [mockLibrary] }),

    // Version operations
    createVersion: vi.fn().mockResolvedValue({ ok: true, value: mockVersion }),
    getVersion: vi.fn().mockResolvedValue({ ok: true, value: mockVersion }),
    updateVersion: vi.fn().mockResolvedValue({ ok: true, value: mockVersion }),
    deleteVersion: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
    listVersions: vi.fn().mockResolvedValue({ ok: true, value: [mockVersion] }),

    // Document operations
    indexDocument: vi.fn().mockResolvedValue({ ok: true, value: mockDocument }),
    getDocument: vi.fn().mockResolvedValue({ ok: true, value: mockDocument }),
    updateDocument: vi.fn().mockResolvedValue({ ok: true, value: mockDocument }),
    deleteDocument: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
    listDocuments: vi.fn().mockResolvedValue({ ok: true, value: [mockDocument] }),

    // Search operations
    hybridSearch: vi.fn().mockResolvedValue({
      ok: true,
      value: [
        {
          document: mockDocument,
          library: {
            name: mockLibrary.name,
            identifier: `/facebook/react`,
            version: mockVersion.versionString,
          },
          score: 0.95,
        },
      ],
    }),
    semanticSearch: vi.fn().mockResolvedValue({ ok: true, value: [mockDocument] }),
    exactSearch: vi.fn().mockResolvedValue({ ok: true, value: [mockDocument] }),
  } as unknown as StorageAdapter;
}

describe('Tool Handlers', () => {
  describe('handleResolveLibraryId', () => {
    it('should resolve library name to identifier', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleResolveLibraryId({ libraryName: 'react' }, mockAdapter);

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');

      const data = JSON.parse(result.content[0].text);
      expect(data.matches).toBeDefined();
      expect(data.query).toBe('react');
      expect(data.total).toBeGreaterThan(0);
    });

    it('should include library metadata', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleResolveLibraryId({ libraryName: 'react' }, mockAdapter);
      const data = JSON.parse(result.content[0].text);

      const match = data.matches[0];
      expect(match.id).toBe('/facebook/react');
      expect(match.name).toBe('React');
      expect(match.trust_score).toBe(10);
    });

    it('should handle search errors gracefully', async () => {
      const mockAdapter = createMockAdapter();
      mockAdapter.searchLibraries = vi
        .fn()
        .mockResolvedValue({ ok: false, error: new Error('Search failed') });

      const result = await handleResolveLibraryId({ libraryName: 'react' }, mockAdapter);
      const data = JSON.parse(result.content[0].text);

      expect(data.error).toBeDefined();
      expect(data.matches).toEqual([]);
    });
  });

  describe('handleGetLibraryDocs', () => {
    it('should fetch documentation for a library', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react',
        },
        mockAdapter
      );

      expect(result).toBeDefined();
      expect(result.content).toBeDefined();

      const data = JSON.parse(result.content[0].text);
      expect(data.library).toBe('React');
      expect(data.version).toBe('v18.2.0');
      expect(data.content).toBeDefined();
    });

    it('should handle topic parameter', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react',
          topic: 'hooks',
        },
        mockAdapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.topic).toBe('hooks');
    });

    it('should handle token limit', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/facebook/react',
          tokens: 1000,
        },
        mockAdapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.metadata.max_tokens).toBe(1000);
    });

    it('should handle library not found', async () => {
      const mockAdapter = createMockAdapter();
      mockAdapter.searchLibraries = vi.fn().mockResolvedValue({ ok: true, value: [] });

      const result = await handleGetLibraryDocs(
        {
          context7CompatibleLibraryID: '/unknown/library',
        },
        mockAdapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.error).toBe('Library not found');
    });
  });

  describe('handleSearchDocs', () => {
    it('should search documentation', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleSearchDocs({ query: 'hooks' }, mockAdapter);

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.results).toBeDefined();
      expect(data.query).toBe('hooks');
    });

    it('should handle limit parameter', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleSearchDocs({ query: 'hooks', limit: 5 }, mockAdapter);

      const data = JSON.parse(result.content[0].text);
      expect(data.limit).toBe(5);
    });

    it('should handle filters', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleSearchDocs(
        {
          query: 'hooks',
          filters: {
            library: '/facebook/react',
            version: 'v18.2.0',
          },
        },
        mockAdapter
      );

      const data = JSON.parse(result.content[0].text);
      expect(data.filters.library).toBe('/facebook/react');
      expect(data.filters.version).toBe('v18.2.0');
    });

    it('should handle search errors', async () => {
      const mockAdapter = createMockAdapter();
      mockAdapter.hybridSearch = vi
        .fn()
        .mockResolvedValue({ ok: false, error: new Error('Search failed') });

      const result = await handleSearchDocs({ query: 'hooks' }, mockAdapter);
      const data = JSON.parse(result.content[0].text);

      expect(data.error).toBeDefined();
      expect(data.results).toEqual([]);
    });
  });

  describe('handleGetVersions', () => {
    it('should list versions for a library', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleGetVersions({ library_id: '/facebook/react' }, mockAdapter);

      expect(result).toBeDefined();
      const data = JSON.parse(result.content[0].text);
      expect(data.versions).toBeDefined();
      expect(data.library).toBe('React');
      expect(data.total).toBeGreaterThan(0);
    });

    it('should include version metadata', async () => {
      const mockAdapter = createMockAdapter();
      const result = await handleGetVersions({ library_id: '/facebook/react' }, mockAdapter);
      const data = JSON.parse(result.content[0].text);

      const version = data.versions[0];
      expect(version.version).toBe('v18.2.0');
      expect(version.is_latest).toBe(true);
      expect(version.indexed_at).toBeDefined();
    });

    it('should handle library not found', async () => {
      const mockAdapter = createMockAdapter();
      mockAdapter.searchLibraries = vi.fn().mockResolvedValue({ ok: true, value: [] });

      const result = await handleGetVersions({ library_id: '/unknown/library' }, mockAdapter);
      const data = JSON.parse(result.content[0].text);

      expect(data.error).toBe('Library not found');
    });
  });
});

describe('Tool Registration', () => {
  function createTestServer(): Server {
    return new Server(
      { name: 'test', version: '1.0.0' },
      {
        capabilities: {
          tools: {},
        },
      }
    );
  }

  describe('registerTools', () => {
    it('should register all tools without throwing', () => {
      const server = createTestServer();
      const mockAdapter = createMockAdapter();
      expect(() => registerTools(server, mockAdapter)).not.toThrow();
    });

    it('should be idempotent', () => {
      const server = createTestServer();
      const mockAdapter = createMockAdapter();
      expect(() => {
        registerTools(server, mockAdapter);
        registerTools(server, mockAdapter);
      }).not.toThrow();
    });
  });
});
