#!/usr/bin/env tsx
/**
 * 🌱 Seed Test Data Script
 *
 * Fetches real documentation from GitHub repos and indexes them
 * into the test database for MCP server integration testing.
 *
 * Usage:
 *   TEST_DATABASE_URL="postgresql://..." pnpm seed-test-data
 */

import { PostgresAdapter, type PostgresConfig } from '@codex7/storage-postgres';
import type { StorageAdapter, StorageConfig } from '@codex7/shared';
import { Library, Version, Document } from '@codex7/shared';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  'postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test';

/**
 * Library configurations to seed
 */
const LIBRARIES_TO_SEED = [
  {
    name: 'React',
    org: 'facebook',
    project: 'react',
    description: 'A JavaScript library for building user interfaces',
    repositoryUrl: 'https://github.com/facebook/react',
    homepageUrl: 'https://react.dev',
    trustScore: 10,
    docsPath: 'docs', // Path to docs in repo
    branch: 'main',
    files: [
      'README.md',
      // We'll discover more files programmatically
    ],
  },
  {
    name: 'Vue',
    org: 'vuejs',
    project: 'core',
    description: 'The Progressive JavaScript Framework',
    repositoryUrl: 'https://github.com/vuejs/core',
    homepageUrl: 'https://vuejs.org',
    trustScore: 9,
    docsPath: '.',
    branch: 'main',
    files: ['README.md'],
  },
  {
    name: 'Express',
    org: 'expressjs',
    project: 'express',
    description: 'Fast, unopinionated, minimalist web framework for Node.js',
    repositoryUrl: 'https://github.com/expressjs/express',
    homepageUrl: 'https://expressjs.com',
    trustScore: 10,
    docsPath: '.',
    branch: 'master',
    files: ['README.md', 'History.md'],
  },
];

/**
 * Fetch file content from GitHub
 */
async function fetchGitHubFile(
  org: string,
  repo: string,
  path: string,
  branch: string = 'main'
): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${path}`;
  console.log(`📥 Fetching: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️  Failed to fetch ${path}: ${response.status}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`❌ Error fetching ${path}:`, error);
    return null;
  }
}

/**
 * Create storage adapter
 */
async function createStorageAdapter(): Promise<StorageAdapter> {
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
    throw new Error(`Failed to initialize storage: ${initResult.error.message}`);
  }

  console.log('✅ Storage adapter initialized');
  return adapter;
}

/**
 * Split markdown content into chunks
 */
async function splitMarkdown(content: string, maxChunkSize: number = 2000): Promise<string[]> {
  const splitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
    chunkSize: maxChunkSize,
    chunkOverlap: 200,
  });

  return await splitter.splitText(content);
}

/**
 * Index a single library
 */
async function indexLibrary(
  adapter: StorageAdapter,
  libConfig: (typeof LIBRARIES_TO_SEED)[0]
): Promise<void> {
  console.log(`\n🔍 Indexing ${libConfig.name} (${libConfig.org}/${libConfig.project})...`);

  // Create library
  const libraryResult = Library.create({
    name: libConfig.name,
    org: libConfig.org,
    project: libConfig.project,
    description: libConfig.description,
    repositoryUrl: libConfig.repositoryUrl,
    homepageUrl: libConfig.homepageUrl,
    trustScore: libConfig.trustScore,
    metadata: {
      seeded: true,
      seededAt: new Date().toISOString(),
    },
  });

  if (!libraryResult.ok) {
    console.error(`❌ Failed to create library entity: ${libraryResult.error.message}`);
    return;
  }

  const library = libraryResult.value;

  // Check if library already exists
  const existingLibs = await adapter.searchLibraries(library.project);
  if (existingLibs.ok && existingLibs.value.length > 0) {
    const existing = existingLibs.value.find(
      (lib) => lib.org === library.org && lib.project === library.project
    );
    if (existing) {
      console.log(`⏭️  Library already exists, skipping...`);
      return;
    }
  }

  const createLibResult = await adapter.createLibrary(library);
  if (!createLibResult.ok) {
    console.error(`❌ Failed to save library: ${createLibResult.error.message}`);
    return;
  }

  console.log(`✅ Created library: ${library.identifier}`);

  // Create version (using latest)
  const versionResult = Version.create({
    libraryId: library.id,
    versionString: 'latest',
    releaseDate: Date.now(),
    isLatest: true,
    gitCommitSha: libConfig.branch,
    metadata: {
      branch: libConfig.branch,
    },
  });

  if (!versionResult.ok) {
    console.error(`❌ Failed to create version entity: ${versionResult.error.message}`);
    return;
  }

  const version = versionResult.value;
  const createVerResult = await adapter.createVersion(version);
  if (!createVerResult.ok) {
    console.error(`❌ Failed to save version: ${createVerResult.error.message}`);
    return;
  }

  console.log(`✅ Created version: ${version.versionString}`);

  // Fetch and index each file
  let totalDocs = 0;
  for (const file of libConfig.files) {
    const content = await fetchGitHubFile(libConfig.org, libConfig.project, file, libConfig.branch);

    if (!content) {
      console.warn(`⚠️  Skipping ${file} (empty or failed to fetch)`);
      continue;
    }

    // Split into chunks
    const chunks = await splitMarkdown(content);
    console.log(`📄 ${file}: ${chunks.length} chunks`);

    // Index each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (!chunk || chunk.trim().length === 0) continue;

      const docResult = Document.create({
        title: `${file}${chunks.length > 1 ? ` (part ${i + 1}/${chunks.length})` : ''}`,
        content: chunk,
        sourceUrl: `${libConfig.repositoryUrl}/blob/${libConfig.branch}/${file}`,
        versionId: version.id,
        hierarchy: file.split('/'),
        sourceType: 'readme',
        language: 'en',
        chunkIndex: i,
        metadata: {
          file,
          totalChunks: chunks.length,
        },
      });

      if (!docResult.ok) {
        console.error(`❌ Failed to create document: ${docResult.error.message}`);
        continue;
      }

      const doc = docResult.value;
      const indexResult = await adapter.indexDocument(doc);

      if (!indexResult.ok) {
        console.error(`❌ Failed to index document: ${indexResult.error.message}`);
        continue;
      }

      totalDocs++;
    }
  }

  console.log(`✅ Indexed ${totalDocs} documents for ${libConfig.name}`);
}

/**
 * Main function
 */
async function main() {
  console.log('🌱 Codex7 Test Data Seeder\n');
  console.log(`📊 Database: ${TEST_DATABASE_URL.replace(/:[^:]*@/, ':****@')}\n`);

  const adapter = await createStorageAdapter();

  try {
    for (const libConfig of LIBRARIES_TO_SEED) {
      await indexLibrary(adapter, libConfig);
    }

    console.log('\n✅ All libraries indexed successfully!');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    throw error;
  } finally {
    await adapter.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
