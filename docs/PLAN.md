# Codex7 Enhancement Implementation Plan

This plan consolidates all design work from our session into an ordered implementation roadmap.

## Design Documents

| Document | Status | Description |
|----------|--------|-------------|
| [COMPATIBILITY.md](./COMPATIBILITY.md) | Design complete | Two-tool architecture (local vs remote) |
| [TOPICS.md](./TOPICS.md) | Design complete | Hierarchical topic generation |
| [DOCUMENT_ACCESS.md](./DOCUMENT_ACCESS.md) | Design complete | File-level .md access |
| [RERANKING.md](./RERANKING.md) | Design complete | Retrieval-time ranking |
| [SCORING.md](./SCORING.md) | Research only | Quality benchmarks (future) |

---

## Phase 1: Two-Tool Architecture

**Goal:** Split into `get-library-docs` (local) and `get-context7-docs` (remote)

**Why first:** Foundation for all other changes. Clean separation enables enhanced local features.

### 1.1 Add `get-context7-docs` Tool

**File:** `src/index.ts`

```typescript
server.registerTool("get-context7-docs", {
  title: "Get Context7 Docs",
  description: "Fetches documentation for a REMOTE library via Context7 API...",
  inputSchema: {
    libraryId: z.string(),
    topic: z.string().optional(),
    tokens: z.number().optional()
  }
}, async ({ libraryId, topic, tokens }) => {
  // Validate: reject if local library
  if (await isLocalLibrary(libraryId)) {
    return { error: "Use 'get-library-docs' for local libraries" };
  }
  // Passthrough to Context7 API
  return fetchLibraryDocumentation(libraryId, { topic, tokens });
});
```

### 1.2 Update `get-library-docs` Tool

**File:** `src/index.ts`

- Rename/refactor to handle local only
- Add validation to reject remote libraries
- Update description to clarify local-only usage

### 1.3 Update `resolve-library-id` Response

**File:** `src/index.ts`

Add `tool` field to response:

```typescript
{
  id: "/vercel/next.js",
  source: "remote",
  tool: "get-context7-docs",  // NEW
  // ...
}
```

### 1.4 Update Tool Descriptions

Rewrite agent-facing descriptions to guide correct tool usage.

---

## Phase 2: Document-Level Access

**Goal:** Enable agents to access full .md files, starting with README.md

**Why second:** Enables README-first workflow before topic selection.

### 2.1 Database Schema

**File:** `src/db/schema.ts`

Add `local_documents` table:

```typescript
export const localDocuments = pgTable("local_documents", {
  id: text("id").primaryKey(),
  libraryId: text("library_id").notNull().references(() => localLibraries.id),
  path: text("path").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  tokens: integer("tokens"),
  sourceType: text("source_type"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### 2.2 Indexer Changes

**File:** `src/lib/local-generator.ts`

- Store full .md files before chunking into snippets
- Extract document index from README.md links
- Record document paths in library metadata

### 2.3 Add `path` Parameter

**File:** `src/index.ts` (get-library-docs)

```typescript
inputSchema: {
  libraryId: z.string(),
  path: z.string().optional(),  // NEW: "README.md", "docs/api.md"
  topics: z.array(z.string()).optional(),
  customQuery: z.string().optional(),
  tokens: z.number().optional()
}
```

### 2.4 Document Retrieval

**File:** `src/lib/local-api.ts`

```typescript
export async function fetchLocalDocument(
  libraryId: string,
  path: string
): Promise<string | null> {
  // Fetch full document content by path
}
```

### 2.5 Update Resolution Response

Include available documents:

```typescript
{
  id: "/my-org/lib",
  tool: "get-library-docs",
  documents: [
    { path: "README.md", title: "Overview" },
    { path: "docs/getting-started.md", title: "Getting Started" }
  ]
}
```

---

## Phase 3: Topic Generation

**Goal:** Pre-generate hierarchical topics during indexing

**Why third:** Builds on document access; topics extracted from indexed content.

### 3.1 Database Schema

**File:** `src/db/schema.ts`

Add topics fields:

```typescript
// local_libraries table
topics: jsonb("topics"),  // { core: [...], features: [...] }

// local_snippets table
topics: text("topics").array(),  // ["routing", "auth"]
```

### 3.2 Header Extraction

**File:** `src/lib/local-generator.ts`

```typescript
function extractTopicsFromHeaders(markdown: string): string[] {
  // Parse ## and ### headers
  // Normalize: lowercase, hyphenate
  // Deduplicate
}
```

### 3.3 LLM Topic Labeling

**File:** `src/lib/topic-generator.ts` (NEW)

```typescript
export async function labelChunkTopics(
  content: string
): Promise<string[]> {
  // For chunks without clear headers
  // Ask LLM for 2-3 topic tags
}

export async function organizeTopicHierarchy(
  topics: string[]
): Promise<TopicHierarchy> {
  // Ask LLM to group into categories
}
```

### 3.4 Store Topics with Snippets

**File:** `src/lib/local-generator.ts`

During indexing, assign topics to each snippet.

### 3.5 Update Resolution Response

Include topic hierarchy:

```typescript
{
  id: "/my-org/lib",
  tool: "get-library-docs",
  topics: {
    core: ["routing", "rendering", "data-fetching"],
    features: ["auth", "middleware", "i18n"]
  }
}
```

### 3.6 Topic-Filtered Retrieval

**File:** `src/lib/local-api.ts`

```typescript
export async function fetchLocalDocumentation(
  libraryId: string,
  options: {
    topics?: string[],      // Filter by topics
    customQuery?: string,   // Semantic refinement
    tokens?: number
  }
)
```

---

## Phase 4: Enhanced Retrieval

**Goal:** Improve snippet ranking with pre-computed scores

**Why fourth:** Refinement layer on top of topic filtering.

### 4.1 Snippet Quality Scores

**File:** `src/db/schema.ts`

```typescript
// local_snippets table
qualityScore: real("quality_score"),  // 0.0 - 1.0
hasCode: boolean("has_code"),
codeBlockCount: integer("code_block_count"),
```

### 4.2 Score During Indexing

**File:** `src/lib/local-generator.ts`

```typescript
function scoreSnippet(snippet: Snippet): number {
  let score = 0.5;
  if (snippet.codeBlocks.length > 0) score += 0.2;
  if (snippet.codeBlocks.length > 2) score += 0.1;
  if (snippet.content.length > 500) score += 0.1;
  if (snippet.description) score += 0.1;
  return Math.min(score, 1.0);
}
```

### 4.3 Combine Scores at Retrieval

**File:** `src/lib/local-api.ts`

```typescript
// After vector search
const finalScore = (vectorSimilarity * 0.7) + (qualityScore * 0.3);
snippets.sort((a, b) => b.finalScore - a.finalScore);
```

---

## Phase 5: Migration & Cleanup

### 5.1 Database Migration

```bash
pnpm db:generate
pnpm db:push
```

### 5.2 Re-index Existing Libraries

```bash
codex7 sync --all  # Re-index with new schema
```

### 5.3 Update Documentation

- Update README.md with new tool descriptions
- Update CLAUDE.md with usage examples

### 5.4 Remove SSE Code

Already completed in this session.

---

## File Change Summary

| File | Changes |
|------|---------|
| `src/index.ts` | Add `get-context7-docs`, update `get-library-docs`, update `resolve-library-id` |
| `src/db/schema.ts` | Add `local_documents` table, add `topics` fields |
| `src/lib/local-generator.ts` | Store documents, extract topics, score snippets |
| `src/lib/topic-generator.ts` | NEW: LLM topic labeling and hierarchy |
| `src/lib/local-api.ts` | Document retrieval, topic filtering, score ranking |
| `README.md` | Update tool documentation |

---

## Implementation Order

```
Phase 1: Two-Tool Architecture
    ├── 1.1 Add get-context7-docs
    ├── 1.2 Update get-library-docs
    ├── 1.3 Update resolve-library-id response
    └── 1.4 Update tool descriptions

Phase 2: Document Access
    ├── 2.1 Add local_documents table
    ├── 2.2 Store documents during indexing
    ├── 2.3 Add path parameter
    ├── 2.4 Document retrieval function
    └── 2.5 Include documents in resolution response

Phase 3: Topic Generation
    ├── 3.1 Add topics to schema
    ├── 3.2 Header extraction
    ├── 3.3 LLM topic labeling
    ├── 3.4 Store topics with snippets
    ├── 3.5 Include topics in resolution response
    └── 3.6 Topic-filtered retrieval

Phase 4: Enhanced Retrieval
    ├── 4.1 Add quality score fields
    ├── 4.2 Score during indexing
    └── 4.3 Combine scores at retrieval

Phase 5: Migration & Cleanup
    ├── 5.1 Database migration
    ├── 5.2 Re-index libraries
    └── 5.3 Update documentation
```

---

## Estimated Scope

| Phase | Files | Complexity |
|-------|-------|------------|
| Phase 1 | 1 | Low - Tool registration changes |
| Phase 2 | 3 | Medium - Schema + indexer + retrieval |
| Phase 3 | 4 | Medium - New module + indexer changes |
| Phase 4 | 2 | Low - Scoring logic |
| Phase 5 | - | Low - Migrations and docs |

---

## Future Considerations (Not in Scope)

- **SCORING.md**: Quality benchmarks with question generation (research phase)
- **LLM Reranker**: Query-time reranking with LLM (Phase 4 alternative)
- **Cross-encoder**: Production reranking model (Phase 4 alternative)
