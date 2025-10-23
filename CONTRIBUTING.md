# 🤝 Contributing to Codex7

First off, **thank you** for considering contributing to Codex7! 💜

We're building the truly open-source documentation MCP server - transparent, self-hostable, and community-driven. Every contribution, no matter how small, helps make documentation better for everyone!

---

## 🌟 Ways to Contribute

There are many ways to contribute to Codex7:

- 🐛 **Report bugs** - Found something broken? Let us know!
- ✨ **Suggest features** - Have an idea? We'd love to hear it!
- 📝 **Improve documentation** - Docs can always be better
- 🧪 **Write tests** - Help us maintain quality
- 💻 **Submit code** - Fix bugs or implement features
- 🎨 **Design UI/UX** - Make Codex7 beautiful
- 🌍 **Translate** - Help us reach more people (future)
- 📚 **Add documentation sources** - Expand our library index
- 💬 **Help others** - Answer questions in Slack/Discussions

---

## 🚀 Getting Started

### 📋 Prerequisites

Before you start contributing, make sure you have:

- **Node.js 20+** - [Download here](https://nodejs.org/)
- **pnpm 8+** - Install with `npm install -g pnpm`
- **Docker & Docker Compose** - [Get Docker](https://www.docker.com/get-started)
- **Git** - For version control
- **PostgreSQL 16+** - Optional for local DB development

### 🔧 Development Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/codex7.git
   cd codex7
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (OpenAI for embeddings)
   ```

4. **Start infrastructure**
   ```bash
   docker-compose up -d  # Starts Postgres, Redis
   ```

5. **Run migrations**
   ```bash
   pnpm --filter @codex7/storage-postgres migrate
   ```

6. **Start development servers**
   ```bash
   pnpm dev  # Starts all services in watch mode
   ```

7. **Verify everything works**
   ```bash
   pnpm test
   pnpm type-check
   pnpm lint
   ```

---

## 📝 Contribution Workflow

### 1. 🌿 Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `test/` - Test additions/changes
- `refactor/` - Code refactoring
- `chore/` - Maintenance tasks

### 2. 💻 Make Your Changes

- Write clean, readable code
- Follow our code style (enforced by ESLint/Prettier)
- Add tests for new functionality
- Update documentation as needed
- Use meaningful commit messages (see below)

### 3. ✅ Test Your Changes

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @codex7/api test

# Type checking
pnpm type-check

# Linting
pnpm lint

# Run all checks
pnpm check-all
```

### 4. 📝 Commit Your Changes

We use emoji-prefixed commits! 🎉

```bash
git commit -m "✨ feat: add semantic search to MCP tools"
git commit -m "🐛 fix: resolve race condition in indexer"
git commit -m "📝 docs: update API reference"
git commit -m "🧪 test: add integration tests for storage adapter"
```

**Commit message format:**
```
<emoji> <type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `test` - Tests
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `chore` - Maintenance

**Emojis:**
- ✨ `feat` - New features
- 🐛 `fix` - Bug fixes
- 📝 `docs` - Documentation
- 🧪 `test` - Tests
- ♻️ `refactor` - Refactoring
- 🔥 `perf` - Performance
- 🔒 `security` - Security
- 🎨 `style` - UI/formatting

See our [Emoji Guide](docs/EMOJI_GUIDE.md) for more!

### 5. 🔀 Submit a Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a Pull Request on GitHub**
   - Use a clear, descriptive title
   - Fill out the PR template
   - Link any related issues
   - Add screenshots if UI changes
   - Request review from maintainers

3. **Address review feedback**
   - Make requested changes
   - Push additional commits
   - Re-request review when ready

---

## ✅ Pull Request Checklist

Before submitting your PR, ensure:

- [ ] 🧪 **Tests pass** - All tests green
- [ ] ✨ **Linting passes** - `pnpm lint` succeeds
- [ ] 📦 **Builds successfully** - `pnpm build` works
- [ ] 🎯 **Type checking passes** - `pnpm type-check` succeeds
- [ ] 📝 **Documentation updated** - If adding features
- [ ] 🧪 **Tests added** - For new functionality
- [ ] 📖 **CHANGELOG updated** - For user-facing changes
- [ ] 🎨 **Code formatted** - Prettier applied
- [ ] 💬 **PR description clear** - Explains what and why
- [ ] 🏷️ **Labels added** - bug, enhancement, docs, etc.

---

## 🎨 Code Style Guide

### TypeScript

```typescript
// ✅ Good: Use explicit types
function searchDocuments(query: string, limit: number): Promise<Document[]> {
  // ...
}

// ❌ Bad: Avoid 'any'
function searchDocuments(query: any, limit: any): Promise<any> {
  // ...
}

// ✅ Good: Use const for immutable values
const MAX_RESULTS = 100;

// ❌ Bad: Avoid let for constants
let MAX_RESULTS = 100;

// ✅ Good: Use interfaces for object shapes
interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
}

// ✅ Good: Use Result types for error handling
import { Result, Ok, Err } from '@jenova-marie/ts-rust-result';

function parseLibraryId(id: string): Result<LibraryId, Error> {
  if (!id.startsWith('/')) {
    return Err(new Error('Invalid library ID format'));
  }
  return Ok({ org: '...', project: '...' });
}
```

### Error Handling

```typescript
// ✅ Good: Use Result types
import { Result, Ok, Err } from '@jenova-marie/ts-rust-result';

async function indexDocument(doc: Document): Promise<Result<void, Error>> {
  try {
    await storage.save(doc);
    return Ok(undefined);
  } catch (error) {
    return Err(new Error(`Failed to index: ${error.message}`));
  }
}

// Use it safely
const result = await indexDocument(doc);
if (result.isOk()) {
  logger.info('Document indexed successfully');
} else {
  logger.error('Indexing failed', { error: result.error });
}
```

### Logging

```typescript
// ✅ Good: Use wonder-logger with structured data
import { createLogger } from '@jenova-marie/wonder-logger';

const logger = createLogger({ service: 'indexer' });

logger.info('Indexing document', {
  documentId: doc.id,
  library: doc.library,
  version: doc.version,
});

// ❌ Bad: console.log
console.log('Indexing document:', doc.id);
```

### Comments & Documentation

```typescript
/**
 * 🔍 Performs semantic search over indexed documentation
 *
 * @param query - The search query string
 * @param options - Search options including filters and pagination
 * @returns Promise resolving to search results with relevance scores
 *
 * @example
 * ```typescript
 * const results = await semanticSearch('React hooks', {
 *   library: 'react',
 *   version: '18.2.0',
 *   limit: 10
 * });
 * ```
 */
export async function semanticSearch(
  query: string,
  options: SearchOptions
): Promise<SearchResult[]> {
  // Implementation
}
```

---

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Good test structure
import { describe, it, expect, beforeEach } from 'vitest';
import { parseLibraryId } from './library-id';

describe('parseLibraryId', () => {
  it('should parse valid library ID', () => {
    const result = parseLibraryId('/vercel/next.js');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toEqual({
      org: 'vercel',
      project: 'next.js',
      version: undefined,
    });
  });

  it('should parse library ID with version', () => {
    const result = parseLibraryId('/vercel/next.js/v14.0.0');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().version).toBe('v14.0.0');
  });

  it('should return error for invalid format', () => {
    const result = parseLibraryId('invalid');

    expect(result.isErr()).toBe(true);
    expect(result.error.message).toContain('Invalid');
  });
});
```

### Integration Tests

```typescript
// Test with real database
import { describe, it, beforeAll, afterAll } from 'vitest';
import { PostgresAdapter } from './postgres-adapter';

describe('PostgresAdapter Integration', () => {
  let adapter: PostgresAdapter;

  beforeAll(async () => {
    adapter = new PostgresAdapter(process.env.TEST_DATABASE_URL!);
    await adapter.migrate();
  });

  afterAll(async () => {
    await adapter.close();
  });

  it('should store and retrieve documents', async () => {
    const doc = { id: '123', content: 'Test', embedding: [0.1, 0.2] };

    await adapter.indexDocument(doc);
    const result = await adapter.getDocument('123');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap()).toMatchObject(doc);
  });
});
```

---

## 📚 Documentation Standards

- Use emojis liberally! 🎨
- Include code examples
- Explain the "why", not just "how"
- Keep it concise but complete
- Use proper markdown formatting
- Add screenshots for UI features

---

## 🏆 Recognition

We value all contributions! Contributors are recognized through:

- 🏅 **Contributors section** in README.md
- 🌟 **Monthly highlights** in our blog
- 💬 **Shoutouts** in Slack #announcements
- 🎁 **Swag** for significant contributions
- 💎 **Early access** to new features

---

## 🤝 Community Guidelines

We follow our [Code of Conduct](CODE_OF_CONDUCT.md). In summary:

- 💜 **Be welcoming** - Everyone is welcome here
- 🙏 **Be respectful** - Assume good intent
- 🌍 **Be inclusive** - Embrace diverse perspectives
- 🎉 **Celebrate** - Recognize others' contributions
- 📖 **Be transparent** - Communicate openly

---

## 💬 Getting Help

Need help with your contribution?

- 💬 **Slack**: [codex7.slack.com](https://codex7.slack.com) - Real-time help
- 💭 **Discussions**: [GitHub Discussions](https://github.com/jenova-marie/codex7/discussions) - Q&A
- 📝 **Issues**: [GitHub Issues](https://github.com/jenova-marie/codex7/issues) - Bug reports
- 📖 **Docs**: [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md) - Setup guide

---

## 📋 Issue Labels

We use labels to organize issues:

- 🐛 `bug` - Something isn't working
- ✨ `enhancement` - New feature or request
- 📝 `documentation` - Documentation improvements
- 🤝 `good first issue` - Good for newcomers
- 🆘 `help wanted` - Extra attention needed
- 💬 `question` - Further information requested
- 🔥 `priority` - High priority
- 🎨 `design` - UI/UX related

---

## 🚀 Release Process

Releases are handled by maintainers:

1. Version bump in `package.json`
2. Update `CHANGELOG.md`
3. Create GitHub release with notes
4. Publish to npm (when ready)
5. Deploy to production
6. Announce in Slack + Twitter

---

## 📄 License

By contributing to Codex7, you agree that your contributions will be licensed under the [MIT License](LICENSE).

Unlike some projects, our MIT license actually means something because you can run the entire system! 😉

---

<div align="center">

**Thank you for contributing to Codex7!** 💜

*Together, we're building what real open-source looks like* ✨

[⭐ Star us on GitHub](https://github.com/jenova-marie/codex7) • [💬 Join Slack](https://codex7.slack.com) • [📖 Read the Docs](docs/GETTING_STARTED.md)

</div>
