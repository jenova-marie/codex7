# Topic-Based Documentation Navigation

This document describes a system for pre-generating hierarchical topics during indexing, enabling agents to select from known topics rather than guessing.

## The Problem

Current `topic` parameter is a blind guess:

```typescript
// Agent has no idea what topics exist
get-library-docs({ libraryId: "/vercel/next.js", topic: "authentication" })
```

Issues:
- Agent doesn't know what topics exist in indexed docs
- Terminology mismatch causes poor retrieval
- No way to browse available topics
- Single topic only - can't combine related areas

## Proposed Solution

### Pre-Generated Topics

During indexing, extract and organize topics from documentation:

```
Markdown files → Extract headers → LLM labels gaps → Organize hierarchy → Store with library
```

### Topic Hierarchy

Topics organized into categories:

```json
{
  "core": {
    "label": "Core Concepts",
    "topics": ["routing", "rendering", "layouts", "data-fetching", "caching"]
  },
  "features": {
    "label": "Features",
    "topics": ["authentication", "middleware", "i18n", "image-optimization"]
  },
  "api": {
    "label": "API & Server",
    "topics": ["api-routes", "server-actions", "server-components", "edge-runtime"]
  },
  "guides": {
    "label": "Guides",
    "topics": ["installation", "configuration", "deployment", "testing"]
  }
}
```

### Agent Workflow

```
1. resolve-library-id("next.js")
   → Returns library info WITH available topics

2. Agent sees:
   {
     id: "/vercel/next.js",
     topics: {
       core: ["routing", "rendering", ...],
       features: ["authentication", ...],
       ...
     }
   }

3. Agent selects relevant topics:
   get-library-docs({
     libraryId: "/vercel/next.js",
     topics: ["routing", "middleware"],
     customQuery: "nested dynamic routes"
   })

4. System returns snippets tagged with those topics,
   ranked by customQuery similarity if provided
```

## Topic Generation (Hybrid Approach)

### Step 1: Header Extraction

Parse markdown headers as topics:

```markdown
## Routing          → "routing"
### Dynamic Routes  → "dynamic-routes"
## Authentication   → "authentication"
```

Normalization:
- Lowercase
- Replace spaces with hyphens
- Remove special characters
- Deduplicate similar headers

### Step 2: LLM Labeling

For chunks without clear headers:

```
Prompt: Given this documentation snippet, provide 2-3 topic tags:

[snippet content about setting up OAuth with NextAuth]

Response: ["authentication", "oauth", "session-management"]
```

### Step 3: Hierarchical Organization

After collecting all topics, use LLM to categorize:

```
Prompt: Organize these topics into 3-5 categories:
routing, authentication, deployment, api-routes, caching,
middleware, i18n, server-components, testing, installation

Response:
{
  "core": ["routing", "caching", "server-components"],
  "features": ["authentication", "middleware", "i18n"],
  "api": ["api-routes"],
  "guides": ["deployment", "testing", "installation"]
}
```

## Storage Schema

### Library Level

```typescript
// local_libraries table
topics: JSONB  // Hierarchical topic structure

// Example value:
{
  "core": {
    "label": "Core Concepts",
    "topics": ["routing", "rendering", "data-fetching"]
  },
  "features": {
    "label": "Features",
    "topics": ["auth", "middleware"]
  }
}
```

### Snippet Level

```typescript
// local_snippets table
topics: TEXT[]  // Array of topic tags

// Example value:
["routing", "dynamic-routes"]
```

## Enhanced Tool Interface

### `resolve-library-id` Response

```typescript
{
  id: "/vercel/next.js",
  title: "Next.js",
  description: "The React Framework",
  topics: {
    core: ["routing", "rendering", "layouts", "data-fetching"],
    features: ["authentication", "middleware", "i18n", "caching"],
    api: ["api-routes", "server-actions", "server-components"],
    guides: ["installation", "configuration", "deployment"]
  },
  // ... other fields
}
```

### `get-library-docs` Parameters

```typescript
get-library-docs({
  libraryId: string,           // Required: library ID
  topics?: string[],           // Optional: filter by topics (multi-select)
  customQuery?: string,        // Optional: semantic search within topics
  tokens?: number              // Optional: max tokens (default 5000)
})
```

### Retrieval Logic

```typescript
async function getLibraryDocs({ libraryId, topics, customQuery, tokens }) {
  let snippets = await getSnippetsForLibrary(libraryId);

  // Step 1: Filter by topics if provided
  if (topics?.length > 0) {
    snippets = snippets.filter(s =>
      s.topics.some(t => topics.includes(t))
    );
  }

  // Step 2: Rank by semantic similarity if customQuery provided
  if (customQuery) {
    const queryVector = await embed(customQuery);
    snippets = rankBySimilarity(snippets, queryVector);
  }

  // Step 3: Return within token limit
  return truncateToTokenLimit(snippets, tokens);
}
```

## Benefits

| Before | After |
|--------|-------|
| Agent guesses topic names | Agent selects from known list |
| Single topic only | Multi-topic selection |
| No topic visibility | Topics returned with library info |
| Flat topic list | Hierarchical categories |
| Semantic search only | Topic filter + semantic refinement |

## Implementation Considerations

### Topic Limits

- **Per library**: 30-50 topics maximum
- **Per snippet**: 1-3 topics
- **Categories**: 3-6 per library

### Topic Quality

- Prefer specific over generic ("dynamic-routes" vs "routing-stuff")
- Avoid redundancy ("auth" and "authentication" should merge)
- Consistent naming across libraries where possible

### Custom Topics

Allow users to define topics in `codex7.json`:

```json
{
  "topics": {
    "core": ["custom-topic-1", "custom-topic-2"],
    "override": true  // Replace auto-generated with custom
  }
}
```

## Related Documents

- [DOCUMENT_ACCESS.md](./DOCUMENT_ACCESS.md) - File-level document access
- [RERANKING.md](./RERANKING.md) - Retrieval-time ranking improvements
- [SCORING.md](./SCORING.md) - Documentation quality benchmarks
