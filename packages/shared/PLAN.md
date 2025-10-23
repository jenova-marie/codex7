# 📦 Shared Package - Framework Establishment Plan

> **Goal**: Create the foundational package with types, interfaces, and utilities that all other packages depend on. Establish logging, error handling, and testing infrastructure WITHOUT implementing any business logic.

---

## 🎯 Package Purpose

The `@codex7/shared` package provides:
- Common TypeScript interfaces and types
- Base error classes
- Utility functions for all packages
- Storage adapter interface (abstract, not implemented)
- Shared constants

**What we're NOT doing yet**: Implementing any storage adapters, business logic, or real functionality.

---

## 🏗️ Foundation Phase Tasks

### 1. Project Structure Setup

```
packages/shared/
├── src/
│   ├── index.ts                 # Main export file
│   ├── types/                   # TypeScript type definitions
│   │   ├── index.ts
│   │   ├── library.ts           # Library, Version, Document types
│   │   ├── search.ts            # Search query/result types
│   │   └── common.ts            # Common utility types
│   ├── interfaces/              # Abstract interfaces
│   │   ├── index.ts
│   │   └── storage.ts           # DocumentStore interface (abstract)
│   ├── errors/                  # Error handling
│   │   ├── index.ts
│   │   ├── base.ts              # BaseError class
│   │   ├── storage-errors.ts    # Storage-specific errors
│   │   └── validation-errors.ts # Validation errors
│   ├── utils/                   # Utility functions
│   │   ├── index.ts
│   │   ├── logger.ts            # Logger initialization
│   │   └── result-helpers.ts    # Result type helpers
│   ├── constants/               # Shared constants
│   │   ├── index.ts
│   │   └── patterns.ts          # Regex patterns, enums
│   └── __tests__/               # Test files
│       ├── types.test.ts
│       ├── errors.test.ts
│       └── utils.test.ts
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

**Deliverable**: Empty skeleton structure with all directories created.

---

### 2. Package Configuration

#### package.json
```json
{
  "name": "@codex7/shared",
  "version": "0.1.0",
  "description": "Shared types, interfaces, and utilities for Codex7",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@jenova-marie/ts-rust-result": "workspace:*",
    "@jenova-marie/wonder-logger": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "typescript": "^5.3.3",
    "vitest": "^1.1.0",
    "@vitest/coverage-v8": "^1.1.0"
  }
}
```

#### tsconfig.json
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

#### vitest.config.ts
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.test.ts',
        '**/*.config.ts'
      ]
    }
  }
});
```

**Deliverable**: All config files created and validated (`pnpm install` works).

---

### 3. Error Handling Framework

#### src/errors/base.ts
```typescript
import { Err, type Result } from '@jenova-marie/ts-rust-result';

/**
 * Base error class for all Codex7 errors.
 *
 * Provides structured error information that can be serialized
 * and logged consistently across all services.
 */
export abstract class Codex7Error extends Error {
  /**
   * Machine-readable error code (e.g., "LIBRARY_NOT_FOUND")
   */
  public readonly code: string;

  /**
   * HTTP status code (if applicable)
   */
  public readonly statusCode: number;

  /**
   * Additional context data
   */
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON-serializable format for logging/API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * Helper to create an Err Result from a Codex7Error
 */
export function toErrResult<T>(error: Codex7Error): Result<T, Codex7Error> {
  return Err(error);
}
```

#### src/errors/storage-errors.ts
```typescript
import { Codex7Error } from './base.js';

/**
 * Thrown when a requested library is not found in storage
 */
export class LibraryNotFoundError extends Codex7Error {
  constructor(libraryId: string) {
    super(
      `Library not found: ${libraryId}`,
      'LIBRARY_NOT_FOUND',
      404,
      { libraryId }
    );
  }
}

/**
 * Thrown when a database query fails
 */
export class DatabaseQueryError extends Codex7Error {
  constructor(query: string, originalError: Error) {
    super(
      `Database query failed: ${originalError.message}`,
      'DATABASE_QUERY_ERROR',
      500,
      { query, originalError: originalError.message }
    );
  }
}

/**
 * Thrown when storage connection fails
 */
export class StorageConnectionError extends Codex7Error {
  constructor(details: string) {
    super(
      `Failed to connect to storage: ${details}`,
      'STORAGE_CONNECTION_ERROR',
      503,
      { details }
    );
  }
}
```

#### src/errors/validation-errors.ts
```typescript
import { Codex7Error } from './base.js';

/**
 * Thrown when input validation fails
 */
export class ValidationError extends Codex7Error {
  constructor(field: string, reason: string) {
    super(
      `Validation failed for field '${field}': ${reason}`,
      'VALIDATION_ERROR',
      400,
      { field, reason }
    );
  }
}

/**
 * Thrown when a required parameter is missing
 */
export class MissingParameterError extends Codex7Error {
  constructor(parameter: string) {
    super(
      `Missing required parameter: ${parameter}`,
      'MISSING_PARAMETER',
      400,
      { parameter }
    );
  }
}
```

**Deliverable**: Complete error hierarchy with base class and specific error types.

---

### 4. Type Definitions

#### src/types/common.ts
```typescript
/**
 * UUID string type
 */
export type UUID = string;

/**
 * ISO 8601 timestamp string
 */
export type ISOTimestamp = string;

/**
 * Metadata object for flexible key-value storage
 */
export type Metadata = Record<string, unknown>;

/**
 * Pagination parameters
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
```

#### src/types/library.ts
```typescript
import type { UUID, ISOTimestamp, Metadata } from './common.js';

/**
 * Library identifier in Context7-compatible format
 * Examples: "/facebook/react", "/vercel/next.js/v14.0.0"
 */
export type LibraryIdentifier = string;

/**
 * Library entity representing a software library/framework
 */
export interface Library {
  id: UUID;
  name: string;
  identifier: LibraryIdentifier;
  repositoryUrl: string | null;
  homepageUrl: string | null;
  description: string | null;
  trustScore: number; // 1-10
  metadata: Metadata;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Version entity representing a specific version of a library
 */
export interface Version {
  id: UUID;
  libraryId: UUID;
  versionString: string; // e.g., "v18.2.0", "latest"
  gitCommitSha: string | null;
  releaseDate: ISOTimestamp | null;
  isLatest: boolean;
  createdAt: ISOTimestamp;
}

/**
 * Document entity representing a chunk of documentation
 */
export interface Document {
  id: UUID;
  versionId: UUID;
  title: string;
  content: string;
  contentHash: string; // SHA-256 for deduplication
  embedding: number[] | null; // 1536-dimensional vector
  chunkIndex: number;
  parentDocId: UUID | null;
  url: string | null;
  sourceType: SourceType;
  language: string; // ISO 639-1 code
  metadata: DocumentMetadata;
  indexedAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
}

/**
 * Source type for documents
 */
export enum SourceType {
  GitHub = 'github',
  Web = 'web',
  PDF = 'pdf',
  Manual = 'manual'
}

/**
 * Metadata specific to documents
 */
export interface DocumentMetadata {
  hierarchy: string[]; // e.g., ["React Hooks", "useState", "Example"]
  sectionLevel: number; // 1 for h1, 2 for h2, etc.
  hasCode: boolean;
  codeLanguage: string | null; // e.g., "jsx", "python"
  keywords: string[];
}
```

#### src/types/search.ts
```typescript
import type { UUID, Metadata } from './common.js';
import type { Document } from './library.js';

/**
 * Search query parameters
 */
export interface SearchQuery {
  query: string;
  filters?: SearchFilters;
  limit?: number;
}

/**
 * Filters for search queries
 */
export interface SearchFilters {
  libraryId?: UUID;
  versionId?: UUID;
  hasCode?: boolean;
  language?: string;
  sourceType?: string;
}

/**
 * Search result with relevance scoring
 */
export interface SearchResult {
  document: Document;
  relevanceScore: number; // 0.0 - 1.0
  matchType: 'semantic' | 'exact' | 'hybrid';
}

/**
 * Search response
 */
export interface SearchResponse {
  results: SearchResult[];
  tookMs: number;
  total: number;
}
```

**Deliverable**: Complete type definitions covering all core entities.

---

### 5. Storage Adapter Interface (Abstract)

#### src/interfaces/storage.ts
```typescript
import type { Result } from '@jenova-marie/ts-rust-result';
import type {
  Library,
  Version,
  Document,
  SearchQuery,
  SearchResult,
  UUID,
  PaginatedResponse
} from '../types/index.js';
import type { Codex7Error } from '../errors/index.js';

/**
 * Abstract storage adapter interface.
 *
 * All storage implementations must implement this interface.
 * This allows swapping databases (PostgreSQL, SQLite, Qdrant)
 * without changing application code.
 *
 * NOTE: This is ONLY the interface definition. No implementation yet!
 */
export interface DocumentStore {
  /**
   * Initialize the storage adapter (connect, run migrations, etc.)
   */
  initialize(): Promise<Result<void, Codex7Error>>;

  /**
   * Close storage connections gracefully
   */
  close(): Promise<Result<void, Codex7Error>>;

  /**
   * Health check - verify storage is accessible
   */
  healthCheck(): Promise<Result<boolean, Codex7Error>>;

  // ==================== Library Operations ====================

  /**
   * Get library by ID
   */
  getLibrary(id: UUID): Promise<Result<Library, Codex7Error>>;

  /**
   * Get library by identifier (e.g., "/facebook/react")
   */
  getLibraryByIdentifier(identifier: string): Promise<Result<Library, Codex7Error>>;

  /**
   * List all libraries with pagination
   */
  listLibraries(limit: number, offset: number): Promise<Result<PaginatedResponse<Library>, Codex7Error>>;

  /**
   * Create new library
   */
  createLibrary(library: Omit<Library, 'id' | 'createdAt' | 'updatedAt'>): Promise<Result<Library, Codex7Error>>;

  // ==================== Version Operations ====================

  /**
   * Get versions for a library
   */
  getVersions(libraryId: UUID): Promise<Result<Version[], Codex7Error>>;

  /**
   * Get latest version for a library
   */
  getLatestVersion(libraryId: UUID): Promise<Result<Version, Codex7Error>>;

  // ==================== Document Operations ====================

  /**
   * Index a document (store with embedding)
   */
  indexDocument(document: Omit<Document, 'id' | 'indexedAt' | 'updatedAt'>): Promise<Result<Document, Codex7Error>>;

  /**
   * Semantic search using vector similarity
   */
  semanticSearch(query: SearchQuery): Promise<Result<SearchResult[], Codex7Error>>;

  /**
   * Exact keyword search
   */
  exactSearch(query: SearchQuery): Promise<Result<SearchResult[], Codex7Error>>;

  /**
   * Hybrid search (combines semantic + exact)
   */
  hybridSearch(query: SearchQuery): Promise<Result<SearchResult[], Codex7Error>>;
}
```

**Deliverable**: Complete interface definition (NO implementation).

---

### 6. Logging Infrastructure

#### src/utils/logger.ts
```typescript
import { createLogger, type LoggerConfig } from '@jenova-marie/wonder-logger';

/**
 * Initialize logger for a Codex7 service
 *
 * @param serviceName - Name of the service (e.g., "mcp-server", "api")
 * @param config - Optional logger configuration overrides
 * @returns Configured logger instance
 */
export function initializeLogger(serviceName: string, config?: Partial<LoggerConfig>) {
  const defaultConfig: LoggerConfig = {
    serviceName,
    environment: process.env.NODE_ENV || 'development',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    prettyPrint: process.env.NODE_ENV === 'development',
    enableOpenTelemetry: process.env.ENABLE_OTEL === 'true',
    ...config
  };

  return createLogger(defaultConfig);
}

/**
 * Default logger instance for the shared package
 */
export const logger = initializeLogger('codex7-shared');
```

**Deliverable**: Logger initialization utility ready for all services.

---

### 7. Result Helper Utilities

#### src/utils/result-helpers.ts
```typescript
import { Result, Ok, Err } from '@jenova-marie/ts-rust-result';
import { Codex7Error } from '../errors/index.js';

/**
 * Wrap a promise in a Result type, catching any errors
 *
 * @param promise - Promise to wrap
 * @param errorMapper - Function to map caught errors to Codex7Error
 * @returns Result with success value or mapped error
 */
export async function wrapPromise<T>(
  promise: Promise<T>,
  errorMapper: (error: unknown) => Codex7Error
): Promise<Result<T, Codex7Error>> {
  try {
    const value = await promise;
    return Ok(value);
  } catch (error) {
    return Err(errorMapper(error));
  }
}

/**
 * Combine multiple Results into a single Result
 * Returns Ok with array of values if all succeed, Err with first error otherwise
 *
 * @param results - Array of Results to combine
 * @returns Combined Result
 */
export function combineResults<T>(
  results: Result<T, Codex7Error>[]
): Result<T[], Codex7Error> {
  const values: T[] = [];

  for (const result of results) {
    if (result.isErr()) {
      return Err(result.error);
    }
    values.push(result.value);
  }

  return Ok(values);
}
```

**Deliverable**: Utility functions for working with Result types.

---

### 8. Constants

#### src/constants/patterns.ts
```typescript
/**
 * Regex patterns for validation
 */
export const PATTERNS = {
  /**
   * Context7-compatible library ID format
   * Examples: "/facebook/react", "/vercel/next.js/v14.0.0"
   */
  LIBRARY_ID: /^\/[\w-]+\/[\w.-]+(?:\/[\w.-]+)?$/,

  /**
   * Semantic version string
   * Examples: "v18.2.0", "1.0.0-beta.1"
   */
  SEMVER: /^v?\d+\.\d+\.\d+(?:-[\w.]+)?$/,

  /**
   * GitHub repository URL
   */
  GITHUB_URL: /^https:\/\/github\.com\/([\w-]+)\/([\w.-]+)$/
};

/**
 * Default configuration values
 */
export const DEFAULTS = {
  /**
   * Default pagination limit
   */
  PAGINATION_LIMIT: 50,

  /**
   * Maximum pagination limit
   */
  MAX_PAGINATION_LIMIT: 200,

  /**
   * Default trust score for new libraries
   */
  DEFAULT_TRUST_SCORE: 5,

  /**
   * Embedding dimensions (OpenAI ada-002)
   */
  EMBEDDING_DIMENSIONS: 1536,

  /**
   * Default search result limit
   */
  DEFAULT_SEARCH_LIMIT: 10
};
```

**Deliverable**: Shared constants and patterns.

---

### 9. Testing Framework

#### src/__tests__/errors.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { Codex7Error, LibraryNotFoundError, ValidationError } from '../errors/index.js';

describe('Codex7Error', () => {
  it('should create base error with correct properties', () => {
    class TestError extends Codex7Error {
      constructor() {
        super('Test message', 'TEST_ERROR', 400, { foo: 'bar' });
      }
    }

    const error = new TestError();

    expect(error.message).toBe('Test message');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.statusCode).toBe(400);
    expect(error.context).toEqual({ foo: 'bar' });
    expect(error.name).toBe('TestError');
  });

  it('should serialize to JSON correctly', () => {
    const error = new LibraryNotFoundError('test-id');
    const json = error.toJSON();

    expect(json.name).toBe('LibraryNotFoundError');
    expect(json.message).toContain('test-id');
    expect(json.code).toBe('LIBRARY_NOT_FOUND');
    expect(json.statusCode).toBe(404);
  });
});

describe('LibraryNotFoundError', () => {
  it('should include library ID in context', () => {
    const error = new LibraryNotFoundError('react-123');

    expect(error.context).toEqual({ libraryId: 'react-123' });
    expect(error.statusCode).toBe(404);
  });
});

describe('ValidationError', () => {
  it('should include field and reason in context', () => {
    const error = new ValidationError('email', 'Invalid format');

    expect(error.context).toEqual({ field: 'email', reason: 'Invalid format' });
    expect(error.statusCode).toBe(400);
  });
});
```

#### src/__tests__/utils.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { Ok, Err } from '@jenova-marie/ts-rust-result';
import { wrapPromise, combineResults } from '../utils/result-helpers.js';
import { ValidationError } from '../errors/index.js';

describe('wrapPromise', () => {
  it('should wrap successful promise in Ok', async () => {
    const promise = Promise.resolve(42);
    const result = await wrapPromise(promise, (e) => new ValidationError('test', String(e)));

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toBe(42);
  });

  it('should wrap rejected promise in Err', async () => {
    const promise = Promise.reject(new Error('Failed'));
    const result = await wrapPromise(
      promise,
      (e) => new ValidationError('test', e instanceof Error ? e.message : String(e))
    );

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr()).toBeInstanceOf(ValidationError);
  });
});

describe('combineResults', () => {
  it('should combine all Ok results', () => {
    const results = [Ok(1), Ok(2), Ok(3)];
    const combined = combineResults(results);

    expect(combined.isOk()).toBe(true);
    expect(combined.unwrap()).toEqual([1, 2, 3]);
  });

  it('should return first Err if any Result is Err', () => {
    const error = new ValidationError('test', 'error');
    const results = [Ok(1), Err(error), Ok(3)];
    const combined = combineResults(results);

    expect(combined.isErr()).toBe(true);
    expect(combined.unwrapErr()).toBe(error);
  });
});
```

**Deliverable**: Test suite covering errors and utilities (aiming for 80%+ coverage).

---

### 10. Package Exports

#### src/index.ts
```typescript
// Types
export * from './types/index.js';

// Interfaces
export * from './interfaces/index.js';

// Errors
export * from './errors/index.js';

// Utils
export * from './utils/index.js';

// Constants
export * from './constants/index.js';
```

**Deliverable**: Clean public API with all exports organized.

---

## ✅ Success Criteria

This phase is complete when:

- [ ] All directories and files created
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm test` runs all tests (even if just placeholder tests)
- [ ] `pnpm type-check` passes
- [ ] Test coverage >= 80%
- [ ] README.md documents the package structure
- [ ] All exports work from other packages: `import { Library } from '@codex7/shared'`

---

## 🚫 What We're NOT Doing

- ❌ Implementing any storage adapters (that's `storage-postgres` package)
- ❌ Implementing any business logic
- ❌ Creating any MCP tools or API endpoints
- ❌ Adding database connections or migrations
- ❌ Implementing search algorithms

---

## 📚 References

- [Result Types](../../docs/ERROR_HANDLING.md)
- [Logging](../../docs/LOGGING.md)
- [Testing](../../docs/TESTING.md)
- [Architecture](../../docs/ARCHITECTURE.md)

---

**Made with 💜 by the Codex7 team**

*"Building solid foundations, one interface at a time"* 🏗️✨
