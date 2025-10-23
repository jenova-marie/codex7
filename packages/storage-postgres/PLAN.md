# 💾 PostgreSQL Storage Adapter - Framework Establishment Plan

> **Goal**: Create the PostgreSQL + pgvector storage adapter skeleton with logging, error handling, and testing infrastructure. NO actual database operations yet - just the framework!

---

## 🎯 Package Purpose

The `@codex7/storage-postgres` package provides:
- PostgreSQL + pgvector implementation of `DocumentStore` interface
- Database schema and migrations
- Connection management
- Query builders (stubs only for now)

**What we're NOT doing yet**: Implementing actual database queries, vector search, or indexing logic.

---

## 🏗️ Foundation Phase Tasks

### 1. Project Structure Setup

```
packages/storage-postgres/
├── src/
│   ├── index.ts                      # Main export
│   ├── adapter.ts                    # PostgresAdapter class (skeleton)
│   ├── connection.ts                 # Database connection management
│   ├── migrations/                   # SQL migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_add_indexes.sql
│   │   └── migration-runner.ts      # Migration execution logic
│   ├── queries/                      # SQL query builders
│   │   ├── libraries.ts             # Library queries (stubs)
│   │   ├── versions.ts              # Version queries (stubs)
│   │   └── documents.ts             # Document queries (stubs)
│   ├── errors/                       # Postgres-specific errors
│   │   ├── index.ts
│   │   └── postgres-errors.ts
│   ├── utils/                        # Utilities
│   │   ├── index.ts
│   │   ├── logger.ts                # Logger setup
│   │   └── query-helpers.ts         # Query helper stubs
│   └── __tests__/                    # Tests
│       ├── adapter.test.ts          # Adapter tests (with mocks)
│       ├── connection.test.ts       # Connection tests
│       └── migrations.test.ts       # Migration tests
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
  "name": "@codex7/storage-postgres",
  "version": "0.1.0",
  "description": "PostgreSQL + pgvector storage adapter for Codex7",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "migrate": "tsx src/migrations/migration-runner.ts",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@codex7/shared": "workspace:*",
    "@jenova-marie/ts-rust-result": "workspace:*",
    "@jenova-marie/wonder-logger": "workspace:*",
    "pg": "^8.11.3",
    "pgvector": "^0.1.8"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@types/pg": "^8.10.9",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0",
    "tsx": "^4.7.0"
  }
}
```

**Deliverable**: Config files ready.

---

### 3. Error Handling

#### src/errors/postgres-errors.ts
```typescript
import { Codex7Error } from '@codex7/shared';

/**
 * Thrown when PostgreSQL connection fails
 */
export class PostgresConnectionError extends Codex7Error {
  constructor(details: string, originalError?: Error) {
    super(
      `PostgreSQL connection failed: ${details}`,
      'POSTGRES_CONNECTION_ERROR',
      503,
      {
        details,
        originalError: originalError?.message
      }
    );
  }
}

/**
 * Thrown when a PostgreSQL query fails
 */
export class PostgresQueryError extends Codex7Error {
  constructor(query: string, originalError: Error) {
    super(
      `PostgreSQL query failed: ${originalError.message}`,
      'POSTGRES_QUERY_ERROR',
      500,
      {
        query: query.substring(0, 200), // Truncate for logging
        originalError: originalError.message,
        sqlState: (originalError as any).code
      }
    );
  }
}

/**
 * Thrown when pgvector extension is not available
 */
export class PgVectorNotInstalledError extends Codex7Error {
  constructor() {
    super(
      'pgvector extension is not installed. Run: CREATE EXTENSION vector;',
      'PGVECTOR_NOT_INSTALLED',
      500
    );
  }
}

/**
 * Thrown when migration fails
 */
export class MigrationError extends Codex7Error {
  constructor(migrationName: string, originalError: Error) {
    super(
      `Migration failed: ${migrationName} - ${originalError.message}`,
      'MIGRATION_ERROR',
      500,
      {
        migrationName,
        originalError: originalError.message
      }
    );
  }
}
```

**Deliverable**: Postgres-specific error classes.

---

### 4. Database Connection Management (Stub)

#### src/connection.ts
```typescript
import { Pool, type PoolConfig } from 'pg';
import { Ok, Err, type Result } from '@jenova-marie/ts-rust-result';
import { PostgresConnectionError } from './errors/postgres-errors.js';
import { logger } from './utils/logger.js';
import type { Codex7Error } from '@codex7/shared';

/**
 * PostgreSQL connection configuration
 */
export interface PostgresConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  maxConnections?: number;
  ssl?: boolean;
}

/**
 * PostgreSQL connection manager
 *
 * Handles connection pooling and lifecycle management.
 * STUB: Not actually connecting yet, just framework!
 */
export class PostgresConnection {
  private pool: Pool | null = null;
  private config: PostgresConfig;

  constructor(config: PostgresConfig) {
    this.config = config;
    logger.info('PostgresConnection initialized', {
      host: config.host,
      database: config.database
    });
  }

  /**
   * Connect to PostgreSQL database
   * STUB: Returns Ok for now, real connection in Phase 1
   */
  async connect(): Promise<Result<void, Codex7Error>> {
    logger.info('Connecting to PostgreSQL (STUB)...', {
      host: this.config.host,
      database: this.config.database
    });

    // TODO Phase 1: Implement actual connection
    // const poolConfig: PoolConfig = {
    //   host: this.config.host,
    //   port: this.config.port,
    //   database: this.config.database,
    //   user: this.config.user,
    //   password: this.config.password,
    //   max: this.config.maxConnections || 20,
    //   ssl: this.config.ssl
    // };
    //
    // this.pool = new Pool(poolConfig);

    logger.info('Connected to PostgreSQL (STUB - not really connected yet)');
    return Ok(undefined);
  }

  /**
   * Disconnect from PostgreSQL
   * STUB: Returns Ok for now
   */
  async disconnect(): Promise<Result<void, Codex7Error>> {
    logger.info('Disconnecting from PostgreSQL (STUB)...');

    // TODO Phase 1: Implement actual disconnect
    // if (this.pool) {
    //   await this.pool.end();
    //   this.pool = null;
    // }

    logger.info('Disconnected from PostgreSQL (STUB)');
    return Ok(undefined);
  }

  /**
   * Health check - verify database is accessible
   * STUB: Returns Ok(true) for now
   */
  async healthCheck(): Promise<Result<boolean, Codex7Error>> {
    logger.debug('Health check (STUB)');

    // TODO Phase 1: Implement actual health check
    // SELECT 1;

    return Ok(true);
  }

  /**
   * Get connection pool (for queries)
   * STUB: Returns null for now
   */
  getPool(): Pool | null {
    return this.pool;
  }
}
```

**Deliverable**: Connection manager skeleton with logging.

---

### 5. Storage Adapter Skeleton

#### src/adapter.ts
```typescript
import { Ok, Err, type Result } from '@jenova-marie/ts-rust-result';
import type {
  DocumentStore,
  Library,
  Version,
  Document,
  SearchQuery,
  SearchResult,
  UUID,
  PaginatedResponse,
  Codex7Error
} from '@codex7/shared';
import { PostgresConnection, type PostgresConfig } from './connection.js';
import { logger } from './utils/logger.js';

/**
 * PostgreSQL + pgvector implementation of DocumentStore interface
 *
 * STUB: All methods return Ok with placeholder data or errors.
 * Actual implementation comes in Phase 1.
 */
export class PostgresAdapter implements DocumentStore {
  private connection: PostgresConnection;
  private initialized: boolean = false;

  constructor(config: PostgresConfig) {
    this.connection = new PostgresConnection(config);
    logger.info('PostgresAdapter created (STUB)');
  }

  /**
   * Initialize the adapter - connect and verify schema
   * STUB: Just calls connection.connect()
   */
  async initialize(): Promise<Result<void, Codex7Error>> {
    logger.info('Initializing PostgresAdapter (STUB)...');

    const connectResult = await this.connection.connect();
    if (connectResult.isErr()) {
      return connectResult;
    }

    // TODO Phase 1: Run migrations, verify pgvector extension

    this.initialized = true;
    logger.info('PostgresAdapter initialized (STUB)');
    return Ok(undefined);
  }

  /**
   * Close database connections
   * STUB: Just calls connection.disconnect()
   */
  async close(): Promise<Result<void, Codex7Error>> {
    logger.info('Closing PostgresAdapter (STUB)...');
    return this.connection.disconnect();
  }

  /**
   * Health check
   * STUB: Returns result from connection health check
   */
  async healthCheck(): Promise<Result<boolean, Codex7Error>> {
    logger.debug('Health check (STUB)');
    return this.connection.healthCheck();
  }

  // ==================== Library Operations (STUBS) ====================

  async getLibrary(id: UUID): Promise<Result<Library, Codex7Error>> {
    logger.debug('getLibrary called (STUB)', { id });
    // TODO Phase 1: SELECT * FROM libraries WHERE id = $1
    throw new Error('Not implemented - Phase 1');
  }

  async getLibraryByIdentifier(identifier: string): Promise<Result<Library, Codex7Error>> {
    logger.debug('getLibraryByIdentifier called (STUB)', { identifier });
    // TODO Phase 1: SELECT * FROM libraries WHERE identifier = $1
    throw new Error('Not implemented - Phase 1');
  }

  async listLibraries(limit: number, offset: number): Promise<Result<PaginatedResponse<Library>, Codex7Error>> {
    logger.debug('listLibraries called (STUB)', { limit, offset });
    // TODO Phase 1: SELECT * FROM libraries LIMIT $1 OFFSET $2
    throw new Error('Not implemented - Phase 1');
  }

  async createLibrary(library: Omit<Library, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Library, Codex7Error>> {
    logger.debug('createLibrary called (STUB)', { library });
    // TODO Phase 1: INSERT INTO libraries ...
    throw new Error('Not implemented - Phase 1');
  }

  // ==================== Version Operations (STUBS) ====================

  async getVersions(libraryId: UUID): Promise<Result<Version[], Codex7Error>> {
    logger.debug('getVersions called (STUB)', { libraryId });
    // TODO Phase 1: SELECT * FROM versions WHERE library_id = $1
    throw new Error('Not implemented - Phase 1');
  }

  async getLatestVersion(libraryId: UUID): Promise<Result<Version, Codex7Error>> {
    logger.debug('getLatestVersion called (STUB)', { libraryId });
    // TODO Phase 1: SELECT * FROM versions WHERE library_id = $1 AND is_latest = true
    throw new Error('Not implemented - Phase 1');
  }

  // ==================== Document Operations (STUBS) ====================

  async indexDocument(document: Omit<Document, 'id' | 'indexedAt' | 'updatedAt'>): Promise<Result<Document, Codex7Error>> {
    logger.debug('indexDocument called (STUB)', { document });
    // TODO Phase 1: INSERT INTO documents ... with embedding
    throw new Error('Not implemented - Phase 1');
  }

  async semanticSearch(query: SearchQuery): Promise<Result<SearchResult[], Codex7Error>> {
    logger.debug('semanticSearch called (STUB)', { query });
    // TODO Phase 1: Vector similarity search with pgvector
    throw new Error('Not implemented - Phase 1');
  }

  async exactSearch(query: SearchQuery): Promise<Result<SearchResult[], Codex7Error>> {
    logger.debug('exactSearch called (STUB)', { query });
    // TODO Phase 1: Full-text search with to_tsvector
    throw new Error('Not implemented - Phase 1');
  }

  async hybridSearch(query: SearchQuery): Promise<Result<SearchResult[], Codex7Error>> {
    logger.debug('hybridSearch called (STUB)', { query });
    // TODO Phase 1: Combine semantic + exact search
    throw new Error('Not implemented - Phase 1');
  }
}
```

**Deliverable**: Complete adapter skeleton implementing interface.

---

### 6. Database Schema (SQL Files)

#### src/migrations/001_initial_schema.sql
```sql
-- Migration: Initial database schema
-- Description: Create core tables for libraries, versions, and documents

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Libraries table
CREATE TABLE IF NOT EXISTS libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  repository_url TEXT,
  homepage_url TEXT,
  description TEXT,
  trust_score INTEGER DEFAULT 5 CHECK (trust_score >= 1 AND trust_score <= 10),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Versions table
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  version_string VARCHAR(50) NOT NULL,
  git_commit_sha VARCHAR(40),
  release_date TIMESTAMP,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(library_id, version_string)
);

-- Documents table (chunks with embeddings)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64),
  embedding vector(1536), -- OpenAI ada-002 embedding dimensions
  chunk_index INTEGER,
  parent_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  url TEXT,
  source_type VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  indexed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Migration metadata table
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW()
);
```

#### src/migrations/002_add_indexes.sql
```sql
-- Migration: Add performance indexes
-- Description: Create indexes for fast queries and vector search

-- Libraries indexes
CREATE INDEX IF NOT EXISTS idx_libraries_identifier ON libraries(identifier);
CREATE INDEX IF NOT EXISTS idx_libraries_name ON libraries(name);

-- Versions indexes
CREATE INDEX IF NOT EXISTS idx_versions_library ON versions(library_id, version_string);
CREATE INDEX IF NOT EXISTS idx_versions_latest ON versions(library_id, is_latest) WHERE is_latest = true;

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version_id);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(content_hash);

-- Vector similarity index (IVFFlat for approximate nearest neighbor)
-- NOTE: This will be slow on empty table, run after initial data load
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documents_content_fts ON documents
USING GIN(to_tsvector('english', content));
```

**Deliverable**: Complete SQL schema ready for execution.

---

### 7. Migration Runner (Stub)

#### src/migrations/migration-runner.ts
```typescript
import { Ok, Err, type Result } from '@jenova-marie/ts-rust-result';
import { MigrationError } from '../errors/postgres-errors.js';
import { logger } from '../utils/logger.js';
import type { Codex7Error } from '@codex7/shared';

/**
 * Run database migrations
 *
 * STUB: Logs migrations but doesn't execute them yet.
 * Real implementation in Phase 1.
 */
export async function runMigrations(): Promise<Result<void, Codex7Error>> {
  logger.info('Running migrations (STUB)...');

  const migrations = [
    '001_initial_schema.sql',
    '002_add_indexes.sql'
  ];

  for (const migration of migrations) {
    logger.info('Would run migration (STUB)', { migration });

    // TODO Phase 1:
    // 1. Read SQL file
    // 2. Execute in transaction
    // 3. Record in migrations table
  }

  logger.info('Migrations complete (STUB)');
  return Ok(undefined);
}
```

**Deliverable**: Migration runner framework.

---

### 8. Logger Setup

#### src/utils/logger.ts
```typescript
import { initializeLogger } from '@codex7/shared';

/**
 * Logger instance for storage-postgres package
 */
export const logger = initializeLogger('storage-postgres');
```

**Deliverable**: Configured logger.

---

### 9. Testing Framework

#### src/__tests__/adapter.test.ts
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { PostgresAdapter } from '../adapter.js';
import type { PostgresConfig } from '../connection.js';

describe('PostgresAdapter', () => {
  let adapter: PostgresAdapter;
  let config: PostgresConfig;

  beforeEach(() => {
    config = {
      host: 'localhost',
      port: 5432,
      database: 'codex7_test',
      user: 'test',
      password: 'test'
    };
    adapter = new PostgresAdapter(config);
  });

  describe('initialize', () => {
    it('should initialize successfully (STUB)', async () => {
      const result = await adapter.initialize();

      expect(result.isOk()).toBe(true);
    });
  });

  describe('close', () => {
    it('should close connections successfully (STUB)', async () => {
      await adapter.initialize();
      const result = await adapter.close();

      expect(result.isOk()).toBe(true);
    });
  });

  describe('healthCheck', () => {
    it('should return healthy status (STUB)', async () => {
      await adapter.initialize();
      const result = await adapter.healthCheck();

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(true);
    });
  });

  describe('interface methods', () => {
    it('should throw "Not implemented" for getLibrary', async () => {
      await adapter.initialize();

      await expect(adapter.getLibrary('test-id')).rejects.toThrow('Not implemented - Phase 1');
    });

    it('should throw "Not implemented" for semanticSearch', async () => {
      await adapter.initialize();

      await expect(adapter.semanticSearch({ query: 'test' })).rejects.toThrow('Not implemented - Phase 1');
    });
  });
});
```

#### src/__tests__/connection.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { PostgresConnection } from '../connection.js';

describe('PostgresConnection', () => {
  it('should create connection instance', () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test'
    };

    const conn = new PostgresConnection(config);
    expect(conn).toBeDefined();
  });

  it('should connect successfully (STUB)', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test'
    };

    const conn = new PostgresConnection(config);
    const result = await conn.connect();

    expect(result.isOk()).toBe(true);
  });

  it('should disconnect successfully (STUB)', async () => {
    const config = {
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'test',
      password: 'test'
    };

    const conn = new PostgresConnection(config);
    await conn.connect();
    const result = await conn.disconnect();

    expect(result.isOk()).toBe(true);
  });
});
```

**Deliverable**: Test suite for adapter and connection (with stubs).

---

### 10. Package Exports

#### src/index.ts
```typescript
// Main adapter
export { PostgresAdapter } from './adapter.js';

// Configuration
export type { PostgresConfig } from './connection.js';

// Errors
export * from './errors/postgres-errors.js';

// Migration runner
export { runMigrations } from './migrations/migration-runner.js';
```

**Deliverable**: Clean exports.

---

## ✅ Success Criteria

This phase is complete when:

- [ ] All directories and files created
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm test` runs all tests (stub tests pass)
- [ ] `pnpm type-check` passes
- [ ] Adapter implements `DocumentStore` interface (even if stubs)
- [ ] SQL migration files are syntactically valid
- [ ] README.md documents setup and usage

---

## 🚫 What We're NOT Doing

- ❌ Actually connecting to PostgreSQL
- ❌ Running any database queries
- ❌ Implementing vector search
- ❌ Implementing full-text search
- ❌ Loading or storing real data

---

## 📚 References

- [Architecture](../../docs/ARCHITECTURE.md) - Storage adapter pattern
- [Database Schema](../../PLAN.md#database-layer) - Complete schema details
- [pgvector Documentation](https://github.com/pgvector/pgvector)

---

**Made with 💜 by the Codex7 team**

*"Building database foundations, one schema at a time"* 💾✨
