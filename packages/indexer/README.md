# 🔍 Codex7 Indexer Service

> **Background document processing service for Codex7**
>
> Phase 0: Framework established - Worker infrastructure ready, processing stubs in place 🎯

---

## 📋 Package Overview

The `@codex7/indexer` package provides background document indexing capabilities:

- ✅ **Job Queue Worker** - BullMQ-based worker for background processing
- ✅ **Redis Integration** - Distributed job queue via Redis
- ✅ **Processing Pipeline** - 4-stage pipeline framework (fetch, chunk, embed, store)
- ✅ **Source Processors** - GitHub, Web, PDF processor stubs
- ✅ **Structured Logging** - Wonder-logger with trace context
- ✅ **Error Handling** - Graceful shutdown and error recovery

**Current Status**: Phase 0 - Framework Only (all processing is stubbed)

---

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pnpm install

# Build package
pnpm build
```

### Running the Service

```bash
# Start Redis (required)
docker run -d -p 6379:6379 redis:latest

# Start indexer worker
pnpm start

# Or in development mode (with watch)
pnpm dev
```

### Environment Variables

```bash
# Redis connection
REDIS_URL=redis://localhost:6379

# Queue configuration
QUEUE_NAME=codex7-indexing
WORKER_CONCURRENCY=1

# Logging
LOG_LEVEL=info
LOG_PRETTY=false
NODE_ENV=development
```

---

## 📚 Architecture

### Processing Pipeline

The indexer uses a 4-stage pipeline (currently all stubs):

```
📥 Fetch Source → ✂️ Chunk Docs → ✨ Generate Embeddings → 💾 Store
```

**Phase 0 Status**: All stages are stubs that log but don't process

### Job Types

Three source types are supported:

```typescript
// GitHub repository
{
  libraryId: '/vercel/next.js',
  source: 'https://github.com/vercel/next.js',
  sourceType: SourceType.GitHub,
  branch: 'main',
  path: 'docs/'
}

// Web documentation
{
  libraryId: '/react/docs',
  source: 'https://react.dev/learn',
  sourceType: SourceType.Web,
  maxDepth: 3
}

// PDF documentation
{
  libraryId: '/manual/pdf',
  source: '/path/to/manual.pdf',
  sourceType: SourceType.PDF
}
```

---

## 🛠️ Development

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# With coverage
pnpm test:coverage
```

**Phase 0 Note**: Tests verify framework structure, not actual processing

### Type Checking

```bash
pnpm type-check
```

### Code Structure

```
src/
├── index.ts                # Entry point + exports
├── worker.ts               # BullMQ worker
├── queue/
│   ├── client.ts          # Queue client (add jobs, get status)
│   └── job-types.ts       # Job type definitions
├── pipeline/
│   ├── index.ts           # Pipeline coordinator
│   ├── fetcher.ts         # Source fetching (STUB)
│   ├── chunker.ts         # Document chunking (STUB)
│   ├── embedder.ts        # Embedding generation (STUB)
│   └── storer.ts          # Database storage (STUB)
├── processors/
│   ├── github.ts          # GitHub processor (STUB)
│   ├── web.ts             # Web scraper (STUB)
│   └── pdf.ts             # PDF parser (STUB)
├── utils/
│   └── logger.ts          # Wonder-logger instance
└── __tests__/
    ├── worker.test.ts
    ├── pipeline.test.ts
    └── processors.test.ts
```

---

## 🧩 Programmatic Usage

### Starting a Worker

```typescript
import { IndexerWorker } from '@codex7/indexer';

const worker = new IndexerWorker({
  redisUrl: 'redis://localhost:6379',
  queueName: 'codex7-indexing',
  concurrency: 1,
});

await worker.start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  await worker.stop();
  process.exit(0);
});
```

### Adding Jobs to Queue

```typescript
import { JobQueueClient, SourceType } from '@codex7/indexer';

const client = new JobQueueClient({
  redisUrl: 'redis://localhost:6379',
  queueName: 'codex7-indexing',
});

// Add indexing job
const jobId = await client.addJob({
  libraryId: '/vercel/next.js',
  source: 'https://github.com/vercel/next.js',
  sourceType: SourceType.GitHub,
  branch: 'canary',
  path: 'docs/',
});

// Check job status
const status = await client.getJobStatus(jobId);
console.log(status);

// Cleanup
await client.close();
```

---

## 🔮 Phase 1 Roadmap

The following will be implemented in Phase 1:

### Source Fetching
- 🐙 **GitHub**: Clone repos or use GitHub API, extract markdown
- 🌐 **Web**: Playwright-based scraping with robots.txt respect
- 📄 **PDF**: Parse PDFs while preserving structure

### Document Processing
- ✂️ **Chunking**: Structural chunking by markdown headers
- ✨ **Embeddings**: OpenAI API integration with batching
- 💾 **Storage**: PostgreSQL + pgvector via storage adapter

### Production Features
- 🔄 **Retry Logic**: Exponential backoff for failures
- 📊 **Metrics**: Document counts, processing time
- 🛡️ **Rate Limiting**: Respect API rate limits
- 🧪 **Integration Tests**: Full end-to-end testing with Redis

---

## 📖 References

- [BullMQ Documentation](https://docs.bullmq.io/)
- [Redis Documentation](https://redis.io/docs/)
- [Wonder-Logger](https://github.com/jenova-marie/wonder-logger)
- [Project Architecture](../../docs/ARCHITECTURE.md)
- [Complete Plan](./PLAN.md)

---

## 💜 Contributing

Phase 0 is complete! Phase 1 contributions welcome:

- Implement source processors (GitHub, Web, PDF)
- Add embedding generation
- Integrate storage adapter
- Write integration tests

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

---

**Made with 💜 by the Codex7 team**

*"Building indexing foundations, one job at a time"* 🔍✨
