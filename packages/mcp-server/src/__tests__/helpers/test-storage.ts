/**
 * 🧪 Test Storage Helper
 *
 * Provides a configured storage adapter for integration testing
 */

import { PostgresAdapter } from '@codex7/storage-postgres';
import type { PostgresConfig } from '@codex7/storage-postgres';
import type { StorageAdapter, StorageConfig } from '@codex7/shared';
import { Library, Version, Document } from '@codex7/shared';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test';

/**
 * Create a test storage adapter with initialized connection
 */
export async function createTestAdapter(): Promise<StorageAdapter> {
  const url = new URL(TEST_DATABASE_URL);
  const config: PostgresConfig = {
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    database: url.pathname.slice(1),
    user: url.username,
    password: url.password,
  };

  const storageConfig: StorageConfig = {
    backend: 'postgres' as const,
    connectionUrl: TEST_DATABASE_URL,
    migrationStrategy: 'auto',
  };

  const adapter = new PostgresAdapter(config);
  const initResult = await adapter.initialize(storageConfig);

  if (!initResult.ok) {
    throw new Error(`Failed to initialize test adapter: ${initResult.error.message}`);
  }

  return adapter;
}

/**
 * Seed test data into the storage adapter
 */
export async function seedTestData(adapter: StorageAdapter): Promise<{
  library: Library;
  version: Version;
  documents: Document[];
}> {
  const testRunId = Date.now().toString();
  const uniqueId = (suffix: string) => `test-${testRunId}-${suffix}`;

  // Create test library
  const libraryResult = Library.create({
    name: 'React',
    org: 'facebook',
    project: 'react',
    description: 'A JavaScript library for building user interfaces',
    repositoryUrl: 'https://github.com/facebook/react',
    homepageUrl: 'https://react.dev',
    trustScore: 10,
    metadata: {},
  });

  if (!libraryResult.ok) {
    throw new Error('Failed to create test library');
  }

  const library = libraryResult.value;
  library.id = uniqueId('lib-react');

  const createLibResult = await adapter.createLibrary(library);
  if (!createLibResult.ok) {
    throw new Error(`Failed to save test library: ${createLibResult.error.message}`);
  }

  // Create test version
  const versionResult = Version.create({
    libraryId: library.id,
    versionString: 'v18.2.0',
    releaseDate: new Date('2023-06-14').getTime(),
    isLatest: true,
    gitCommitSha: 'abc123',
    metadata: {},
  });

  if (!versionResult.ok) {
    throw new Error('Failed to create test version');
  }

  const version = versionResult.value;
  version.id = uniqueId('ver-18.2.0');

  const createVerResult = await adapter.createVersion(version);
  if (!createVerResult.ok) {
    throw new Error(`Failed to save test version: ${createVerResult.error.message}`);
  }

  // Create test documents
  const documents: Document[] = [];

  const doc1Result = Document.create({
    title: 'React Hooks',
    content:
      'Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class.',
    sourceUrl: 'https://react.dev/reference/react/hooks',
    versionId: version.id,
    hierarchy: ['reference', 'react', 'hooks'],
    sourceType: 'api-reference',
    language: 'en',
    chunkIndex: 0,
    metadata: {},
  });

  if (doc1Result.ok) {
    const doc1 = doc1Result.value;
    doc1.id = uniqueId('doc-hooks');
    documents.push(doc1);

    const saveDoc1 = await adapter.indexDocument(doc1);
    if (!saveDoc1.ok) {
      throw new Error(`Failed to save test document 1: ${saveDoc1.error.message}`);
    }
  }

  const doc2Result = Document.create({
    title: 'useState Hook',
    content: 'useState is a React Hook that lets you add a state variable to your component.',
    sourceUrl: 'https://react.dev/reference/react/useState',
    versionId: version.id,
    hierarchy: ['reference', 'react', 'useState'],
    sourceType: 'api-reference',
    language: 'en',
    chunkIndex: 0,
    metadata: {},
  });

  if (doc2Result.ok) {
    const doc2 = doc2Result.value;
    doc2.id = uniqueId('doc-usestate');
    documents.push(doc2);

    const saveDoc2 = await adapter.indexDocument(doc2);
    if (!saveDoc2.ok) {
      throw new Error(`Failed to save test document 2: ${saveDoc2.error.message}`);
    }
  }

  const doc3Result = Document.create({
    title: 'useEffect Hook',
    content:
      'useEffect is a React Hook that lets you synchronize a component with an external system.',
    sourceUrl: 'https://react.dev/reference/react/useEffect',
    versionId: version.id,
    hierarchy: ['reference', 'react', 'useEffect'],
    sourceType: 'api-reference',
    language: 'en',
    chunkIndex: 0,
    metadata: {},
  });

  if (doc3Result.ok) {
    const doc3 = doc3Result.value;
    doc3.id = uniqueId('doc-useeffect');
    documents.push(doc3);

    const saveDoc3 = await adapter.indexDocument(doc3);
    if (!saveDoc3.ok) {
      throw new Error(`Failed to save test document 3: ${saveDoc3.error.message}`);
    }
  }

  return { library, version, documents };
}
