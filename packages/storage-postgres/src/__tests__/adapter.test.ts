/**
 * 🧪 PostgresAdapter Tests
 *
 * Tests for the PostgreSQL storage adapter with mocked database
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PostgresAdapter } from '../adapter.js';
import type { PostgresConfig } from '../connection.js';
import type { StorageConfig } from '@codex7/shared';
import { Library, Version, Document } from '@codex7/shared';

// Mock bson-objectid
vi.mock('bson-objectid', () => {
  let counter = 0;
  return {
    default: vi.fn().mockImplementation(() => ({
      toHexString: () => `test-id-${++counter}`,
    })),
  };
});

// Mock the connection module
vi.mock('../connection.js', () => {
  return {
    PostgresConnection: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
      disconnect: vi.fn().mockResolvedValue({ ok: true, value: undefined }),
      healthCheck: vi.fn().mockResolvedValue({ ok: true, value: true }),
      getDb: vi.fn().mockReturnValue({
        ok: true,
        value: {
          select: vi.fn(() => ({
            from: vi.fn(() => ({
              where: vi.fn(() => ({
                limit: vi.fn(() => Promise.resolve([])),
                orderBy: vi.fn(() => ({
                  limit: vi.fn(() => ({
                    offset: vi.fn(() => Promise.resolve([])),
                  })),
                })),
              })),
              orderBy: vi.fn(() => ({
                limit: vi.fn(() => ({
                  offset: vi.fn(() => Promise.resolve([])),
                })),
              })),
              limit: vi.fn(() => Promise.resolve([])),
            })),
          })),
          insert: vi.fn(() => ({
            values: vi.fn(() => Promise.resolve(undefined)),
          })),
          update: vi.fn(() => ({
            set: vi.fn(() => ({
              where: vi.fn(() => Promise.resolve(undefined)),
            })),
          })),
          delete: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve(undefined)),
          })),
          execute: vi.fn().mockResolvedValue([]),
        },
      }),
    })),
  };
});

// Mock the migration runner
vi.mock('../scripts/run-migrations.js', () => ({
  runMigrations: vi.fn().mockResolvedValue({
    ok: true,
    value: [{ id: 'test-migration', name: 'Test Migration', applied: Date.now() }],
  }),
}));

describe('PostgresAdapter', () => {
  let adapter: PostgresAdapter;
  let config: PostgresConfig;
  let storageConfig: StorageConfig;

  beforeEach(() => {
    vi.clearAllMocks();

    config = {
      host: 'localhost',
      port: 5432,
      database: 'codex7_test',
      user: 'test',
      password: 'test',
    };

    storageConfig = {
      backend: 'postgres',
      connectionUrl: 'postgresql://test:test@localhost:5432/codex7_test',
    };

    adapter = new PostgresAdapter(config);
  });

  describe('🔧 Lifecycle Operations', () => {
    it('should initialize successfully', async () => {
      const result = await adapter.initialize(storageConfig);

      expect(result.ok).toBe(true);
    });

    it('should close connections successfully', async () => {
      await adapter.initialize(storageConfig);
      const result = await adapter.close();

      expect(result.ok).toBe(true);
    });

    it('should return healthy status', async () => {
      await adapter.initialize(storageConfig);
      const result = await adapter.healthCheck();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(true);
      }
    });

    it('should return stats', async () => {
      await adapter.initialize(storageConfig);
      const result = await adapter.getStats();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toHaveProperty('libraryCount');
        expect(result.value).toHaveProperty('versionCount');
        expect(result.value).toHaveProperty('documentCount');
        expect(result.value).toHaveProperty('storageSize');
        expect(result.value).toHaveProperty('avgDocumentsPerLibrary');
        expect(result.value).toHaveProperty('backendStats');
      }
    });

    it('should run migrations', async () => {
      await adapter.initialize(storageConfig);
      const result = await adapter.migrate();

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('📚 Library Operations', () => {
    it('should create a library', async () => {
      await adapter.initialize(storageConfig);

      const libraryData = {
        name: 'Test Library',
        org: 'test-org',
        project: 'test-project',
        identifier: '/test-org/test-project',
        metadata: {},
      };

      const result = await adapter.createLibrary(libraryData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeInstanceOf(Library);
        expect(result.value.name).toBe('Test Library');
        expect(result.value.id).toBeTruthy();
        expect(result.value.created).toBeGreaterThan(0);
        expect(result.value.updated).toBeGreaterThan(0);
      }
    });

    it('should return null for non-existent library', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.getLibrary('non-existent-id');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it('should list libraries with pagination', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.listLibraries({ limit: 10, offset: 0 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });

    it('should search libraries', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.searchLibraries('test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });
  });

  describe('📌 Version Operations', () => {
    it('should create a version', async () => {
      await adapter.initialize(storageConfig);

      const versionData = {
        libraryId: 'test-library-id',
        versionString: '1.0.0',
        versionNormalized: '1.0.0',
        isLatest: true,
        isDeprecated: false,
        metadata: {},
      };

      const result = await adapter.createVersion(versionData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeInstanceOf(Version);
        expect(result.value.versionString).toBe('1.0.0');
        expect(result.value.id).toBeTruthy();
        expect(result.value.indexed).toBeGreaterThan(0);
      }
    });

    it('should return null for non-existent version', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.getVersion('non-existent-id');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it('should list versions for a library', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.listVersions('test-library-id');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });
  });

  describe('📄 Document Operations', () => {
    it('should index a document', async () => {
      await adapter.initialize(storageConfig);

      const docData = {
        versionId: 'test-version-id',
        title: 'Test Document',
        content: 'Test content for the document',
        contentHash: 'hash123',
        embedding: new Array(1536).fill(0),
        chunkIndex: 0,
        hierarchy: ['docs', 'api'],
        hasCode: false,
        codeLanguage: '',
        metadata: {},
      };

      const result = await adapter.indexDocument(docData);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeInstanceOf(Document);
        expect(result.value.title).toBe('Test Document');
        expect(result.value.id).toBeTruthy();
        expect(result.value.indexed).toBeGreaterThan(0);
      }
    });

    it('should batch index documents', async () => {
      await adapter.initialize(storageConfig);

      const docs = [
        {
          versionId: 'test-version-id',
          title: 'Doc 1',
          content: 'Content 1',
          contentHash: 'hash1',
          embedding: [],
          chunkIndex: 0,
          hierarchy: [],
          hasCode: false,
          codeLanguage: '',
          metadata: {},
        },
        {
          versionId: 'test-version-id',
          title: 'Doc 2',
          content: 'Content 2',
          contentHash: 'hash2',
          embedding: [],
          chunkIndex: 1,
          hierarchy: [],
          hasCode: false,
          codeLanguage: '',
          metadata: {},
        },
      ];

      const result = await adapter.indexDocuments(docs);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
        expect(result.value.length).toBe(2);
      }
    });

    it('should return null for non-existent document', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.getDocument('non-existent-id');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBeNull();
      }
    });

    it('should check document exists by hash', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.documentExistsByHash('some-hash');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(typeof result.value).toBe('boolean');
      }
    });
  });

  describe('🔍 Search Operations', () => {
    it('should perform full-text search', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.fullTextSearch({ query: 'test' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });

    it('should perform vector search with embeddings', async () => {
      await adapter.initialize(storageConfig);

      const embedding = new Array(1536).fill(0.1);
      const result = await adapter.vectorSearch({ embedding, k: 10 });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });

    it('should perform hybrid search', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.hybridSearch({ query: 'test' });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(Array.isArray(result.value)).toBe(true);
      }
    });
  });

  describe('🔄 IndexingJob Operations', () => {
    it('should return NOT_IMPLEMENTED for createIndexingJob', async () => {
      await adapter.initialize(storageConfig);

      const jobData = {
        libraryId: 'test-library',
        versionId: 'test-version',
        status: 'pending' as const,
        processedDocuments: 0,
        failedDocuments: 0,
        metadata: {},
      };

      const result = await adapter.createIndexingJob(jobData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('not yet implemented');
      }
    });

    it('should return NOT_IMPLEMENTED for getIndexingJob', async () => {
      await adapter.initialize(storageConfig);

      const result = await adapter.getIndexingJob('test-id');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.message).toContain('not yet implemented');
      }
    });
  });
});
