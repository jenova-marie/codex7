# 🔍 Indexer Service - Framework Establishment Plan

> **Goal**: Create background indexing service skeleton with job queue framework, processor stubs, logging, error handling, and testing. NO actual indexing logic yet!

---

## 🎯 Package Purpose

The `@codex7/indexer` package provides:
- Background service for document processing
- Job queue consumer (Redis-backed)
- Document processor pipeline framework
- Source fetcher stubs (GitHub, web, PDF)
- Embedding generation framework

**What we're NOT doing yet**: Implementing actual document fetching, chunking, embedding generation, or storage.

---

## 🏗️ Foundation Phase Tasks

### 1. Project Structure Setup

```
packages/indexer/
├── src/
│   ├── index.ts                     # Entry point (start worker)
│   ├── worker.ts                    # Job queue worker
│   ├── queue/                       # Job queue management
│   │   ├── index.ts
│   │   ├── client.ts               # Redis/BullMQ client
│   │   └── job-types.ts            # Job type definitions
│   ├── processors/                  # Source processors (stubs)
│   │   ├── index.ts
│   │   ├── github.ts               # GitHub repo processor (stub)
│   │   ├── web.ts                  # Web scraper (stub)
│   │   └── pdf.ts                  # PDF parser (stub)
│   ├── pipeline/                    # Processing pipeline
│   │   ├── index.ts
│   │   ├── fetcher.ts              # Source fetching coordinator
│   │   ├── chunker.ts              # Document chunking (stub)
│   │   ├── embedder.ts             # Embedding generation (stub)
│   │   └── storer.ts               # Storage writer (stub)
│   ├── utils/                       # Utilities
│   │   ├── index.ts
│   │   └── logger.ts               # Logger setup
│   └── __tests__/                   # Tests
│       ├── worker.test.ts
│       ├── processors.test.ts
│       └── pipeline.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

**Deliverable**: Complete directory structure.

---

### 2. Package Configuration

#### package.json
```json
{
  "name": "@codex7/indexer",
  "version": "0.1.0",
  "description": "Background document indexing service for Codex7",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@codex7/shared": "workspace:*",
    "@codex7/storage-postgres": "workspace:*",
    "@jenova-marie/ts-rust-result": "workspace:*",
    "@jenova-marie/wonder-logger": "workspace:*",
    "bullmq": "^5.1.0",
    "ioredis": "^5.3.2"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "tsx": "^4.7.0"
  }
}
```

**Deliverable**: Config files ready.

---

### 3. Job Queue Setup

#### src/queue/job-types.ts
```typescript
/**
 * Job type definitions for the indexing queue
 */

/**
 * Source types that can be indexed
 */
export enum SourceType {
  GitHub = 'github',
  Web = 'web',
  PDF = 'pdf'
}

/**
 * Base job data interface
 */
export interface BaseJobData {
  libraryId: string;
  source: string; // URL or path
  sourceType: SourceType;
  options?: Record<string, unknown>;
}

/**
 * GitHub repository indexing job
 */
export interface GitHubJobData extends BaseJobData {
  sourceType: SourceType.GitHub;
  branch?: string;
  path?: string; // Subdirectory to index
}

/**
 * Web scraping job
 */
export interface WebJobData extends BaseJobData {
  sourceType: SourceType.Web;
  maxDepth?: number;
}

/**
 * PDF parsing job
 */
export interface PDFJobData extends BaseJobData {
  sourceType: SourceType.PDF;
}

/**
 * Union of all job data types
 */
export type IndexJobData = GitHubJobData | WebJobData | PDFJobData;

/**
 * Job result data
 */
export interface JobResult {
  success: boolean;
  documentsIndexed: number;
  error?: string;
}
```

**Deliverable**: Complete job type definitions.

---

#### src/queue/client.ts
```typescript
import { Queue, Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../utils/logger.js';
import type { IndexJobData, JobResult } from './job-types.js';

/**
 * Queue configuration
 */
export interface QueueConfig {
  redisUrl: string;
  queueName: string;
}

/**
 * Job queue client
 *
 * Manages connection to Redis and provides queue operations.
 * STUB: Connection setup only, actual job processing in Phase 1.
 */
export class JobQueueClient {
  private connection: Redis;
  private queue: Queue<IndexJobData, JobResult>;
  private config: QueueConfig;

  constructor(config: QueueConfig) {
    this.config = config;

    logger.info('Initializing job queue client', {
      redisUrl: config.redisUrl,
      queueName: config.queueName
    });

    // Initialize Redis connection
    this.connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null
    });

    // Initialize BullMQ queue
    this.queue = new Queue<IndexJobData, JobResult>(config.queueName, {
      connection: this.connection
    });

    logger.info('Job queue client initialized');
  }

  /**
   * Add job to queue
   * STUB: Adds job but no worker processes it yet
   */
  async addJob(data: IndexJobData): Promise<string> {
    logger.info('Adding job to queue (STUB)', { data });

    const job = await this.queue.add('index-document', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    logger.info('Job added to queue', { jobId: job.id });
    return job.id!;
  }

  /**
   * Get job status
   * STUB: Returns job info
   */
  async getJobStatus(jobId: string): Promise<any> {
    logger.debug('Getting job status (STUB)', { jobId });

    const job = await this.queue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      data: job.data,
      state: await job.getState(),
      progress: job.progress
    };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    logger.info('Closing job queue client...');

    await this.queue.close();
    await this.connection.quit();

    logger.info('Job queue client closed');
  }
}
```

**Deliverable**: Job queue client with BullMQ.

---

### 4. Worker Setup

#### src/worker.ts
```typescript
import { Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { logger } from './utils/logger.js';
import { processJob } from './pipeline/index.js';
import type { IndexJobData, JobResult } from './queue/job-types.js';

/**
 * Worker configuration
 */
export interface WorkerConfig {
  redisUrl: string;
  queueName: string;
  concurrency?: number;
}

/**
 * Indexing job worker
 *
 * Consumes jobs from queue and processes them.
 * STUB: Processes jobs but all steps are stubs.
 */
export class IndexerWorker {
  private connection: Redis;
  private worker: Worker<IndexJobData, JobResult>;
  private config: WorkerConfig;

  constructor(config: WorkerConfig) {
    this.config = config;

    logger.info('Initializing indexer worker', { config });

    // Initialize Redis connection
    this.connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null
    });

    // Initialize BullMQ worker
    this.worker = new Worker<IndexJobData, JobResult>(
      config.queueName,
      async (job: Job<IndexJobData, JobResult>) => {
        return this.handleJob(job);
      },
      {
        connection: this.connection,
        concurrency: config.concurrency || 1
      }
    );

    // Event handlers
    this.worker.on('completed', (job) => {
      logger.info('Job completed', {
        jobId: job.id,
        result: job.returnvalue
      });
    });

    this.worker.on('failed', (job, err) => {
      logger.error('Job failed', {
        jobId: job?.id,
        error: err.message,
        stack: err.stack
      });
    });

    logger.info('Indexer worker initialized');
  }

  /**
   * Handle individual job
   *
   * STUB: Logs job but doesn't actually process
   */
  private async handleJob(job: Job<IndexJobData, JobResult>): Promise<JobResult> {
    logger.info('Processing job (STUB)', {
      jobId: job.id,
      data: job.data
    });

    try {
      // Process job through pipeline (all stubs)
      const result = await processJob(job.data);

      logger.info('Job processed (STUB)', {
        jobId: job.id,
        result
      });

      return result;
    } catch (error) {
      logger.error('Job processing failed', {
        jobId: job.id,
        error: error instanceof Error ? error.message : String(error)
      });

      return {
        success: false,
        documentsIndexed: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    logger.info('Starting indexer worker...');
    // Worker automatically starts when created
    logger.info('Indexer worker running, waiting for jobs...');
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    logger.info('Stopping indexer worker...');

    await this.worker.close();
    await this.connection.quit();

    logger.info('Indexer worker stopped');
  }
}
```

**Deliverable**: Worker that consumes jobs.

---

### 5. Processing Pipeline (Stubs)

#### src/pipeline/index.ts
```typescript
import { logger } from '../utils/logger.js';
import { fetchSource } from './fetcher.js';
import { chunkDocuments } from './chunker.js';
import { generateEmbeddings } from './embedder.js';
import { storeDocuments } from './storer.js';
import type { IndexJobData, JobResult } from '../queue/job-types.js';

/**
 * Main processing pipeline
 *
 * Orchestrates the full indexing workflow:
 * 1. Fetch source (GitHub, web, PDF)
 * 2. Chunk documents
 * 3. Generate embeddings
 * 4. Store in database
 *
 * STUB: All steps return placeholder data.
 */
export async function processJob(jobData: IndexJobData): Promise<JobResult> {
  logger.info('Starting processing pipeline (STUB)', { jobData });

  try {
    // Step 1: Fetch source
    logger.info('Step 1: Fetching source (STUB)...');
    const rawDocuments = await fetchSource(jobData);
    logger.info('Source fetched (STUB)', { count: rawDocuments.length });

    // Step 2: Chunk documents
    logger.info('Step 2: Chunking documents (STUB)...');
    const chunks = await chunkDocuments(rawDocuments);
    logger.info('Documents chunked (STUB)', { count: chunks.length });

    // Step 3: Generate embeddings
    logger.info('Step 3: Generating embeddings (STUB)...');
    const withEmbeddings = await generateEmbeddings(chunks);
    logger.info('Embeddings generated (STUB)', { count: withEmbeddings.length });

    // Step 4: Store documents
    logger.info('Step 4: Storing documents (STUB)...');
    await storeDocuments(withEmbeddings);
    logger.info('Documents stored (STUB)');

    return {
      success: true,
      documentsIndexed: chunks.length
    };
  } catch (error) {
    logger.error('Pipeline error', {
      error: error instanceof Error ? error.message : String(error)
    });

    return {
      success: false,
      documentsIndexed: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

#### src/pipeline/fetcher.ts
```typescript
import { logger } from '../utils/logger.js';
import { processGitHub } from '../processors/github.js';
import { processWeb } from '../processors/web.js';
import { processPDF } from '../processors/pdf.js';
import { SourceType, type IndexJobData } from '../queue/job-types.js';

/**
 * Raw document from source
 */
export interface RawDocument {
  title: string;
  content: string;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * Fetch source and return raw documents
 *
 * STUB: Returns empty array
 */
export async function fetchSource(jobData: IndexJobData): Promise<RawDocument[]> {
  logger.info('Fetching source (STUB)', { jobData });

  switch (jobData.sourceType) {
    case SourceType.GitHub:
      return processGitHub(jobData);

    case SourceType.Web:
      return processWeb(jobData);

    case SourceType.PDF:
      return processPDF(jobData);

    default:
      throw new Error(`Unknown source type: ${(jobData as any).sourceType}`);
  }
}
```

#### src/pipeline/chunker.ts
```typescript
import { logger } from '../utils/logger.js';
import type { RawDocument } from './fetcher.js';

/**
 * Document chunk
 */
export interface DocumentChunk {
  title: string;
  content: string;
  hierarchy: string[];
  sectionLevel: number;
  url: string;
  metadata: Record<string, unknown>;
}

/**
 * Chunk documents by structure
 *
 * STUB: Returns chunks with placeholder data
 */
export async function chunkDocuments(documents: RawDocument[]): Promise<DocumentChunk[]> {
  logger.info('Chunking documents (STUB)', { count: documents.length });

  // TODO Phase 1: Implement structural chunking
  // - Parse markdown AST
  // - Split by headers
  // - Preserve hierarchy

  return [];
}
```

#### src/pipeline/embedder.ts
```typescript
import { logger } from '../utils/logger.js';
import type { DocumentChunk } from './chunker.js';

/**
 * Document chunk with embedding
 */
export interface EmbeddedDocument extends DocumentChunk {
  embedding: number[];
}

/**
 * Generate embeddings for document chunks
 *
 * STUB: Returns chunks without embeddings
 */
export async function generateEmbeddings(chunks: DocumentChunk[]): Promise<EmbeddedDocument[]> {
  logger.info('Generating embeddings (STUB)', { count: chunks.length });

  // TODO Phase 1: Call OpenAI embeddings API
  // - Batch chunks for efficiency
  // - Handle rate limits
  // - Retry on failure

  return chunks.map(chunk => ({
    ...chunk,
    embedding: [] // Placeholder
  }));
}
```

#### src/pipeline/storer.ts
```typescript
import { logger } from '../utils/logger.js';
import type { EmbeddedDocument } from './embedder.js';

/**
 * Store documents in database
 *
 * STUB: Just logs, doesn't actually store
 */
export async function storeDocuments(documents: EmbeddedDocument[]): Promise<void> {
  logger.info('Storing documents (STUB)', { count: documents.length });

  // TODO Phase 1: Use storage adapter
  // - Batch inserts
  // - Deduplication by content hash
  // - Transaction handling
}
```

**Deliverable**: Complete pipeline framework with stubs.

---

### 6. Source Processors (Stubs)

#### src/processors/github.ts
```typescript
import { logger } from '../utils/logger.js';
import type { GitHubJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Process GitHub repository
 *
 * STUB: Returns empty array
 */
export async function processGitHub(jobData: GitHubJobData): Promise<RawDocument[]> {
  logger.info('Processing GitHub repo (STUB)', { jobData });

  // TODO Phase 1:
  // 1. Clone repository or use GitHub API
  // 2. Find documentation files (README.md, docs/*)
  // 3. Extract markdown content
  // 4. Return raw documents

  return [];
}
```

#### src/processors/web.ts
```typescript
import { logger } from '../utils/logger.js';
import type { WebJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Process web documentation site
 *
 * STUB: Returns empty array
 */
export async function processWeb(jobData: WebJobData): Promise<RawDocument[]> {
  logger.info('Processing web site (STUB)', { jobData });

  // TODO Phase 1:
  // 1. Use Playwright to scrape pages
  // 2. Respect robots.txt
  // 3. Extract text content
  // 4. Return raw documents

  return [];
}
```

#### src/processors/pdf.ts
```typescript
import { logger } from '../utils/logger.js';
import type { PDFJobData } from '../queue/job-types.js';
import type { RawDocument } from '../pipeline/fetcher.js';

/**
 * Process PDF documentation
 *
 * STUB: Returns empty array
 */
export async function processPDF(jobData: PDFJobData): Promise<RawDocument[]> {
  logger.info('Processing PDF (STUB)', { jobData });

  // TODO Phase 1:
  // 1. Parse PDF file
  // 2. Extract text while preserving structure
  // 3. Return raw documents

  return [];
}
```

**Deliverable**: Source processor stubs.

---

### 7. Entry Point

#### src/index.ts
```typescript
import { IndexerWorker } from './worker.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for indexer service
 *
 * Starts the worker and handles graceful shutdown.
 */
async function main() {
  logger.info('Starting Codex7 Indexer Service...');

  // Configuration from environment
  const config = {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    queueName: process.env.QUEUE_NAME || 'codex7-indexing',
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1', 10)
  };

  // Create worker
  const worker = new IndexerWorker(config);

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    await worker.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    await worker.stop();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception', { error: error.message, stack: error.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason });
    process.exit(1);
  });

  // Start worker
  try {
    await worker.start();
  } catch (error) {
    logger.error('Failed to start worker', { error });
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error('Fatal error', { error });
    process.exit(1);
  });
}
```

**Deliverable**: Runnable entry point.

---

### 8. Logger Setup

#### src/utils/logger.ts
```typescript
import { initializeLogger } from '@codex7/shared';

/**
 * Logger instance for indexer service
 */
export const logger = initializeLogger('indexer');
```

---

### 9. Testing Framework

#### src/__tests__/worker.test.ts
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexerWorker } from '../worker.js';

describe('IndexerWorker', () => {
  let worker: IndexerWorker | null = null;

  afterEach(async () => {
    if (worker) {
      await worker.stop();
      worker = null;
    }
  });

  it('should create worker instance', () => {
    worker = new IndexerWorker({
      redisUrl: 'redis://localhost:6379',
      queueName: 'test-queue',
      concurrency: 1
    });

    expect(worker).toBeDefined();
  });

  // NOTE: Full integration tests require Redis
  // Will be tested in docker-compose environment
});
```

#### src/__tests__/pipeline.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { processJob } from '../pipeline/index.js';
import { SourceType } from '../queue/job-types.js';

describe('Processing Pipeline', () => {
  it('should process job and return result (STUB)', async () => {
    const jobData = {
      libraryId: 'test-lib',
      source: 'https://github.com/test/repo',
      sourceType: SourceType.GitHub
    };

    const result = await processJob(jobData);

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });
});
```

**Deliverable**: Basic test suite.

---

### 10. Package Exports

#### src/index.ts (also export worker class)
```typescript
export { IndexerWorker, type WorkerConfig } from './worker.js';
export { JobQueueClient, type QueueConfig } from './queue/client.js';
export * from './queue/job-types.js';
```

---

## ✅ Success Criteria

This phase is complete when:

- [ ] All directories and files created
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm test` runs all tests
- [ ] Worker can start (with Redis available)
- [ ] Jobs can be added to queue
- [ ] Worker consumes jobs (even if processing is stub)
- [ ] README.md documents usage

---

## 🚫 What We're NOT Doing

- ❌ Fetching real documents from sources
- ❌ Parsing markdown or PDF
- ❌ Chunking documents
- ❌ Generating embeddings
- ❌ Storing in database

---

## 📚 References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Architecture](../../docs/ARCHITECTURE.md) - Indexer design
- [PLAN.md](../../PLAN.md#indexer-service) - Indexing pipeline specs

---

**Made with 💜 by the Codex7 team**

*"Building indexing foundations, one job at a time"* 🔍✨
