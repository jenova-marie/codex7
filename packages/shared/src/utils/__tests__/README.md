# 🧪 Shared Package Tests

This directory contains tests for the shared utilities package.

## Test Structure

```
__tests__/
├── library-id.test.ts      # Library ID parsing and formatting
├── validation.test.ts      # Input validation utilities
├── text.test.ts           # Text processing functions
└── hash.test.ts           # Hashing utilities (TODO)
```

## Running Tests

```bash
# Run all tests in this package
pnpm --filter @codex7/shared test

# Run tests in watch mode
pnpm --filter @codex7/shared test:watch

# Run with coverage
pnpm --filter @codex7/shared test:coverage
```

## Testing Patterns

### Result Types

All utility functions return `Result<T, Error>` types. Test both success and error cases:

```typescript
it('should validate correct input', () => {
  const result = validateUrl('https://example.com');

  expect(result.isOk()).toBe(true);
  expect(result.unwrap()).toBeDefined();
});

it('should reject invalid input', () => {
  const result = validateUrl('not-a-url');

  expect(result.isErr()).toBe(true);
  expect(result.unwrapErr().message).toContain('Invalid');
});
```

### Edge Cases

Always test edge cases:
- Empty strings
- Null/undefined values (where applicable)
- Boundary values
- Special characters
- Very long inputs

### Test Naming

Use descriptive test names that explain the expected behavior:

```typescript
describe('functionName', () => {
  it('should handle normal case', () => { ... });
  it('should reject invalid input', () => { ... });
  it('should handle edge case', () => { ... });
});
```

## Coverage Goals

- **Target**: 80%+ coverage for all utility functions
- **Priority**: Focus on critical validation and parsing logic
- **Types**: Type definitions don't need test coverage

## Adding New Tests

1. Create a new `.test.ts` file in this directory
2. Import the utilities to test
3. Write comprehensive test cases
4. Run tests to verify
5. Check coverage with `pnpm test:coverage`

---

**Made with 💜 by the Codex7 team** ✨
