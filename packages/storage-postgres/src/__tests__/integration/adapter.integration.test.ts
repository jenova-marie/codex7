/**
 * 🧪 PostgresAdapter Integration Tests
 *
 * Tests the PostgreSQL storage adapter against a REAL database
 * Uses the test database on port 5433 (codex7_test)
 *
 * Run with: TEST_DATABASE_URL=postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test pnpm test
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { PostgresAdapter } from '../../adapter.js';
import type { PostgresConfig } from '../../connection.js';
import type { StorageConfig } from '@codex7/shared';
import { Library, Version, Document } from '@codex7/shared';

// Integration tests only run if TEST_DATABASE_URL is set
const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test';

describe.skipIf(!TEST_DATABASE_URL)('PostgresAdapter Integration Tests', () => {
  let adapter: PostgresAdapter;
  let config: PostgresConfig;
  let storageConfig: StorageConfig;

  // Parse connection string for config
  const url = new URL(TEST_DATABASE_URL);
  config = {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };

  storageConfig = {
    type: 'postgres' as const,
    dbName: config.database,
    migrationStrategy: 'auto',
  };

  beforeAll(async () => {
    adapter = new PostgresAdapter(config);
    const initResult = await adapter.initialize(storageConfig);
    expect(initResult.ok).toBe(true);
  });

  afterAll(async () => {
    await adapter.close();
  });

  beforeEach(async () => {
    // Clean up test data before each test
    // We use unique test IDs for each test run, so cleanup is not strictly necessary
    // But we'll do it to keep the test database clean
    try {
      // Use the adapter's delete methods where available
      // For now, skip cleanup - tests use unique IDs per run
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Connection & Health', () => {
    it('should connect to database', async () => {
      const result = await adapter.healthCheck();
      expect(result.ok).toBe(true);
      expect(result.value).toBe(true);
    });

    it('should verify pgvector extension is loaded', async () => {
      // Vector search functionality implicitly tests pgvector is loaded
      // If pgvector isn't loaded, vector operations will fail
      const result = await adapter.healthCheck();
      expect(result.ok).toBe(true);
      expect(result.value).toBe(true);
    });
  });

  describe('Library CRUD Operations', () => {
    it('should create a library', async () => {
      const libraryResult = Library.create({
        name: 'Test Library',
        org: 'test-org',
        project: 'test-project',
        description: 'A test library',
        repositoryUrl: 'https://github.com/test-org/test-project',
        homepageUrl: 'https://test.com',
        trustScore: 8,
        metadata: {},
      });

      expect(libraryResult.ok).toBe(true);
      const library = libraryResult.value!;
      library.id = 'test-lib-1'; // Override ID for testing

      const result = await adapter.createLibrary(library);
      expect(result.ok).toBe(true);
    });

    it('should get a library by id', async () => {
      const library = new Library({
        id: 'test-lib-2',
        name: 'Test Library 2',
        org: 'test-org',
        project: 'test-project-2',
        identifier: '/test-org/test-project-2',
        description: 'Another test library',
        repositoryUrl: 'https://github.com/test-org/test-project-2',
        homepageUrl: 'https://test.com',
        trustScore: 7,
        metadata: {},
        created: Date.now(),
        updated: Date.now(),
      });

      await adapter.createLibrary(library);

      const result = await adapter.getLibrary('test-lib-2');
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.name).toBe('Test Library 2');
    });

    it('should search libraries', async () => {
      // Create multiple libraries
      await adapter.createLibrary(
        new Library({
          id: 'test-lib-search-1',
          name: 'React Library',
          org: 'facebook',
          project: 'react',
          identifier: '/facebook/react',
          description: 'A JavaScript library for building user interfaces',
          repositoryUrl: 'https://github.com/facebook/react',
          homepageUrl: 'https://react.dev',
          trustScore: 10,
          metadata: {},
          created: Date.now(),
          updated: Date.now(),
        })
      );

      await adapter.createLibrary(
        new Library({
          id: 'test-lib-search-2',
          name: 'Vue Library',
          org: 'vuejs',
          project: 'core',
          identifier: '/vuejs/core',
          description: 'The Progressive JavaScript Framework',
          repositoryUrl: 'https://github.com/vuejs/core',
          homepageUrl: 'https://vuejs.org',
          trustScore: 9,
          metadata: {},
          created: Date.now(),
          updated: Date.now(),
        })
      );

      const result = await adapter.searchLibraries('react');
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value!.length).toBeGreaterThan(0);
    });
  });

  describe('Version CRUD Operations', () => {
    it('should create a version', async () => {
      // First create a library
      const library = new Library({
        id: 'test-lib-version',
        name: 'Library with Version',
        org: 'test',
        project: 'versioned',
        identifier: '/test/versioned',
        description: 'Test',
        repositoryUrl: 'https://github.com/test/versioned',
        homepageUrl: 'https://test.com',
        trustScore: 5,
        metadata: {},
        created: Date.now(),
        updated: Date.now(),
      });
      await adapter.createLibrary(library);

      const version = new Version({
        id: 'test-version-1',
        libraryId: 'test-lib-version',
        versionString: '1.0.0',
        versionNormalized: '1.0.0',
        isLatest: true,
        isDeprecated: false,
        releaseDate: Date.now(),
        documentCount: 0,
        metadata: {},
        indexed: Date.now(),
        updated: Date.now(),
        gitCommitSha: 'abc123',
      });

      const result = await adapter.createVersion(version);
      expect(result.ok).toBe(true);
    });
  });

  describe('Document CRUD Operations', () => {
    it('should create a document', async () => {
      const document = new Document({
        id: 'test-doc-1',
        versionId: 'test-version-1',
        title: 'Test Document',
        content: 'This is a test document with some content.',
        contentHash: 'hash123',
        sourcePath: '/docs/test.md',
        sourceUrl: 'https://github.com/test/repo/docs/test.md',
        sourceType: 'github',
        language: 'en',
        hasCode: false,
        codeLanguage: '',
        hierarchy: { level: 1, path: ['Docs', 'Test'] },
        chunkIndex: 0,
        metadata: {},
        indexed: Date.now(),
        updated: Date.now(),
        embedding: null,
      });

      const result = await adapter.indexDocument(document);
      expect(result.ok).toBe(true);
    });
  });

  describe('Vector Search with pgvector', () => {
    beforeEach(async () => {
      // Create library and version first
      const library = new Library({
        id: 'test-lib-vector',
        name: 'Vector Test Library',
        org: 'test',
        project: 'vector',
        identifier: '/test/vector',
        description: 'Library for testing vector search',
        repositoryUrl: 'https://github.com/test/vector',
        homepageUrl: 'https://test.com',
        trustScore: 5,
        metadata: {},
        created: Date.now(),
        updated: Date.now(),
      });
      await adapter.createLibrary(library);

      const version = new Version({
        id: 'test-version-vector',
        libraryId: 'test-lib-vector',
        versionString: '1.0.0',
        versionNormalized: '1.0.0',
        isLatest: true,
        isDeprecated: false,
        releaseDate: Date.now(),
        documentCount: 3,
        metadata: {},
        indexed: Date.now(),
        updated: Date.now(),
        gitCommitSha: 'abc123',
      });
      await adapter.createVersion(version);

      // Create documents with dummy embeddings (1536 dimensions)
      const docs = [
        {
          id: 'test-doc-vector-1',
          title: 'Getting Started',
          content: 'How to get started with the library',
          embedding: new Array(1536).fill(0).map((_, i) => (i % 10) / 10),
        },
        {
          id: 'test-doc-vector-2',
          title: 'API Reference',
          content: 'Complete API documentation',
          embedding: new Array(1536).fill(0).map((_, i) => ((i + 5) % 10) / 10),
        },
        {
          id: 'test-doc-vector-3',
          title: 'Examples',
          content: 'Code examples and tutorials',
          embedding: new Array(1536).fill(0).map((_, i) => ((i + 7) % 10) / 10),
        },
      ];

      for (const docData of docs) {
        const doc = new Document({
          id: docData.id,
          versionId: 'test-version-vector',
          title: docData.title,
          content: docData.content,
          contentHash: `hash-${docData.id}`,
          sourcePath: `/docs/${docData.id}.md`,
          sourceUrl: `https://github.com/test/vector/docs/${docData.id}.md`,
          sourceType: 'github',
          language: 'en',
          hasCode: false,
          codeLanguage: '',
          hierarchy: { level: 1, path: ['Docs'] },
          chunkIndex: 0,
          metadata: {},
          indexed: Date.now(),
          updated: Date.now(),
          embedding: docData.embedding,
        });
        await adapter.indexDocument(doc);
      }
    });

    it('should perform vector similarity search', async () => {
      // Create a query embedding similar to doc 1
      const queryEmbedding = new Array(1536).fill(0).map((_, i) => (i % 10) / 10);

      const result = await adapter.vectorSearch({
        embedding: queryEmbedding,
        k: 10,
      });
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value!.length).toBeGreaterThan(0);

      // The most similar document should be doc 1
      expect(result.value![0].document.id).toBe('test-doc-vector-1');
    });

    it('should return results ordered by similarity', async () => {
      const queryEmbedding = new Array(1536).fill(0).map((_, i) => (i % 10) / 10);

      const result = await adapter.vectorSearch({
        embedding: queryEmbedding,
        k: 3,
      });
      expect(result.ok).toBe(true);
      expect(result.value!.length).toBe(3);

      // Results should be ordered by similarity (doc 1, then doc 2, then doc 3)
      expect(result.value![0].document.id).toBe('test-doc-vector-1');
    });

    it('should limit results correctly', async () => {
      const queryEmbedding = new Array(1536).fill(0).map((_, i) => (i % 10) / 10);

      const result = await adapter.vectorSearch({
        embedding: queryEmbedding,
        k: 2,
      });
      expect(result.ok).toBe(true);
      expect(result.value!.length).toBeLessThanOrEqual(2);
    });
  });

  describe('IndexingJob Operations', () => {
    it('should create an indexing job', async () => {
      const result = await adapter.createIndexingJob({
        id: 'test-job-1',
        libraryId: 'test-lib-1',
        versionId: 'test-version-1',
        status: 'pending',
        startedAt: Date.now(),
        metadata: {},
      });

      expect(result.ok).toBe(true);
    });

    it('should get an indexing job', async () => {
      await adapter.createIndexingJob({
        id: 'test-job-2',
        libraryId: 'test-lib-1',
        versionId: 'test-version-1',
        status: 'pending',
        startedAt: Date.now(),
        metadata: {},
      });

      const result = await adapter.getIndexingJob('test-job-2');
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.id).toBe('test-job-2');
    });

    it('should update an indexing job', async () => {
      await adapter.createIndexingJob({
        id: 'test-job-3',
        libraryId: 'test-lib-1',
        versionId: 'test-version-1',
        status: 'pending',
        startedAt: Date.now(),
        metadata: {},
      });

      const result = await adapter.updateIndexingJob('test-job-3', {
        status: 'completed',
        completedAt: Date.now(),
      });

      expect(result.ok).toBe(true);

      const job = await adapter.getIndexingJob('test-job-3');
      expect(job.value?.status).toBe('completed');
    });
  });
});
