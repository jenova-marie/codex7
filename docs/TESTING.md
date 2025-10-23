# 🧪 Testing Guide for Codex7

Complete guide to testing practices, patterns, and tools used in Codex7.

---

## 🎯 Testing Philosophy

We believe in **comprehensive, meaningful tests** that:
- ✅ Verify actual behavior, not implementation details
- ✅ Cover edge cases and error conditions
- ✅ Serve as living documentation
- ✅ Run fast and provide quick feedback
- ✅ Are maintainable and readable

**Coverage Goals:**
- **80%+ overall** - Automated enforcement via CI
- **90%+ for critical paths** - Storage, validation, security
- **100% for public APIs** - All exported functions

---

## 🛠️ Testing Stack

- **Framework**: [Vitest](https://vitest.dev/) - Fast, modern, Vite-powered
- **Coverage**: v8 (built into Vitest)
- **Mocking**: Vitest built-in mocks
- **Assertions**: Vitest expect API (Jest-compatible)

---

## 🚀 Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run tests for specific package
pnpm --filter @codex7/shared test

# Run specific test file
pnpm --filter @codex7/shared test library-id.test.ts

# Type checking (separate from tests)
pnpm type-check
```

### CI/CD Integration

Tests run automatically on:
- ✅ Every pull request
- ✅ Commits to `main` branch
- ✅ Before deployments

**Required checks:**
- All tests pass
- Coverage thresholds met (80%+)
- No TypeScript errors
- Linting passes

---

## 📁 Test Organization

### Directory Structure

```
packages/
├── shared/
│   ├── src/
│   │   ├── utils/
│   │   │   ├── library-id.ts
│   │   │   └── __tests__/
│   │   │       ├── library-id.test.ts
│   │   │       └── README.md
│   │   └── storage/
│   │       ├── adapter.ts
│   │       └── __tests__/
│   │           └── adapter.test.ts
│   └── vitest.config.ts
└── mcp-server/
    ├── src/
    │   ├── tools/
    │   │   └── __tests__/
    │   └── server.ts
    └── vitest.config.ts
```

### Naming Conventions

- **Test files**: `*.test.ts` (e.g., `library-id.test.ts`)
- **Test directories**: `__tests__/` adjacent to source files
- **Mock files**: `__mocks__/` at package root
- **Fixtures**: `__fixtures__/` for test data

---

## ✍️ Writing Tests

### Basic Structure

```typescript
/**
 * 🧪 Tests for [Feature Name]
 */

import { describe, it, expect } from 'vitest';
import { functionToTest } from '../module.js';

describe('functionToTest', () => {
  it('should handle normal case', () => {
    const result = functionToTest('input');

    expect(result).toBe('expected');
  });

  it('should reject invalid input', () => {
    expect(() => functionToTest(null)).toThrow();
  });

  it('should handle edge cases', () => {
    expect(functionToTest('')).toBe('');
  });
});
```

### Testing Result Types

All our utilities return `Result<T, Error>` from `@jenova-marie/ts-rust-result`.

**Pattern for testing success:**

```typescript
it('should validate correct input', () => {
  const result = validateUrl('https://example.com');

  // Check if result is Ok
  expect(result.isOk()).toBe(true);

  // Unwrap and verify value
  const url = result.unwrap();
  expect(url.hostname).toBe('example.com');
});
```

**Pattern for testing errors:**

```typescript
it('should reject invalid input', () => {
  const result = validateUrl('not-a-url');

  // Check if result is Err
  expect(result.isErr()).toBe(true);

  // Unwrap error and verify message
  const error = result.unwrapErr();
  expect(error.message).toContain('Invalid URL');
});
```

### Testing Async Functions

```typescript
it('should fetch data successfully', async () => {
  const result = await fetchLibraryDocs('/vercel/next.js');

  expect(result.isOk()).toBe(true);
  expect(result.unwrap().content).toBeTruthy();
});

it('should handle errors gracefully', async () => {
  const result = await fetchLibraryDocs('/invalid/library');

  expect(result.isErr()).toBe(true);
});
```

### Edge Cases to Test

Always test these scenarios:

- ✅ **Empty strings**: `''`
- ✅ **Whitespace**: `'   '`, `'\n\t'`
- ✅ **Null/undefined**: Where TypeScript allows
- ✅ **Boundary values**: Min/max ranges
- ✅ **Special characters**: Unicode, emojis, newlines
- ✅ **Very long inputs**: Performance, truncation
- ✅ **Concurrent operations**: Race conditions

---

## 🎭 Mocking

### Mocking Modules

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock an entire module
vi.mock('../database.js', () => ({
  connectToDatabase: vi.fn(() => Promise.resolve()),
  query: vi.fn(() => Promise.resolve([])),
}));

// Or mock specific functions
vi.mock('node:crypto', () => ({
  createHash: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    digest: vi.fn(() => 'mocked-hash'),
  })),
}));
```

### Mocking Storage Adapters

```typescript
import { vi } from 'vitest';
import type { StorageAdapter } from '../storage/adapter.js';

const mockAdapter: StorageAdapter = {
  initialize: vi.fn(() => Promise.resolve(Ok(undefined))),
  getLibrary: vi.fn(() => Promise.resolve(Ok(mockLibrary))),
  semanticSearch: vi.fn(() => Promise.resolve(Ok([]))),
  // ... other methods
};
```

---

## 📊 Coverage

### Viewing Coverage Reports

After running `pnpm test:coverage`:

```bash
# Open HTML report
open coverage/index.html

# View terminal summary
cat coverage/coverage-summary.json
```

### Coverage Thresholds

Configured in `vitest.config.ts`:

```typescript
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
}
```

**What's excluded from coverage:**
- Type definition files (`*.d.ts`)
- Config files (`*.config.ts`)
- Test files themselves
- Generated code
- Build artifacts

---

## 🔧 Test Utilities

### Global Test Helpers

Located in `vitest.setup.ts`:

```typescript
import { testHelpers } from '../vitest.setup.js';

it('should work with mock data', () => {
  const libraryId = testHelpers.mockLibraryId('vercel', 'next.js');
  const embedding = testHelpers.mockEmbedding(1536);

  expect(libraryId).toBe('/vercel/next.js');
  expect(embedding.length).toBe(1536);
});
```

### Fixtures

Store reusable test data in `__fixtures__/`:

```typescript
// __fixtures__/libraries.ts
export const mockLibraries = [
  {
    id: '1',
    name: 'Next.js',
    identifier: '/vercel/next.js',
    trustScore: 10,
    // ...
  },
  // ...
];
```

---

## 🎯 Testing Best Practices

### DO ✅

- **Write tests first** (TDD when possible)
- **Test behavior, not implementation**
- **Use descriptive test names** that read like documentation
- **Test one thing per test** (single assertion principle)
- **Clean up after tests** (mocks, database state)
- **Use arrange-act-assert pattern**
- **Test error cases** as thoroughly as success cases

### DON'T ❌

- **Test private functions directly** (test through public API)
- **Mock everything** (integration tests are valuable)
- **Write tests just for coverage** (meaningless tests are worse than none)
- **Leave `.only()` or `.skip()` in commits**
- **Ignore flaky tests** (fix them or remove them)
- **Copy-paste test code** (DRY applies to tests too)

---

## 🧩 Testing Different Components

### Testing Utilities (Pure Functions)

```typescript
describe('parseLibraryId', () => {
  it('should parse valid IDs', () => {
    const result = parseLibraryId('/vercel/next.js');
    expect(result.unwrap().org).toBe('vercel');
  });

  it('should reject invalid IDs', () => {
    expect(parseLibraryId('invalid').isErr()).toBe(true);
  });
});
```

### Testing Storage Adapters

```typescript
describe('PostgresAdapter', () => {
  let adapter: StorageAdapter;

  beforeEach(async () => {
    adapter = new PostgresAdapter();
    await adapter.initialize(testConfig);
  });

  afterEach(async () => {
    await adapter.close();
  });

  it('should store and retrieve documents', async () => {
    const doc = createMockDocument();
    await adapter.indexDocument(doc);

    const result = await adapter.getDocument(doc.id);
    expect(result.unwrap()).toEqual(doc);
  });
});
```

### Testing MCP Tools

```typescript
describe('resolveLibraryId', () => {
  it('should return matching libraries', async () => {
    const result = await resolveLibraryId({
      libraryName: 'next.js',
    });

    expect(result.libraries).toContainEqual(
      expect.objectContaining({
        identifier: '/vercel/next.js',
      })
    );
  });
});
```

### Testing API Endpoints

```typescript
import request from 'supertest';
import { app } from '../app.js';

describe('GET /api/libraries/:id', () => {
  it('should return library details', async () => {
    const response = await request(app)
      .get('/api/libraries/vercel-nextjs')
      .expect(200);

    expect(response.body.identifier).toBe('/vercel/next.js');
  });

  it('should return 404 for unknown library', async () => {
    await request(app)
      .get('/api/libraries/unknown')
      .expect(404);
  });
});
```

---

## 🐛 Debugging Tests

### Running Single Test

```bash
# By file pattern
pnpm test library-id

# By test name pattern
pnpm test -t "should parse valid"

# Specific file with debugging
node --inspect-brk ./node_modules/vitest/vitest.mjs run library-id.test.ts
```

### Debug Output

```typescript
import { debug } from 'vitest';

it('should do something', () => {
  const result = complexFunction();

  // Log during test execution
  console.log('Result:', result);

  expect(result).toBeDefined();
});
```

### Isolating Flaky Tests

```typescript
// Run only this test
it.only('should test specific scenario', () => {
  // ...
});

// Skip this test
it.skip('should be fixed later', () => {
  // ...
});
```

**Remember**: Remove `.only()` and `.skip()` before committing!

---

## 🔄 Continuous Integration

### GitHub Actions Workflow

Tests run on every push:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm type-check

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Kent C. Dodds - Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
- [Result Type Documentation](https://github.com/jenova-marie/ts-rust-result)

---

## 🎉 Testing Culture

At Codex7, we believe:
- 💜 **Tests are first-class citizens** - They deserve the same care as production code
- 🚀 **Fast feedback loops** - Tests should run quickly
- 📝 **Documentation via tests** - Well-written tests explain how code works
- 🛡️ **Confidence to refactor** - Good tests enable fearless improvements
- 🤝 **Shared responsibility** - Everyone writes and maintains tests

---

**Questions? Found a testing pattern we should document?**

Open an issue or discussion on GitHub! 💜✨

---

**Made with 💜 by the Codex7 team**

*"Code without tests is broken by design" - Jacob Kaplan-Moss*
