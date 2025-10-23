# 📡 MCP Server - Framework Establishment Plan

> **Goal**: Create the MCP server skeleton with stdio transport, tool registration framework, logging, error handling, and testing. NO actual tool implementations yet!

---

## 🎯 Package Purpose

The `@codex7/mcp-server` package provides:
- MCP protocol server using `@modelcontextprotocol/sdk`
- stdio transport for Claude Desktop integration
- Tool registration framework
- Request/response handling pipeline

**What we're NOT doing yet**: Implementing actual MCP tools, search logic, or storage queries.

---

## 🏗️ Foundation Phase Tasks

### 1. Project Structure Setup

```
packages/mcp-server/
├── src/
│   ├── index.ts                   # Entry point (starts server)
│   ├── server.ts                  # MCP server setup
│   ├── transport/                 # Transport layer
│   │   ├── index.ts
│   │   └── stdio.ts              # stdio transport implementation
│   ├── tools/                     # MCP tool handlers (stubs)
│   │   ├── index.ts
│   │   ├── resolve-library-id.ts # Stub
│   │   ├── get-library-docs.ts   # Stub
│   │   ├── search-docs.ts        # Stub (extension)
│   │   └── get-versions.ts       # Stub (extension)
│   ├── middleware/                # Request processing
│   │   ├── index.ts
│   │   ├── logging.ts            # Request logging
│   │   ├── validation.ts         # Input validation
│   │   └── error-handler.ts      # Error formatting
│   ├── utils/                     # Utilities
│   │   ├── index.ts
│   │   └── logger.ts             # Logger setup
│   └── __tests__/                 # Tests
│       ├── server.test.ts
│       ├── tools.test.ts
│       └── middleware.test.ts
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
  "name": "@codex7/mcp-server",
  "version": "0.1.0",
  "description": "MCP server for Codex7 documentation system",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "codex7-mcp": "./dist/index.js"
  },
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
    "@modelcontextprotocol/sdk": "^0.5.0"
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

### 3. Server Setup (Skeleton)

#### src/server.ts
```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { logger } from './utils/logger.js';
import { registerTools } from './tools/index.js';

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  name: string;
  version: string;
  storageAdapter?: any; // Will be DocumentStore in Phase 1
}

/**
 * Codex7 MCP Server
 *
 * Implements Model Context Protocol for Claude Desktop integration.
 * STUB: Registers tools but handlers return placeholder data.
 */
export class Codex7MCPServer {
  private server: Server;
  private config: MCPServerConfig;

  constructor(config: MCPServerConfig) {
    this.config = config;

    // Initialize MCP server
    this.server = new Server(
      {
        name: config.name,
        version: config.version
      },
      {
        capabilities: {
          tools: {} // We provide tools
        }
      }
    );

    logger.info('MCP Server created', {
      name: config.name,
      version: config.version
    });
  }

  /**
   * Register all MCP tools
   * STUB: Registers tools with stub handlers
   */
  registerTools(): void {
    logger.info('Registering MCP tools...');

    // Register tools from tools/ directory
    registerTools(this.server);

    logger.info('MCP tools registered (STUBS)');
  }

  /**
   * Start the MCP server with stdio transport
   */
  async start(): Promise<void> {
    logger.info('Starting MCP server...');

    // Register tools
    this.registerTools();

    // Setup stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await this.server.connect(transport);

    logger.info('MCP server running on stdio');
  }

  /**
   * Gracefully shutdown the server
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down MCP server...');

    await this.server.close();

    logger.info('MCP server stopped');
  }
}
```

**Deliverable**: Server class skeleton.

---

### 4. Tool Registration Framework

#### src/tools/index.ts
```typescript
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerResolveLibraryId } from './resolve-library-id.js';
import { registerGetLibraryDocs } from './get-library-docs.js';
import { registerSearchDocs } from './search-docs.js';
import { registerGetVersions } from './get-versions.js';
import { logger } from '../utils/logger.js';

/**
 * Register all MCP tools with the server
 *
 * @param server - MCP server instance
 */
export function registerTools(server: Server): void {
  logger.debug('Registering tools...');

  // Context7-compatible tools
  registerResolveLibraryId(server);
  registerGetLibraryDocs(server);

  // Extended tools
  registerSearchDocs(server);
  registerGetVersions(server);

  logger.info('All tools registered', {
    count: 4,
    tools: [
      'resolve-library-id',
      'get-library-docs',
      'search-documentation',
      'get-library-versions'
    ]
  });
}
```

**Deliverable**: Tool registration orchestrator.

---

### 5. Tool Handlers (Stubs)

#### src/tools/resolve-library-id.ts
```typescript
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';

/**
 * Register the resolve-library-id tool
 *
 * Context7-compatible tool for mapping library names to IDs.
 * STUB: Returns hardcoded placeholder data
 */
export function registerResolveLibraryId(server: Server): void {
  server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name !== 'resolve-library-id') {
      return; // Not our tool
    }

    const { libraryName } = request.params.arguments as { libraryName: string };

    logger.info('resolve-library-id called (STUB)', { libraryName });

    // TODO Phase 1: Query storage for matching libraries

    // STUB: Return placeholder data
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          matches: [{
            id: '/facebook/react',
            name: 'React',
            description: 'A JavaScript library for building user interfaces',
            trust_score: 10,
            repository_url: 'https://github.com/facebook/react',
            versions: ['v18.2.0', 'latest']
          }]
        }, null, 2)
      }]
    };
  });

  // Register tool schema
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: [{
        name: 'resolve-library-id',
        description: 'Map a library name to its internal identifier',
        inputSchema: {
          type: 'object',
          properties: {
            libraryName: {
              type: 'string',
              description: 'Library name to search for (e.g., "react", "next.js")'
            }
          },
          required: ['libraryName']
        }
      }]
    };
  });

  logger.debug('resolve-library-id tool registered');
}
```

#### src/tools/get-library-docs.ts
```typescript
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';

/**
 * Register the get-library-docs tool
 *
 * Context7-compatible tool for fetching library documentation.
 * STUB: Returns placeholder documentation
 */
export function registerGetLibraryDocs(server: Server): void {
  server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name !== 'get-library-docs') {
      return; // Not our tool
    }

    const {
      context7CompatibleLibraryID,
      topic,
      tokens = 5000
    } = request.params.arguments as {
      context7CompatibleLibraryID: string;
      topic?: string;
      tokens?: number;
    };

    logger.info('get-library-docs called (STUB)', {
      libraryID: context7CompatibleLibraryID,
      topic,
      tokens
    });

    // TODO Phase 1:
    // 1. Parse library ID
    // 2. Generate query embedding
    // 3. Vector similarity search
    // 4. Format for LLM

    // STUB: Return placeholder docs
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          content: `# React Documentation (PLACEHOLDER)\n\nThis is stub documentation for ${context7CompatibleLibraryID}.\n\nTopic: ${topic || 'general'}\n\nIn Phase 1, this will return actual documentation from the database.`,
          metadata: {
            library: context7CompatibleLibraryID,
            version: 'latest',
            chunks_returned: 1,
            total_tokens: 100
          }
        }, null, 2)
      }]
    };
  });

  // Add to tools list
  server.setRequestHandler('tools/list', async () => {
    return {
      tools: [{
        name: 'get-library-docs',
        description: 'Fetch documentation for a specific library',
        inputSchema: {
          type: 'object',
          properties: {
            context7CompatibleLibraryID: {
              type: 'string',
              description: 'Library ID (e.g., "/facebook/react" or "/facebook/react/v18.2.0")'
            },
            topic: {
              type: 'string',
              description: 'Optional topic to focus on (e.g., "hooks", "routing")'
            },
            tokens: {
              type: 'number',
              description: 'Maximum tokens to return (default: 5000)'
            }
          },
          required: ['context7CompatibleLibraryID']
        }
      }]
    };
  });

  logger.debug('get-library-docs tool registered');
}
```

#### src/tools/search-docs.ts
```typescript
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';

/**
 * Register the search-documentation tool (Codex7 extension)
 *
 * STUB: Returns placeholder search results
 */
export function registerSearchDocs(server: Server): void {
  server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name !== 'search-documentation') {
      return;
    }

    const { query, filters, limit = 10 } = request.params.arguments as {
      query: string;
      filters?: any;
      limit?: number;
    };

    logger.info('search-documentation called (STUB)', { query, filters, limit });

    // TODO Phase 1: Implement semantic + exact search

    // STUB
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          results: [],
          message: 'STUB: Search not implemented yet (Phase 1)'
        }, null, 2)
      }]
    };
  });

  logger.debug('search-documentation tool registered');
}
```

#### src/tools/get-versions.ts
```typescript
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { logger } from '../utils/logger.js';

/**
 * Register the get-library-versions tool (Codex7 extension)
 *
 * STUB: Returns placeholder version list
 */
export function registerGetVersions(server: Server): void {
  server.setRequestHandler('tools/call', async (request) => {
    if (request.params.name !== 'get-library-versions') {
      return;
    }

    const { library_id } = request.params.arguments as { library_id: string };

    logger.info('get-library-versions called (STUB)', { library_id });

    // TODO Phase 1: Query versions from storage

    // STUB
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          versions: ['v18.2.0', 'v18.1.0', 'latest'],
          message: 'STUB: Version list is placeholder (Phase 1)'
        }, null, 2)
      }]
    };
  });

  logger.debug('get-library-versions tool registered');
}
```

**Deliverable**: All tool handlers registered as stubs.

---

### 6. Entry Point

#### src/index.ts
```typescript
#!/usr/bin/env node

import { Codex7MCPServer } from './server.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for MCP server
 *
 * Starts the server and handles graceful shutdown.
 */
async function main() {
  logger.info('Starting Codex7 MCP Server...');

  const server = new Codex7MCPServer({
    name: 'codex7-mcp-server',
    version: '0.1.0'
  });

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    await server.shutdown();
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

  // Start server
  try {
    await server.start();
  } catch (error) {
    logger.error('Failed to start server', { error });
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

**Deliverable**: Runnable entry point with lifecycle management.

---

### 7. Logger Setup

#### src/utils/logger.ts
```typescript
import { initializeLogger } from '@codex7/shared';

/**
 * Logger instance for MCP server
 */
export const logger = initializeLogger('mcp-server');
```

---

### 8. Testing Framework

#### src/__tests__/server.test.ts
```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Codex7MCPServer } from '../server.js';

describe('Codex7MCPServer', () => {
  let server: Codex7MCPServer;

  beforeEach(() => {
    server = new Codex7MCPServer({
      name: 'test-server',
      version: '0.0.1'
    });
  });

  afterEach(async () => {
    if (server) {
      await server.shutdown();
    }
  });

  it('should create server instance', () => {
    expect(server).toBeDefined();
  });

  it('should register tools', () => {
    // Just verify it doesn't throw
    expect(() => server.registerTools()).not.toThrow();
  });

  // NOTE: Can't easily test start() as it requires stdio
  // Integration tests will cover full server lifecycle
});
```

#### src/__tests__/tools.test.ts
```typescript
import { describe, it, expect } from 'vitest';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { registerResolveLibraryId } from '../tools/resolve-library-id.js';

describe('Tool Registration', () => {
  it('should register resolve-library-id', () => {
    const server = new Server({ name: 'test', version: '1.0.0' }, { capabilities: {} });

    // Should not throw
    expect(() => registerResolveLibraryId(server)).not.toThrow();
  });

  // More tool registration tests...
});
```

**Deliverable**: Basic test suite.

---

### 9. Package Exports

#### src/index.ts (also export server class)
```typescript
export { Codex7MCPServer, type MCPServerConfig } from './server.js';
export { registerTools } from './tools/index.js';
```

---

## ✅ Success Criteria

This phase is complete when:

- [ ] All directories and files created
- [ ] `pnpm install` runs successfully
- [ ] `pnpm build` compiles without errors
- [ ] `pnpm test` runs all tests
- [ ] `pnpm dev` starts server on stdio (can be manually tested)
- [ ] All 4 tools registered (even as stubs)
- [ ] Server responds to `tools/list` request
- [ ] README.md documents installation and usage

---

## 🚫 What We're NOT Doing

- ❌ Implementing actual tool logic
- ❌ Connecting to storage
- ❌ Generating embeddings
- ❌ Performing searches
- ❌ Formatting real documentation

---

## 📚 References

- [MCP Protocol](https://modelcontextprotocol.io/)
- [Architecture](../../docs/ARCHITECTURE.md) - MCP Server design
- [PLAN.md](../../PLAN.md#mcp-server) - Tool specifications

---

**Made with 💜 by the Codex7 team**

*"Building MCP foundations, one tool at a time"* 📡✨
