# Local vs Remote Compatibility

Codex7 serves two sources with different capabilities. This document describes how to provide distinct tools for each source, with no lossy conversions.

## Two Sources, Two Tools

| Source | Tool | Capabilities |
|--------|------|--------------|
| **Local** | `get-library-docs` | Full hierarchical topics, multi-select, document access |
| **Remote** | `get-context7-docs` | Single topic string (Context7 API passthrough) |

## Design Principle

**No silent conversions.** Instead of converting enhanced parameters to legacy format behind the scenes, tell the agent upfront which tool to use.

```
Agent: resolve-library-id("next.js")
         │
         ▼
Response includes: "use tool: get-context7-docs"
         │
         ▼
Agent calls the correct tool with correct parameters
```

## Tool Definitions

### Tool 1: `get-library-docs` (Local Enhanced)

For locally indexed libraries only.

```typescript
get-library-docs({
  libraryId: string,           // Required: /org/project format

  // Topic selection
  topics?: string[],           // Multi-select from available topics
  customQuery?: string,        // Semantic refinement within topics

  // Document access
  path?: string,               // Specific .md file path

  // Limits
  tokens?: number              // Max tokens (default 5000)
})
```

**Features:**
- Hierarchical topic selection
- Multi-topic queries
- Document-level access (README, specific .md files)
- Semantic search within topics
- Pre-generated topic list

### Tool 2: `get-context7-docs` (Remote Legacy)

For Context7-hosted libraries. Direct passthrough to Context7 API.

```typescript
get-context7-docs({
  libraryId: string,           // Required: /org/project format
  topic?: string,              // Single topic string
  tokens?: number              // Max tokens (default 5000)
})
```

**Features:**
- Single topic search
- Context7's built-in ranking
- No local processing

## Library Resolution Response

`resolve-library-id` tells the agent which tool to use:

### Remote Library

```typescript
{
  id: "/vercel/next.js",
  title: "Next.js",
  source: "remote",
  tool: "get-context7-docs",      // Which tool to call
  topics: null,                    // No topic hierarchy
  documents: null                  // No document access
}
```

### Local Library

```typescript
{
  id: "/my-org/my-lib",
  title: "My Library",
  source: "local",
  tool: "get-library-docs",        // Which tool to call
  topics: {                        // Full topic hierarchy
    core: ["routing", "state", "rendering"],
    features: ["auth", "i18n", "caching"],
    guides: ["installation", "deployment"]
  },
  documents: [                     // Available .md files
    { path: "README.md", title: "Overview" },
    { path: "docs/getting-started.md", title: "Getting Started" }
  ]
}
```

## Agent Workflow

```
1. resolve-library-id("next.js")
   ↓
2. Check response.tool field
   ↓
3a. If "get-library-docs" (local):
    - Browse response.topics for available topics
    - Browse response.documents for available files
    - Call get-library-docs with appropriate params

3b. If "get-context7-docs" (remote):
    - Call get-context7-docs with single topic string
```

### Example: Local Library

```typescript
// Step 1: Resolve
const lib = await resolve-library-id("my-lib");
// Returns: { tool: "get-library-docs", topics: { core: ["routing", ...] }, ... }

// Step 2: Query with enhanced features
await get-library-docs({
  libraryId: lib.id,
  topics: ["routing", "middleware"],
  customQuery: "nested dynamic routes"
});
```

### Example: Remote Library

```typescript
// Step 1: Resolve
const lib = await resolve-library-id("next.js");
// Returns: { tool: "get-context7-docs", topics: null, ... }

// Step 2: Query with legacy format
await get-context7-docs({
  libraryId: lib.id,
  topic: "routing nested dynamic routes"
});
```

## Feature Matrix

| Feature | `get-library-docs` | `get-context7-docs` |
|---------|-------------------|---------------------|
| Source | Local indexed | Context7 API |
| Topic type | `string[]` (multi) | `string` (single) |
| Topic hierarchy | Yes | No |
| Pre-generated topics | Yes | No |
| Document access | Yes | No |
| Custom semantic query | Yes | No (topic only) |
| README navigation | Yes | No |

## Tool Descriptions (Agent-Facing)

### `resolve-library-id`

```
Resolves a package name to a library ID. Returns the library info
including which tool to use for fetching documentation.

Check the 'tool' field in the response:
- "get-library-docs": Local library with enhanced features
- "get-context7-docs": Remote library via Context7 API

For local libraries, also check 'topics' for available topic
categories and 'documents' for available .md files.
```

### `get-library-docs`

```
Fetches documentation for a LOCAL library.

Only use this tool when resolve-library-id returns tool: "get-library-docs"

Parameters:
- libraryId: The library ID from resolve-library-id
- topics: Array of topics to filter by (select from available topics)
- customQuery: Additional semantic search within selected topics
- path: Specific document path (e.g., "README.md", "docs/api.md")
- tokens: Maximum tokens to return

Workflow:
1. Start with README.md to understand library structure
2. Select relevant topics from the available hierarchy
3. Use customQuery to narrow results within topics
```

### `get-context7-docs`

```
Fetches documentation for a REMOTE library via Context7.

Only use this tool when resolve-library-id returns tool: "get-context7-docs"

Parameters:
- libraryId: The library ID from resolve-library-id
- topic: Single search string describing what you need
- tokens: Maximum tokens to return

Note: This tool has limited features compared to local libraries.
Combine your search terms into a single descriptive topic string.
```

## Implementation

### Server Registration

```typescript
// Register both tools
server.registerTool("get-library-docs", { ... });     // Local
server.registerTool("get-context7-docs", { ... });    // Remote

// Optionally keep legacy name as alias
server.registerTool("get-docs", { ... });             // Auto-routes
```

### Validation

Each tool validates it's being used correctly:

```typescript
// get-library-docs
async function getLibraryDocs({ libraryId, ... }) {
  if (!await isLocalLibrary(libraryId)) {
    return {
      error: "This library is not locally indexed. Use 'get-context7-docs' instead."
    };
  }
  // ... proceed with local retrieval
}

// get-context7-docs
async function getContext7Docs({ libraryId, ... }) {
  if (await isLocalLibrary(libraryId)) {
    return {
      error: "This is a local library. Use 'get-library-docs' for enhanced features."
    };
  }
  // ... proceed with Context7 API call
}
```

## Migration Path

### Current State
- Single `get-library-docs` tool handles both sources
- Silent conversion of parameters for remote

### Target State
- `get-library-docs` for local only
- `get-context7-docs` for remote only
- `resolve-library-id` tells agent which to use

### Steps
1. Add `get-context7-docs` tool
2. Add `tool` field to resolve-library-id response
3. Update `get-library-docs` to reject remote libraries
4. Update tool descriptions to guide agents

## Related Documents

- [TOPICS.md](./TOPICS.md) - Topic generation and hierarchy
- [DOCUMENT_ACCESS.md](./DOCUMENT_ACCESS.md) - File-level document access
- [RERANKING.md](./RERANKING.md) - Retrieval-time ranking
