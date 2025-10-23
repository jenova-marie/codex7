# 🔒 Error Handling in Codex7

**Using `@jenova-marie/ts-rust-result` for type-safe, explicit error handling**

---

## 🎯 Philosophy

Codex7 treats **errors as values**, not exceptions. This means:

- ✅ **Explicit over implicit** - Function signatures reveal possible failures
- ✅ **Type-safe propagation** - Compiler enforces error handling
- ✅ **Preserved context** - Error chains maintain full debugging information
- ✅ **No surprise exceptions** - Predictable control flow throughout the codebase
- ✅ **JSON-serializable errors** - Perfect for logging, APIs, and observability

We use `@jenova-marie/ts-rust-result` to achieve Rust-style error handling in TypeScript.

---

## 📚 Core Concepts

### Result Type

Every operation that can fail returns a `Result<T, E>`:

```typescript
type Result<T, E> = Ok<T> | Err<E>
```

- **`Ok<T>`** - Success case containing value `T`
- **`Err<E>`** - Failure case containing error `E`

### Basic Usage

```typescript
import { ok, err, type Result } from '@jenova-marie/ts-rust-result';

function divideNumbers(a: number, b: number): Result<number, DivisionError> {
  if (b === 0) {
    return err(divisionByZero(a));
  }
  return ok(a / b);
}

// Usage
const result = divideNumbers(10, 2);

if (result.isOk()) {
  console.log('Result:', result.value); // 5
} else {
  console.error('Error:', result.error.message);
}
```

---

## 🏗️ Codex7 Error Architecture

### Error Categories

Codex7 errors are organized into domain-specific categories:

```
errors/
├── storage-errors.ts      # Database, vector store errors
├── indexer-errors.ts      # Document processing, scraping errors
├── mcp-errors.ts          # MCP protocol errors
├── api-errors.ts          # REST API errors
├── validation-errors.ts   # Input validation errors
└── common-errors.ts       # Shared error types
```

### Error Structure

All Codex7 errors follow this structure:

```typescript
interface BaseError {
  kind: string;           // Discriminator (e.g., "DocumentNotFound")
  message: string;        // Human-readable description
  context: object;        // Domain-specific data
  cause?: BaseError;      // Chained underlying error
  timestamp: number;      // When error occurred
  stack?: string;         // Stack trace (dev only)
}
```

**Why plain objects?**
- ✅ Perfect JSON serialization for APIs and logging
- ✅ No prototype chain overhead
- ✅ Works across module boundaries
- ✅ TypeScript discriminated unions for type safety

---

## 🎨 Domain-Specific Result Wrappers

### Pattern: Create Once, Use Everywhere

Each package defines its own `ok()` and `err()` helpers:

```typescript
// packages/storage-postgres/src/errors/index.ts
import { createDomainResult } from '@jenova-marie/ts-rust-result';
import type { StorageError } from './storage-errors.js';

export const { ok, err, Result } = createDomainResult<StorageError>();

// Export type alias for convenience
export type StorageResult<T> = Result<T, StorageError>;
```

**Benefits:**
- ✅ No type assertions needed: `return ok(data)` just works
- ✅ Error types inferred from function return type
- ✅ Consistent across the entire package
- ✅ Zero runtime overhead

### Usage in Package

```typescript
import { ok, err, type StorageResult } from './errors/index.js';

export async function getLibrary(id: string): StorageResult<Library> {
  const query = 'SELECT * FROM libraries WHERE id = $1';

  try {
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return err(libraryNotFound(id));
    }

    return ok(result.rows[0]);
  } catch (error) {
    return err(databaseQueryFailed(query, error));
  }
}
```

---

## 🔥 Error Type Definitions

### Storage Errors

```typescript
// packages/storage-postgres/src/errors/storage-errors.ts
import { error } from '@jenova-marie/ts-rust-result';

// Error type union
export type StorageError =
  | LibraryNotFoundError
  | DocumentNotFoundError
  | DatabaseConnectionError
  | DatabaseQueryError
  | VectorSearchError
  | DuplicateEntryError;

// Error interfaces
export interface LibraryNotFoundError {
  kind: 'LibraryNotFound';
  message: string;
  context: {
    libraryId: string;
  };
  cause?: StorageError;
  timestamp: number;
  stack?: string;
}

export interface DatabaseQueryError {
  kind: 'DatabaseQueryError';
  message: string;
  context: {
    query: string;
    errorCode?: string;
    table?: string;
  };
  cause?: StorageError;
  timestamp: number;
  stack?: string;
}

// Factory functions
export function libraryNotFound(libraryId: string): LibraryNotFoundError {
  return error('LibraryNotFound')
    .withMessage(`Library not found: ${libraryId}`)
    .withContext({ libraryId })
    .build();
}

export function databaseQueryFailed(
  query: string,
  cause?: unknown
): DatabaseQueryError {
  return error('DatabaseQueryError')
    .withMessage('Database query failed')
    .withContext({ query })
    .withCause(cause)
    .captureStack() // Capture for infrastructure failures
    .build();
}
```

### Indexer Errors

```typescript
// packages/indexer/src/errors/indexer-errors.ts
export type IndexerError =
  | GitHubFetchError
  | MarkdownParseError
  | ChunkingError
  | EmbeddingGenerationError
  | RateLimitError;

export interface GitHubFetchError {
  kind: 'GitHubFetchError';
  message: string;
  context: {
    repositoryUrl: string;
    statusCode?: number;
  };
  cause?: IndexerError;
  timestamp: number;
  stack?: string;
}

export function gitHubFetchFailed(
  repositoryUrl: string,
  statusCode?: number
): GitHubFetchError {
  return error('GitHubFetchError')
    .withMessage(`Failed to fetch from GitHub: ${repositoryUrl}`)
    .withContext({ repositoryUrl, statusCode })
    .build();
}
```

### MCP Errors

```typescript
// packages/mcp-server/src/errors/mcp-errors.ts
export type MCPError =
  | InvalidLibraryIdError
  | LibraryNotIndexedError
  | SearchFailedError
  | ToolExecutionError;

export interface InvalidLibraryIdError {
  kind: 'InvalidLibraryId';
  message: string;
  context: {
    providedId: string;
    expectedFormat: string;
  };
  cause?: MCPError;
  timestamp: number;
  stack?: string;
}

export function invalidLibraryId(
  providedId: string
): InvalidLibraryIdError {
  return error('InvalidLibraryId')
    .withMessage(`Invalid library ID format: ${providedId}`)
    .withContext({
      providedId,
      expectedFormat: '/org/project or /org/project/version',
    })
    .build();
}
```

### API Errors

```typescript
// packages/api/src/errors/api-errors.ts
export type APIError =
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | NotFoundError
  | RateLimitExceededError
  | InternalServerError;

export interface ValidationError {
  kind: 'ValidationError';
  message: string;
  context: {
    field: string;
    value: unknown;
    constraint: string;
  };
  cause?: APIError;
  timestamp: number;
  stack?: string;
}

export function validationFailed(
  field: string,
  value: unknown,
  constraint: string
): ValidationError {
  return error('ValidationError')
    .withMessage(`Validation failed for field: ${field}`)
    .withContext({ field, value, constraint })
    .build(); // No stack trace for validation errors
}
```

---

## 🔄 Error Propagation Patterns

### Pattern 1: Direct Propagation (Same Error Type)

When calling functions that return the same error type:

```typescript
export async function indexLibrary(
  libraryId: string
): StorageResult<Library> {
  // getLibrary returns StorageResult<Library>
  const libraryResult = await getLibrary(libraryId);

  // Direct propagation - types match!
  if (!libraryResult.ok) {
    return libraryResult;
  }

  const library = libraryResult.value;

  // ... rest of logic
  return ok(library);
}
```

### Pattern 2: Error Conversion (Different Error Types)

When error types don't match:

```typescript
import { ok as storageOk, err as storageErr } from '../storage/errors/index.js';
import { ok as indexerOk, err as indexerErr } from './errors/index.js';

export async function processDocument(
  docId: string
): IndexerResult<ProcessedDocument> {
  // Storage returns StorageResult<Document>
  const docResult = await storage.getDocument(docId);

  if (!docResult.ok) {
    // Convert storage error to indexer error with cause chain
    return err(
      error('DocumentProcessingFailed')
        .withMessage('Failed to retrieve document for processing')
        .withContext({ docId })
        .withCause(docResult.error) // Preserve error chain!
        .build()
    );
  }

  const doc = docResult.value;
  // ... process document
  return ok(processedDoc);
}
```

### Pattern 3: Chaining Multiple Operations

```typescript
export async function indexGitHubRepo(
  repoUrl: string
): IndexerResult<IndexedLibrary> {
  // Step 1: Fetch from GitHub
  const fetchResult = await fetchGitHubRepo(repoUrl);
  if (!fetchResult.ok) return fetchResult;

  // Step 2: Parse markdown
  const parseResult = await parseMarkdown(fetchResult.value);
  if (!parseResult.ok) return parseResult;

  // Step 3: Generate embeddings
  const embeddingResult = await generateEmbeddings(parseResult.value);
  if (!embeddingResult.ok) return embeddingResult;

  // Step 4: Store in database
  const storeResult = await storeDocuments(embeddingResult.value);
  if (!storeResult.ok) {
    // Convert storage error to indexer error
    return err(
      error('IndexingFailed')
        .withCause(storeResult.error)
        .build()
    );
  }

  return ok(storeResult.value);
}
```

---

## 🎭 Async Error Handling

### Wrapping External APIs (that throw)

Use `tryResult()` to convert exceptions to Results:

```typescript
import { tryResult } from '@jenova-marie/ts-rust-result';

export async function generateEmbedding(
  text: string
): IndexerResult<number[]> {
  // OpenAI SDK throws on errors
  const result = await tryResult(async () => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return response.data[0].embedding;
  });

  if (!result.ok) {
    return err(
      embeddingGenerationFailed(text, result.error)
    );
  }

  return ok(result.value);
}
```

### Promise.all with Results

```typescript
export async function indexMultipleDocuments(
  docs: Document[]
): IndexerResult<IndexedDocument[]> {
  const results = await Promise.all(
    docs.map(doc => indexDocument(doc))
  );

  // Find first error
  const firstError = results.find(r => !r.ok);
  if (firstError && !firstError.ok) {
    return firstError;
  }

  // All succeeded - extract values
  const indexed = results.map(r => r.value as IndexedDocument);
  return ok(indexed);
}
```

---

## 🔍 Stack Trace Strategy

Stack traces are **expensive** - use them wisely:

### When to Capture Stacks

**✅ DO capture for:**
- Infrastructure failures (database connection, network errors)
- Unexpected exceptions from third-party libraries
- Internal assertion failures
- Critical security errors

```typescript
export function databaseConnectionFailed(error: unknown): DatabaseConnectionError {
  return error('DatabaseConnectionError')
    .withMessage('Failed to connect to database')
    .withCause(error)
    .captureStack() // 👈 Capture for infrastructure
    .build();
}
```

**❌ DON'T capture for:**
- Validation errors (expected, high-volume)
- Business logic errors (e.g., library not found)
- Rate limit errors
- Expected API failures

```typescript
export function libraryNotFound(id: string): LibraryNotFoundError {
  return error('LibraryNotFound')
    .withMessage(`Library not found: ${id}`)
    .withContext({ id })
    .build(); // 👈 No stack - expected error
}
```

### Environment Configuration

```typescript
// In development/test
setCaptureStacks(true);  // Always capture

// In production
setCaptureStacks(false); // Never capture (performance)

// Or let it auto-detect from NODE_ENV
setCaptureStacks(undefined); // Default behavior
```

---

## 🌐 HTTP API Error Responses

### Converting Results to HTTP Responses

```typescript
import { type APIError, toHTTPError } from './errors/index.js';

export function handleSearchRequest(req: Request, res: Response) {
  const result = await searchDocuments(req.body.query);

  if (!result.ok) {
    const httpError = toHTTPError(result.error);
    return res.status(httpError.statusCode).json({
      error: {
        kind: result.error.kind,
        message: result.error.message,
        ...result.error.context,
      },
    });
  }

  return res.json({ data: result.value });
}

// Error to HTTP status code mapping
function toHTTPError(error: APIError): { statusCode: number } {
  switch (error.kind) {
    case 'ValidationError':
      return { statusCode: 400 };
    case 'UnauthorizedError':
      return { statusCode: 401 };
    case 'ForbiddenError':
      return { statusCode: 403 };
    case 'NotFoundError':
      return { statusCode: 404 };
    case 'RateLimitExceededError':
      return { statusCode: 429 };
    default:
      return { statusCode: 500 };
  }
}
```

---

## 📊 Logging & Observability

### Structured Error Logging

```typescript
import { logger } from '@jenova-marie/wonder-logger';

function logError(error: BaseError, level: 'warn' | 'error' = 'error') {
  logger[level]({
    errorKind: error.kind,
    message: error.message,
    context: error.context,
    timestamp: error.timestamp,
    stack: error.stack,
    // Follow error chain
    cause: error.cause ? {
      kind: error.cause.kind,
      message: error.cause.message,
    } : undefined,
  });
}

// Usage
const result = await indexLibrary(libraryId);
if (!result.ok) {
  logError(result.error);
  return result;
}
```

### Integration with Sentry

```typescript
import { toSentryError } from '@jenova-marie/ts-rust-result';
import * as Sentry from '@sentry/node';

if (!result.ok) {
  // Convert to Error instance for Sentry
  Sentry.captureException(toSentryError(result.error));
  return result;
}
```

---

## ✅ Best Practices Summary

### DO ✅

- **Return Results** - All functions that can fail return `Result<T, E>`
- **Use domain wrappers** - Create `ok()/err()` per package
- **Propagate directly** - Early return when types match
- **Chain errors** - Use `.withCause()` to preserve context
- **Log structured** - JSON-serialize errors for observability
- **Pattern match** - Switch on `error.kind` for type-safe handling
- **Skip stacks for expected errors** - Validation, business logic

### DON'T ❌

- **Throw exceptions** - Exceptions are for truly unexpected failures
- **Swallow errors** - Always handle or propagate
- **Use `any`** - Leverage discriminated unions
- **Capture stacks everywhere** - Only for unexpected failures
- **Convert to Error unnecessarily** - Keep plain objects internal

---

## 📚 Quick Reference

### Import Patterns

```typescript
// In each package's errors/index.ts
import { createDomainResult, error } from '@jenova-marie/ts-rust-result';

export const { ok, err, Result } = createDomainResult<YourErrorType>();
export type YourResult<T> = Result<T, YourErrorType>;

// In package source files
import { ok, err, type YourResult } from './errors/index.js';
```

### Common Patterns

```typescript
// Check and propagate
if (!result.ok) return result;

// Check and convert
if (!result.ok) {
  return err(customError().withCause(result.error).build());
}

// Extract value (after check)
const value = result.value;

// Unwrap (throws if error - use sparingly!)
const value = result.unwrap();

// Map over success
const mapped = result.map(value => transform(value));

// Map over error
const mappedErr = result.mapErr(err => enhanceError(err));
```

---

**Made with 💜 by the Codex7 team**

*"Errors are values, not exceptions"* ✨

