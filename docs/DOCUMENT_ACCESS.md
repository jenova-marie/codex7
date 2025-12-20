# Document-Level Access for Agents

This document outlines a unified system where agents can access both:
- **Full documents** (.md files) for context and navigation
- **Code snippets** for specific implementation details

## The Problem

Current Codex7 fragments documentation into snippets. Agents receive:
- Isolated chunks without file context
- No way to navigate documentation structure
- No access to README as an index
- Missing the "big picture" needed to implement properly

Agents need more than code to implement a library properly. They need:
- Installation instructions
- Configuration guides
- Architecture overviews
- Best practices
- Troubleshooting guides

## Proposed Architecture

### Dual Access Model

```
┌─────────────────────────────────────────────────────────┐
│                     Agent Query                          │
└─────────────────────────────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   Document Access   │         │   Snippet Search    │
│   (file-level)      │         │   (semantic)        │
├─────────────────────┤         ├─────────────────────┤
│ • Get README.md     │         │ • Topic search      │
│ • Get specific file │         │ • Code examples     │
│ • List available    │         │ • API references    │
│   documents         │         │ • Ranked results    │
└─────────────────────┘         └─────────────────────┘
           │                               │
           ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│   PostgreSQL        │         │   Qdrant            │
│   (full doc content)│         │   (embeddings)      │
└─────────────────────┘         └─────────────────────┘
```

### New MCP Tools

#### 1. `list-library-docs`

List available documentation files for a library.

```typescript
list-library-docs({
  libraryId: "/vercel/next.js"
})

// Returns:
{
  readme: "/README.md",
  documents: [
    { path: "/docs/getting-started.md", title: "Getting Started" },
    { path: "/docs/api-reference.md", title: "API Reference" },
    { path: "/docs/configuration.md", title: "Configuration" },
    { path: "/examples/README.md", title: "Examples Index" }
  ]
}
```

#### 2. `get-library-doc`

Retrieve a specific document by path.

```typescript
get-library-doc({
  libraryId: "/vercel/next.js",
  path: "/docs/getting-started.md"  // or "README.md" for root
})

// Returns: Full markdown content of the file
```

#### 3. `get-library-docs` (existing, enhanced)

Keep current snippet-based semantic search for code/API lookups.

```typescript
get-library-docs({
  libraryId: "/vercel/next.js",
  topic: "dynamic routing",
  tokens: 5000
})

// Returns: Relevant snippets ranked by semantic similarity
```

### README as Index

README.md should serve as a table of contents:

```markdown
# My Library

Brief description.

## Documentation

- [Getting Started](./docs/getting-started.md) - Installation and setup
- [Configuration](./docs/configuration.md) - All config options
- [API Reference](./docs/api-reference.md) - Complete API docs
- [Examples](./examples/README.md) - Code examples
- [Troubleshooting](./docs/troubleshooting.md) - Common issues

## Quick Start

...
```

Agent workflow:
1. Call `get-library-doc` with `path: "README.md"`
2. Parse the index to understand available docs
3. Request specific docs as needed
4. Use `get-library-docs` (snippets) for code examples

## Database Schema Changes

### New Table: `local_documents`

```sql
CREATE TABLE local_documents (
  id TEXT PRIMARY KEY,              -- libraryId + path hash
  library_id TEXT NOT NULL,         -- FK to local_libraries
  path TEXT NOT NULL,               -- Relative path: "/docs/api.md"
  title TEXT,                       -- Extracted from first H1
  content TEXT NOT NULL,            -- Full markdown content
  tokens INTEGER,                   -- Token count
  source_type TEXT,                 -- readme, docs, examples, api
  created_at TIMESTAMP,
  updated_at TIMESTAMP,

  UNIQUE(library_id, path)
);

CREATE INDEX idx_documents_library ON local_documents(library_id);
```

### Keep Existing: `local_snippets`

Snippets remain for semantic search. They reference back to documents:

```sql
ALTER TABLE local_snippets
  ADD COLUMN document_id TEXT REFERENCES local_documents(id);
```

## Indexing Changes

### Current Flow
```
Find .md files → Parse into snippets → Embed → Store snippets + vectors
```

### New Flow
```
Find .md files → Store full documents → Parse into snippets → Embed → Store snippets + vectors
                      ↓
              Extract doc index from README
```

### Document Discovery

During indexing:
1. Find README.md (required)
2. Parse links in README to discover related docs
3. Scan docs/, examples/, content/ folders
4. Store each .md file as a document
5. Extract snippets from documents for semantic search

## Agent Workflow Examples

### Example 1: New Library Setup

```
Agent: "Help me set up NextAuth in my Next.js app"

1. resolve-library-id("nextauth")
   → Returns: "/nextauthjs/next-auth"

2. get-library-doc({ libraryId: "/nextauthjs/next-auth", path: "README.md" })
   → Returns: Full README with doc index

3. Agent sees: "Getting Started" doc available
   get-library-doc({ ..., path: "/docs/getting-started.md" })
   → Returns: Full setup guide

4. Agent needs specific API details:
   get-library-docs({ ..., topic: "session callback" })
   → Returns: Relevant code snippets
```

### Example 2: Debugging Issue

```
Agent: "NextAuth session not persisting"

1. get-library-doc({ ..., path: "README.md" })
   → Sees troubleshooting doc available

2. get-library-doc({ ..., path: "/docs/troubleshooting.md" })
   → Full troubleshooting guide

3. get-library-docs({ ..., topic: "session persistence cookies" })
   → Specific code snippets for session config
```

## Implementation Phases

### Phase 1: Schema & Storage
- Add `local_documents` table
- Modify indexer to store full documents
- Extract document index from README

### Phase 2: New Tools
- Implement `list-library-docs` tool
- Implement `get-library-doc` tool
- Register tools in MCP server

### Phase 3: README Index
- Parse README for documentation links
- Build document hierarchy
- Store document relationships

### Phase 4: Agent Guidance
- Update tool descriptions to guide agent workflow
- Add examples in tool descriptions
- Document recommended access patterns

## Open Questions

1. **Token limits**: Full documents can be large. Should we:
   - Truncate at a limit?
   - Return in chunks with pagination?
   - Let agent specify max tokens?

2. **Document hierarchy**: Should we:
   - Flatten all docs?
   - Preserve folder structure?
   - Build a navigation tree?

3. **Link resolution**: When README links to `./docs/foo.md`:
   - Resolve at index time?
   - Resolve at query time?
   - Store both relative and absolute paths?
