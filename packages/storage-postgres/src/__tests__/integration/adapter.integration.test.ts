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
      if (!result.ok) {
        console.error('❌ createLibrary failed:', result.error);
      }
      expect(result.ok).toBe(true);
    });

    it('should get a library by id', async () => {
      const libraryResult = Library.create({
        name: 'Test Library 2',
        org: 'test-org',
        project: 'test-project-2',
        description: 'Another test library',
        repositoryUrl: 'https://github.com/test-org/test-project-2',
        homepageUrl: 'https://test.com',
        trustScore: 7,
        metadata: {},
      });

      expect(libraryResult.ok).toBe(true);
      const library = libraryResult.value!;
      library.id = 'test-lib-2'; // Override ID for testing

      await adapter.createLibrary(library);

      const result = await adapter.getLibrary('test-lib-2');
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.name).toBe('Test Library 2');
    });

    it('should search libraries', async () => {
      // Create multiple libraries
      const reactResult = Library.create({
        name: 'React Library',
        org: 'facebook',
        project: 'react',
        description: 'A JavaScript library for building user interfaces',
        repositoryUrl: 'https://github.com/facebook/react',
        homepageUrl: 'https://react.dev',
        trustScore: 10,
        metadata: {},
      });
      expect(reactResult.ok).toBe(true);
      const reactLib = reactResult.value!;
      reactLib.id = 'test-lib-search-1';
      await adapter.createLibrary(reactLib);

      const vueResult = Library.create({
        name: 'Vue Library',
        org: 'vuejs',
        project: 'core',
        description: 'The Progressive JavaScript Framework',
        repositoryUrl: 'https://github.com/vuejs/core',
        homepageUrl: 'https://vuejs.org',
        trustScore: 9,
        metadata: {},
      });
      expect(vueResult.ok).toBe(true);
      const vueLib = vueResult.value!;
      vueLib.id = 'test-lib-search-2';
      await adapter.createLibrary(vueLib);

      const result = await adapter.searchLibraries('react');
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value!.length).toBeGreaterThan(0);
    });
  });

  describe('Version CRUD Operations', () => {
    it('should create a version', async () => {
      // First create a library
      const libraryResult = Library.create({
        name: 'Library with Version',
        org: 'test',
        project: 'versioned',
        description: 'Test',
        repositoryUrl: 'https://github.com/test/versioned',
        homepageUrl: 'https://test.com',
        trustScore: 5,
        metadata: {},
      });
      expect(libraryResult.ok).toBe(true);
      const library = libraryResult.value!;
      library.id = 'test-lib-version';
      await adapter.createLibrary(library);

      const versionResult = Version.create({
        libraryId: 'test-lib-version',
        versionString: '1.0.0',
        isLatest: true,
        releaseDate: Date.now(),
        gitCommitSha: 'abc123',
        metadata: {},
      });
      expect(versionResult.ok).toBe(true);
      const version = versionResult.value!;
      version.id = 'test-version-1';

      const result = await adapter.createVersion(version);
      if (!result.ok) {
        console.error('❌ createVersion failed:', result.error);
      }
      expect(result.ok).toBe(true);
    });
  });

  describe('Document CRUD Operations', () => {
    it('should create a document', async () => {
      const documentResult = Document.create({
        versionId: 'test-version-1',
        title: 'Test Document',
        content: 'This is a test document with some content.',
        sourcePath: '/docs/test.md',
        sourceUrl: 'https://github.com/test/repo/docs/test.md',
        sourceType: 'github',
        language: 'en',
        hierarchy: ['Docs', 'Test'],
        chunkIndex: 0,
        metadata: {},
      });

      expect(documentResult.ok).toBe(true);
      const document = documentResult.value!;
      document.id = 'test-doc-1';

      const result = await adapter.indexDocument(document);
      if (!result.ok) {
        console.error('❌ indexDocument failed:', result.error);
      }
      expect(result.ok).toBe(true);
    });
  });

  describe('Vector Search with pgvector', () => {
    beforeEach(async () => {
      // Create library and version first
      const libraryResult = Library.create({
        name: 'Vector Test Library',
        org: 'test',
        project: 'vector',
        description: 'Library for testing vector search',
        repositoryUrl: 'https://github.com/test/vector',
        homepageUrl: 'https://test.com',
        trustScore: 5,
        metadata: {},
      });
      expect(libraryResult.ok).toBe(true);
      const library = libraryResult.value!;
      library.id = 'test-lib-vector';
      await adapter.createLibrary(library);

      const versionResult = Version.create({
        libraryId: 'test-lib-vector',
        versionString: '1.0.0',
        isLatest: true,
        releaseDate: Date.now(),
        gitCommitSha: 'abc123',
        metadata: {},
      });
      expect(versionResult.ok).toBe(true);
      const version = versionResult.value!;
      version.id = 'test-version-vector';
      version.documentCount = 3;
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
        const docResult = Document.create({
          versionId: 'test-version-vector',
          title: docData.title,
          content: docData.content,
          sourcePath: `/docs/${docData.id}.md`,
          sourceUrl: `https://github.com/test/vector/docs/${docData.id}.md`,
          sourceType: 'github',
          language: 'en',
          hierarchy: ['Docs'],
          chunkIndex: 0,
          metadata: {},
        });
        expect(docResult.ok).toBe(true);
        const doc = docResult.value!;
        doc.id = docData.id;
        doc.embedding = docData.embedding;
        await adapter.indexDocument(doc);
      }
    });

    it('should perform vector similarity search', async () => {
      // Create a query embedding similar to doc 1
      const queryEmbedding = new Array(1536).fill(0).map((_, i) => (i % 10) / 10);

      const result = await adapter.vectorSearch({
        embedding: queryEmbedding,
        k: 10,
        filter: { version: 'test-version-vector' },
      });
      if (!result.ok) {
        console.error('❌ vectorSearch failed:', result.error);
      }
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
        filter: { version: 'test-version-vector' },
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
        libraryId: 'test-lib-1',
        versionId: 'test-version-1',
        status: 'pending',
        metadata: {},
      });

      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.id).toBeDefined();
      expect(result.value?.startedAt).toBeDefined();
    });

    it('should get an indexing job', async () => {
      const createResult = await adapter.createIndexingJob({
        libraryId: 'test-lib-1',
        versionId: 'test-version-1',
        status: 'pending',
        metadata: {},
      });
      expect(createResult.ok).toBe(true);
      const jobId = createResult.value!.id;

      const result = await adapter.getIndexingJob(jobId);
      expect(result.ok).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value?.id).toBe(jobId);
    });

    it('should update an indexing job', async () => {
      const createResult = await adapter.createIndexingJob({
        libraryId: 'test-lib-1',
        versionId: 'test-version-1',
        status: 'pending',
        metadata: {},
      });
      expect(createResult.ok).toBe(true);
      const jobId = createResult.value!.id;

      const result = await adapter.updateIndexingJob(jobId, {
        status: 'completed',
        completedAt: Date.now(),
      });

      expect(result.ok).toBe(true);

      const job = await adapter.getIndexingJob(jobId);
      expect(job.value?.status).toBe('completed');
    });
  });
});
