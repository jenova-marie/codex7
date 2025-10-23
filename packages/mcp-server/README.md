# 📡 @codex7/mcp-server

> **Model Context Protocol server for Codex7 documentation system**
>
> Provides AI-powered documentation search and retrieval through MCP tools

---

## 🎯 Overview

The Codex7 MCP server implements the [Model Context Protocol](https://modelcontextprotocol.io/) to provide Claude Desktop and other AI assistants with access to indexed library documentation through semantic search.

**Phase 0 Implementation (Current):**
- ✅ MCP protocol integration with stdio transport
- ✅ Four registered tools with proper schemas
- ✅ Stub data responses for testing
- ❌ No actual storage or search (coming in Phase 1)

---

## 🚀 Quick Start

### Installation

```bash
# From monorepo root
pnpm install

# Build the package
pnpm --filter @codex7/mcp-server build
```

### Running the Server

```bash
# Development mode (with auto-reload)
pnpm --filter @codex7/mcp-server dev

# Production mode
pnpm --filter @codex7/mcp-server start
```

### Testing

```bash
# Run tests
pnpm --filter @codex7/mcp-server test

# Run with coverage
pnpm --filter @codex7/mcp-server test:coverage

# Type checking
pnpm --filter @codex7/mcp-server type-check
```

---

## 🔧 Available Tools

### 1. `resolve-library-id`

Maps a library name to its Context7-compatible identifier.

**Input:**
```typescript
{
  libraryName: string  // e.g., "react", "next.js", "express"
}
```

**Output:**
```json
{
  "matches": [
    {
      "id": "/facebook/react",
      "name": "React",
      "description": "A JavaScript library for building user interfaces",
      "trust_score": 10,
      "repository_url": "https://github.com/facebook/react",
      "versions": ["v18.2.0", "latest"]
    }
  ]
}
```

---

### 2. `get-library-docs`

Fetches documentation for a specific library with optional topic filtering.

**Input:**
```typescript
{
  context7CompatibleLibraryID: string  // "/org/project" or "/org/project/version"
  topic?: string                        // Optional topic filter (e.g., "hooks", "routing")
  tokens?: number                       // Max tokens to return (default: 5000)
}
```

**Output:**
```json
{
  "content": "# Library Documentation\n\n...",
  "metadata": {
    "library": "/facebook/react",
    "version": "latest",
    "topic": "hooks",
    "chunks_returned": 5,
    "total_tokens": 2847
  }
}
```

---

### 3. `search-documentation` (Codex7 Extension)

Searches across all indexed libraries for relevant documentation.

**Input:**
```typescript
{
  query: string
  filters?: {
    library?: string     // Filter by library ID
    version?: string     // Filter by version
    docType?: string     // Filter by doc type (readme, guide, api-reference)
  }
  limit?: number         // Max results (default: 10)
}
```

**Output:**
```json
{
  "results": [
    {
      "library": "/facebook/react",
      "title": "useState Hook",
      "excerpt": "...",
      "score": 0.95
    }
  ],
  "total": 42,
  "query": "state management hooks"
}
```

---

### 4. `get-library-versions` (Codex7 Extension)

Lists all indexed versions for a specific library.

**Input:**
```typescript
{
  library_id: string  // "/org/project"
}
```

**Output:**
```json
{
  "library": "/facebook/react",
  "versions": [
    {
      "version": "v18.2.0",
      "indexed_at": "2024-01-15T10:30:00Z",
      "documentation_chunks": 125
    },
    {
      "version": "latest",
      "indexed_at": "2024-01-20T09:15:00Z",
      "documentation_chunks": 130
    }
  ],
  "total": 2
}
```

---

## 📦 Project Structure

```
src/
├── index.ts              # Entry point & exports
├── server.ts             # Codex7MCPServer class
├── tools/                # MCP tool implementations
│   ├── index.ts          # Tool registration
│   ├── resolve-library-id.ts
│   ├── get-library-docs.ts
│   ├── search-docs.ts
│   └── get-versions.ts
├── utils/                # Utilities
│   ├── index.ts
│   └── logger.ts         # Wonder-logger setup
└── __tests__/            # Test suites
    ├── server.test.ts
    └── tools.test.ts
```

---

## ⚙️ Configuration

### wonder-logger.yaml

Logging configuration using [@jenova-marie/wonder-logger](https://github.com/jenova-marie/wonder-logger):

```yaml
service:
  name: codex7-mcp-server
  version: 0.1.0-alpha
  environment: development

logger:
  enabled: true
  level: info
  transports:
    - type: console
      pretty: false
    - type: memory
      name: codex7-mcp-server
      maxSize: 10000
```

**Environment Variables:**
- `LOG_LEVEL` - Logging level (default: `info`)
- `NODE_ENV` - Environment (`development` | `production`)

---

## 🧪 Testing

### Test Coverage

Current coverage: **100%** for implemented Phase 0 functionality

```bash
# Run tests with coverage report
pnpm test:coverage

# View HTML coverage report
open coverage/index.html
```

### Test Structure

- **Unit tests**: Tool handlers (`src/__tests__/tools.test.ts`)
- **Integration tests**: Server class (`src/__tests__/server.test.ts`)

All tests use **Vitest** with comprehensive assertions for stub data validation.

---

## 🚧 Phase 0 Limitations

**Current implementation returns STUB DATA only.** Tools are registered and respond correctly to the MCP protocol, but do not connect to storage or perform real searches.

### What Works
- ✅ MCP server initialization
- ✅ Tool registration with proper schemas
- ✅ Request handling and routing
- ✅ Structured logging
- ✅ Error handling

### What's Coming in Phase 1
- 🔜 Connect to PostgreSQL + pgvector storage
- 🔜 Semantic search with embeddings
- 🔜 Real documentation retrieval
- 🔜 Library indexing pipeline

---

## 📚 Related Packages

- **[@codex7/shared](../shared/)** - Shared types and utilities
- **[@codex7/storage-postgres](../storage-postgres/)** - PostgreSQL storage adapter (Phase 1)
- **[@codex7/indexer](../indexer/)** - Documentation indexing service (Phase 1)

---

## 🔗 Resources

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Codex7 Project Plan](../../PLAN.md)
- [Architecture Documentation](../../docs/ARCHITECTURE.md)

---

## 📄 License

MIT License - See [LICENSE](../../LICENSE)

---

## 💜 Made with Love

**Built by the Codex7 team**

*"Building what context7 pretends to be - truly open, truly transparent"* ✨

---

## 🔮 Next Steps

Once Phase 0 is complete:

1. **Phase 1**: Connect to storage and implement real search
2. **Phase 2**: Add authentication and rate limiting
3. **Phase 3**: Deploy to production and index libraries

Stay tuned! 🚀
