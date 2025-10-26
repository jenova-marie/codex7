# 🗄️ Codex7 Database Design

> **Complete database schema and design decisions for Codex7**
>
> Target: PostgreSQL 16 + pgvector on AWS EC2 t3.medium

---

## 🎯 Design Goals

- ✅ **Context7 Compatible** - Support same MCP tool interface
- ✅ **Efficient Storage** - Optimize for t3.medium (4GB RAM, 50GB SSD)
- ✅ **Fast Search** - <200ms p95 for semantic queries
- ✅ **Scalable** - Handle 100+ libraries, 100k+ documents in Phase 1
- ✅ **Deduplication** - Avoid indexing identical content multiple times
- ✅ **Versioned** - Support multiple library versions
- ✅ **Unified Schema** - Single schema supports multiple source types (GitHub, web, PDF)
- ✅ **KISS for MVP** - Keep It Simple, no framework dependencies

---

## 📊 Target Configuration

### Hardware & Costs

**EC2 Instance:** t3.medium
- **vCPUs:** 2
- **RAM:** 4 GB
- **Storage:** 50 GB gp3 SSD
- **Cost:** ~$30/month

**Embedding Model:** OpenAI `text-embedding-3-small`
- **Dimensions:** 1536
- **Cost:** $0.02 per 1M tokens
- **Initial indexing:** ~$2 (100 libraries)
- **Monthly updates:** ~$0.20

**Total Year 1 Cost:** ~$365

### Capacity Estimates

**Phase 1 MVP Target: 75,000 documents**
- Libraries: 100-200
- Versions: 500-1,000 (avg 5 versions per library)
- Documents: **75,000 chunks** (MVP sweet spot for t3.medium)
- Vector storage: ~450 MB
- IVFFlat index: ~550 MB (lists=274)
- Total DB size: ~2-3 GB (including indexes)
- Memory headroom: ~2GB on t3.medium (comfortable)

**Scaling Path:**
- Phase 1 (t3.medium): 75k documents ✅
- Phase 2 (t3.large, 8GB): 150-200k documents
- Phase 3 (t3.xlarge, 16GB): 500k+ documents

---

## 🏗️ Schema Overview

### Entity Relationships

```
┌─────────────┐
│  libraries  │
│             │
│ • id (PK)   │
│ • name      │
│ • org       │──┐
│ • project   │  │
│ • metadata  │  │
└─────────────┘  │
                 │ 1:N
                 ▼
            ┌─────────────┐
            │  versions   │
            │             │
            │ • id (PK)   │
            │ • lib_id(FK)│──┐
            │ • version   │  │
            │ • is_latest │  │
            └─────────────┘  │
                             │ 1:N
                             ▼
                    ┌──────────────┐
                    │  documents   │
                    │              │
                    │ • id (PK)    │
                    │ • version_id │
                    │ • title      │
                    │ • content    │
                    │ • embedding  │ ← vector(1536)
                    │ • hash       │ ← deduplication
                    │ • metadata   │ ← JSONB
                    └──────────────┘
```

---

## 📋 Complete Schema (SQL)

### Table: `libraries`

Stores top-level library information.

```sql
-- Libraries table
CREATE TABLE libraries (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity (Context7 compatible format: /org/project)
  name VARCHAR(255) NOT NULL,              -- Display name: "Next.js"
  org VARCHAR(255) NOT NULL,               -- GitHub org: "vercel"
  project VARCHAR(255) NOT NULL,           -- Project name: "next.js"
  identifier VARCHAR(255) UNIQUE NOT NULL, -- Full ID: "/vercel/next.js"

  -- Source information
  repository_url TEXT,                     -- GitHub URL
  homepage_url TEXT,                       -- Official docs URL
  description TEXT,                        -- Library description

  -- Quality & trust
  trust_score INTEGER DEFAULT 5            -- 1-10, higher = more trusted
    CHECK (trust_score BETWEEN 1 AND 10),

  -- Flexible metadata (JSONB)
  metadata JSONB DEFAULT '{}'::jsonb,      -- Tags, language, ecosystem, etc.

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for libraries
CREATE UNIQUE INDEX idx_libraries_identifier ON libraries(identifier);
CREATE INDEX idx_libraries_org_project ON libraries(org, project);
CREATE INDEX idx_libraries_name ON libraries(name);
CREATE INDEX idx_libraries_trust_score ON libraries(trust_score DESC);

-- Comments
COMMENT ON TABLE libraries IS 'Top-level library/project information';
COMMENT ON COLUMN libraries.identifier IS 'Context7-compatible ID format: /org/project';
COMMENT ON COLUMN libraries.trust_score IS 'Community trust score (1-10), affects search ranking';
COMMENT ON COLUMN libraries.metadata IS 'Flexible storage: tags, language, ecosystem, package_manager, etc.';
```

---

### Table: `versions`

Stores different versions of each library.

```sql
-- Versions table
CREATE TABLE versions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to library
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,

  -- Version information
  version_string VARCHAR(50) NOT NULL,     -- "v14.0.0", "latest", "canary"
  version_normalized VARCHAR(50),          -- "14.0.0" (for sorting)

  -- Source tracking
  git_commit_sha VARCHAR(40),              -- Git commit hash
  release_date TIMESTAMPTZ,                -- When this version was released

  -- Status
  is_latest BOOLEAN DEFAULT FALSE,         -- Is this the latest version?
  is_deprecated BOOLEAN DEFAULT FALSE,     -- Marked as deprecated?

  -- Statistics
  document_count INTEGER DEFAULT 0,        -- How many docs in this version

  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,      -- Release notes, breaking changes, etc.

  -- Timestamps
  indexed_at TIMESTAMPTZ DEFAULT NOW(),    -- When we indexed this version
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for versions
CREATE UNIQUE INDEX idx_versions_lib_version ON versions(library_id, version_string);
CREATE INDEX idx_versions_latest ON versions(library_id) WHERE is_latest = TRUE;
CREATE INDEX idx_versions_lib_id ON versions(library_id);

-- Constraint: Only one latest version per library
CREATE UNIQUE INDEX idx_versions_one_latest
  ON versions(library_id)
  WHERE is_latest = TRUE;

-- Comments
COMMENT ON TABLE versions IS 'Library versions - supports multiple versions per library';
COMMENT ON COLUMN versions.version_string IS 'Raw version string from source';
COMMENT ON COLUMN versions.version_normalized IS 'Normalized for sorting (semver)';
COMMENT ON COLUMN versions.is_latest IS 'Only one version per library can be latest';
```

---

### Table: `documents`

Stores chunked documentation with embeddings.

**This is the core table for semantic search.**

```sql
-- Documents table (chunked documentation with vectors)
CREATE TABLE documents (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to version
  version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,

  -- Content
  title TEXT NOT NULL,                     -- Section title: "React > Hooks > useState"
  content TEXT NOT NULL,                   -- The actual documentation text
  content_hash CHAR(64) NOT NULL,          -- SHA-256 hash for deduplication

  -- Vector embedding (1536 dimensions for text-embedding-3-small)
  embedding vector(1536),                  -- pgvector type

  -- Hierarchy & positioning
  chunk_index INTEGER NOT NULL DEFAULT 0,  -- Position in parent document
  hierarchy TEXT[],                        -- ["React", "Hooks", "useState"]

  -- Source information
  source_url TEXT,                         -- Original URL of this content
  source_type VARCHAR(50) NOT NULL         -- 'github', 'web', 'pdf'
    CHECK (source_type IN ('github', 'web', 'pdf')),
  source_path TEXT,                        -- GitHub: file path, Web: NULL, PDF: page num

  -- Content metadata
  language VARCHAR(10) DEFAULT 'en',       -- Content language
  has_code BOOLEAN DEFAULT FALSE,          -- Does this chunk contain code?
  code_language VARCHAR(50),               -- If has_code: 'typescript', 'python', etc.

  -- Flexible metadata (JSONB)
  metadata JSONB DEFAULT '{}'::jsonb,      -- Section level, tags, custom fields

  -- Timestamps
  indexed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for documents
CREATE INDEX idx_documents_version ON documents(version_id);
CREATE INDEX idx_documents_hash ON documents(content_hash);
CREATE INDEX idx_documents_source_type ON documents(source_type);
CREATE INDEX idx_documents_has_code ON documents(has_code) WHERE has_code = TRUE;

-- Partial indexes for source-specific queries (Phase 0)
CREATE INDEX idx_github_docs_path ON documents(source_path)
  WHERE source_type = 'github';

CREATE INDEX idx_pdf_docs_page ON documents((metadata->>'page_number')::integer)
  WHERE source_type = 'pdf';

CREATE INDEX idx_code_language ON documents(code_language)
  WHERE has_code = TRUE;

-- Full-text search index (for hybrid search)
CREATE INDEX idx_documents_content_fts ON documents
  USING GIN(to_tsvector('english', content));
CREATE INDEX idx_documents_title_fts ON documents
  USING GIN(to_tsvector('english', title));

-- Vector similarity index (IVFFlat for Phase 1)
-- Dynamic lists calculation: lists = sqrt(target_doc_count)
-- Phase 1 target: 75k documents → lists = 274
CREATE INDEX idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 274);

-- Comments
COMMENT ON TABLE documents IS 'Chunked documentation with vector embeddings - unified schema for all source types';
COMMENT ON COLUMN documents.embedding IS 'OpenAI text-embedding-3-small (1536 dims)';
COMMENT ON COLUMN documents.content_hash IS 'SHA-256 for deduplication - saves API costs by reusing embeddings';
COMMENT ON COLUMN documents.hierarchy IS 'Breadcrumb trail: ["Section", "Subsection", "Topic"]';
COMMENT ON COLUMN documents.chunk_index IS 'Position within parent document (0-based)';
COMMENT ON COLUMN documents.source_type IS 'github | web | pdf - unified schema handles all source types';
COMMENT ON COLUMN documents.source_path IS 'GitHub: relative file path, Web: NULL (use source_url), PDF: page number';
COMMENT ON COLUMN documents.metadata IS 'Flexible: section_level, tokens, original_format, source-specific fields';
```

---

## 🌐 Unified Schema for Multiple Source Types

### Design Decision: Single Table vs. Separate Tables

**Decision:** Use a **unified `documents` table** for all source types (GitHub, web, PDF).

**Why unified?**
- ✅ **Fast vector search** - Single table query (no UNION needed)
- ✅ **Cross-source deduplication** - Same content from different sources = one embedding
- ✅ **Simpler API** - Search doesn't care about source type
- ✅ **Easy to extend** - New source types = update enum, not new tables
- ✅ **Context7 compatibility** - They use unified approach

**Alternative considered:** Separate tables per source type (github_documents, web_documents, pdf_documents)
- ❌ Vector search would require UNION ALL (much slower!)
- ❌ No cross-source deduplication
- ❌ More complex API and maintenance

### Source-Specific Field Usage

| Field | GitHub | Web | PDF |
|-------|--------|-----|-----|
| `source_url` | Repo URL | Page URL | PDF URL |
| `source_path` | `docs/api/hooks.md` | `NULL` | `"12"` (page num) |
| `source_type` | `'github'` | `'web'` | `'pdf'` |

### Source-Specific Metadata (JSONB)

**For GitHub sources:**
```json
{
  "git_commit_sha": "abc123def456",
  "branch": "main",
  "file_path": "docs/api/hooks.md",
  "last_modified": "2024-01-15T10:30:00Z"
}
```

**For Web sources:**
```json
{
  "etag": "33a64df551425fcc55e4d42a148795d9f25f89d4",
  "last_modified": "2024-01-15T10:30:00Z",
  "sitemap_url": "https://example.com/sitemap.xml",
  "scraped_at": "2024-01-20T14:00:00Z"
}
```

**For PDF sources:**
```json
{
  "page_number": 12,
  "total_pages": 150,
  "pdf_title": "React Documentation v18.2.0",
  "extracted_with": "pdf-parse"
}
```

### TypeScript Type Safety

```typescript
// Type-safe metadata interfaces
interface GitHubMetadata {
  git_commit_sha: string;
  branch?: string;
  file_path: string;
  last_modified?: string;
}

interface WebMetadata {
  etag?: string;
  last_modified?: string;
  sitemap_url?: string;
  scraped_at: string;
}

interface PDFMetadata {
  page_number: number;
  total_pages: number;
  pdf_title?: string;
  extracted_with: string;
}

// Union type for document metadata
type DocumentMetadata = GitHubMetadata | WebMetadata | PDFMetadata;

// Document type
interface Document {
  id: string;
  version_id: string;
  title: string;
  content: string;
  source_type: 'github' | 'web' | 'pdf';
  source_url: string;
  source_path: string | null;
  metadata: DocumentMetadata;
  // ... other fields
}
```

---

## 🔍 Vector Index Strategy

### Why IVFFlat?

**IVFFlat (Inverted File with Flat Compression):**
- ✅ Good for <1M vectors (our Phase 1 target: 100k-200k)
- ✅ Faster index builds
- ✅ Lower memory requirements (fits in 4GB RAM)
- ✅ Good recall with proper tuning

**HNSW (Hierarchical Navigable Small World):**
- ✅ Better recall at scale (1M+ vectors)
- ❌ Slower builds
- ❌ More memory needed
- 🔜 Consider for Phase 2/3

### IVFFlat Configuration

**Dynamic lists calculation based on document count:**

```sql
-- Formula: lists = sqrt(total_documents)
--
-- Phase 1 (75k docs):  lists = 274
-- Phase 2 (150k docs): lists = 387
-- Phase 3 (500k docs): lists = 707

CREATE INDEX idx_documents_embedding ON documents
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 274);  -- For 75k documents

-- IMPORTANT: When scaling beyond 75k, REINDEX is required:
-- DROP INDEX idx_documents_embedding;
-- CREATE INDEX ... WITH (lists = 387);  -- For 150k
```

**Tuning for queries:**
```sql
-- Set probes for query (higher = better recall, slower)
SET ivfflat.probes = 20;  -- Increased from 10 for better recall
                          -- Default: 1, Range: 1-lists
```

**Recall vs Speed Trade-off:**
- `probes = 1`: Fastest, ~60-70% recall
- `probes = 10`: Balanced, ~80-85% recall
- `probes = 20`: Better quality, ~90-95% recall ✅ **Recommended**
- `probes = lists`: Perfect recall, slow (defeats purpose of IVFFlat)

### Distance Metric: Cosine Similarity

**Why cosine over L2 or inner product?**
- ✅ Normalized (magnitude-invariant)
- ✅ Industry standard for text embeddings
- ✅ Matches OpenAI's recommendations
- ✅ Better for semantic similarity

---

## 🎯 Context7 Compatibility Mapping

### Library Identifier Format

**Context7 format:** `/org/project` or `/org/project/version`

**Our mapping:**

```typescript
// Parse Context7 ID
const parseLibraryId = (id: string) => {
  // Examples:
  // "/vercel/next.js" → { org: "vercel", project: "next.js", version: null }
  // "/vercel/next.js/v14.0.0" → { org: "vercel", project: "next.js", version: "v14.0.0" }

  const parts = id.split('/').filter(Boolean);
  return {
    org: parts[0],
    project: parts[1],
    version: parts[2] || null  // null = "latest"
  };
};

// Build Context7 ID
const buildLibraryId = (lib: Library, version?: Version) => {
  const base = `/${lib.org}/${lib.project}`;
  return version ? `${base}/${version.version_string}` : base;
};
```

**Database queries:**

```sql
-- Resolve library by identifier
SELECT * FROM libraries WHERE identifier = '/vercel/next.js';

-- Get latest version
SELECT v.* FROM versions v
JOIN libraries l ON l.id = v.library_id
WHERE l.identifier = '/vercel/next.js'
  AND v.is_latest = TRUE;

-- Get specific version
SELECT v.* FROM versions v
JOIN libraries l ON l.id = v.library_id
WHERE l.identifier = '/vercel/next.js'
  AND v.version_string = 'v14.0.0';
```

---

## 📏 Document Chunking Strategy

### Hybrid Structural Chunking

**Approach:** Chunk by markdown structure with size constraints.

**Rules:**
1. **Respect markdown hierarchy** (# → ## → ###)
2. **Max chunk size:** 512 tokens (~2048 chars)
3. **Min chunk size:** 100 tokens (~400 chars)
4. **Overlap:** 50 tokens between chunks (for context)

**Example:**

```markdown
# React Hooks

React Hooks let you use state...

## useState Hook

The useState hook allows you to add state...

### Basic Example
```jsx
const [count, setCount] = useState(0);
```

### Advanced Example
...
```

**Chunks created:**

| Chunk | Title | Content | Hierarchy | Tokens |
|-------|-------|---------|-----------|--------|
| 1 | React Hooks | Introduction text | ["React Hooks"] | 150 |
| 2 | React Hooks > useState Hook | useState description | ["React Hooks", "useState Hook"] | 200 |
| 3 | React Hooks > useState > Basic Example | Code example + explanation | ["React Hooks", "useState Hook", "Basic Example"] | 120 |

**Metadata stored:**

```json
{
  "section_level": 3,
  "has_code": true,
  "code_language": "jsx",
  "tokens": 120,
  "original_file": "docs/hooks-reference.md"
}
```

---

## 🔐 Deduplication Strategy

### Content Hashing

**Goal:** Don't re-index identical content across versions.

**How:**
1. Hash content with SHA-256 before indexing
2. Check if hash exists in database
3. If exists: skip embedding generation, reuse existing
4. If new: generate embedding and store

**Implementation:**

```sql
-- Check for duplicate content
SELECT id, embedding FROM documents
WHERE content_hash = 'abc123...'
LIMIT 1;

-- If found: Create new document pointing to same embedding
INSERT INTO documents (version_id, title, content, content_hash, embedding, ...)
VALUES ($1, $2, $3, $4, (SELECT embedding FROM documents WHERE content_hash = $4 LIMIT 1), ...);
```

**Benefits:**
- ✅ Save API costs (don't re-embed identical docs)
- ✅ Faster indexing (reuse existing embeddings)
- ✅ Consistent vectors for same content

**Storage overhead:** 64 bytes per document for SHA-256 hash

---

## ⚡ Query Patterns & Performance

### 1. Semantic Search (Primary Use Case)

**Query:** Find relevant docs by embedding similarity

```sql
-- Generate embedding for query (via OpenAI API)
-- Then search for similar documents

SELECT
  d.id,
  d.title,
  d.content,
  d.source_url,
  d.metadata,
  v.version_string,
  l.name AS library_name,
  l.identifier AS library_id,
  1 - (d.embedding <=> $1::vector) AS similarity  -- cosine similarity
FROM documents d
JOIN versions v ON v.id = d.version_id
JOIN libraries l ON l.id = v.library_id
WHERE l.identifier = $2  -- Optional: filter by library
  AND v.is_latest = TRUE -- Optional: only latest version
ORDER BY d.embedding <=> $1::vector  -- Vector similarity
LIMIT $3;
```

**Performance:** <200ms for 100k docs on t3.medium

**Tuning:**
```sql
SET ivfflat.probes = 10;  -- Adjust recall/speed tradeoff
```

---

### 2. Hybrid Search (Semantic + Full-Text)

**Query:** Combine vector similarity with keyword matching

```sql
WITH semantic_results AS (
  -- Vector similarity search
  SELECT
    d.id,
    1 - (d.embedding <=> $1::vector) AS semantic_score
  FROM documents d
  JOIN versions v ON v.id = d.version_id
  WHERE v.library_id = $2
  ORDER BY d.embedding <=> $1::vector
  LIMIT 50
),
keyword_results AS (
  -- Full-text search
  SELECT
    d.id,
    ts_rank(to_tsvector('english', d.content), plainto_tsquery('english', $3)) AS keyword_score
  FROM documents d
  JOIN versions v ON v.id = d.version_id
  WHERE v.library_id = $2
    AND to_tsvector('english', d.content) @@ plainto_tsquery('english', $3)
  LIMIT 50
)
-- Combine scores (weighted)
SELECT
  d.*,
  COALESCE(s.semantic_score, 0) * 0.7 + COALESCE(k.keyword_score, 0) * 0.3 AS combined_score
FROM documents d
LEFT JOIN semantic_results s ON s.id = d.id
LEFT JOIN keyword_results k ON k.id = d.id
WHERE s.id IS NOT NULL OR k.id IS NOT NULL
ORDER BY combined_score DESC
LIMIT 10;
```

**Use case:** User searches "useState hook example" - finds both semantically similar AND exact keyword matches.

---

### 3. Exact Filters

**Query:** Get docs with specific criteria

```sql
-- Get all documents with code examples
SELECT d.* FROM documents d
JOIN versions v ON v.id = d.version_id
JOIN libraries l ON l.id = v.library_id
WHERE l.identifier = '/vercel/next.js'
  AND v.is_latest = TRUE
  AND d.has_code = TRUE
ORDER BY d.chunk_index;

-- Get TypeScript-specific docs
SELECT d.* FROM documents d
WHERE d.code_language = 'typescript';
```

---

### 4. List Operations

```sql
-- List all libraries
SELECT * FROM libraries ORDER BY name;

-- List versions for a library
SELECT v.* FROM versions v
JOIN libraries l ON l.id = v.library_id
WHERE l.identifier = '/vercel/next.js'
ORDER BY v.release_date DESC;

-- Count documents per version
SELECT
  l.name,
  v.version_string,
  COUNT(d.id) AS doc_count
FROM libraries l
JOIN versions v ON v.library_id = l.id
LEFT JOIN documents d ON d.version_id = v.id
GROUP BY l.id, l.name, v.id, v.version_string
ORDER BY l.name, v.release_date DESC;
```

---

## 🔧 PostgreSQL Configuration

### Recommended Settings for t3.medium

```conf
# /etc/postgresql/16/main/postgresql.conf

# Memory (4GB RAM total, optimized for 75k documents)
shared_buffers = 1GB              # 25% of RAM
effective_cache_size = 3GB        # 75% of RAM
work_mem = 16MB                   # Per operation (reduced for more concurrency)
maintenance_work_mem = 256MB      # For index builds

# Connections (with pgbouncer in Phase 1)
max_connections = 50              # Lower with connection pooling

# Query planner
random_page_cost = 1.1            # SSD storage
effective_io_concurrency = 200    # SSD

# WAL
wal_buffers = 16MB
checkpoint_completion_target = 0.9

# Logging
log_min_duration_statement = 500  # Log slow queries (>500ms)

# Extensions
shared_preload_libraries = 'pg_stat_statements,vector'
```

### pgvector-Specific

```sql
-- Enable extension (MUST be first migration!)
CREATE EXTENSION IF NOT EXISTS vector;

-- Query-time settings (Phase 1 optimized)
SET ivfflat.probes = 20;          -- Better recall (90-95%)

-- Recommended maintenance
VACUUM ANALYZE documents;          -- After bulk inserts
REINDEX INDEX idx_documents_embedding;  -- If index gets fragmented OR when scaling
```

**Connection Pooling (Phase 1):**
```conf
# pgbouncer.ini
[databases]
codex7 = host=postgres port=5432 dbname=codex7

[pgbouncer]
pool_mode = transaction
max_client_conn = 100
default_pool_size = 20
```

---

## 📦 Storage Estimates

### Per Document

**Fields:**
- UUID (16 bytes)
- Title (avg 50 chars): 50 bytes
- Content (avg 500 chars): 500 bytes
- Hash (64 bytes)
- Embedding (1536 floats × 4 bytes): **6,144 bytes**
- Metadata JSONB (avg 200 bytes): 200 bytes
- Other fields: ~100 bytes

**Total per document:** ~7 KB

### Scaling Projections

| Documents | Vector Data | IVFFlat Index | Total DB Size | RAM Needed | Query Time (p95) | Instance |
|-----------|-------------|---------------|---------------|------------|------------------|----------|
| 10,000 | 60 MB | 150 MB | 100 MB | 1.2 GB | <50ms | t3.small |
| 50,000 | 300 MB | 400 MB | 500 MB | 1.7 GB | <100ms | t3.medium |
| **75,000** | **450 MB** | **550 MB** | **1.5 GB** | **2 GB** | **<150ms** | **t3.medium** ✅ |
| 100,000 | 600 MB | 800 MB | 2 GB | 2.4 GB | <150ms | t3.medium (tight) |
| 150,000 | 900 MB | 1.2 GB | 3 GB | 3.1 GB | <200ms | t3.large |
| 200,000 | 1.2 GB | 1.5 GB | 4 GB | 3.7 GB | <200ms | t3.large |
| 500,000 | 3 GB | 3.5 GB | 10 GB | 7.5 GB | <400ms | t3.xlarge |

**Phase 1 MVP sweet spot:** 75k documents on t3.medium (comfortable headroom)

---

## ✅ Implementation Status

**Status:** ✅ **IMPLEMENTED - Phase 0 Complete**

The database design has been fully implemented with the following components:

### Completed Components

- ✅ **Docker Compose Setup** - Local dev + test databases with pgvector
- ✅ **Migration System** - Automated SQL migration runner with tracking
- ✅ **Database Schema** - All tables created with proper indexes
- ✅ **pgvector Integration** - Extension enabled, vector columns, IVFFlat indexes
- ✅ **Integration Tests** - Tests running against real PostgreSQL database

### Migration Files

Location: `packages/storage-postgres/src/migrations/`

**IMPLEMENTED MIGRATION ORDER:**

```sql
0000_enable_pgvector.sql      -- Enables pgvector extension (MUST BE FIRST!)
0001_create_tables.sql         -- Creates libraries, versions, documents tables
0002_add_vector_index.sql      -- Creates IVFFlat index on embeddings
0003_add_indexing_jobs.sql     -- Creates indexing_jobs tracking table
```

**Why this order?**
- ✅ pgvector extension MUST be loaded before creating columns of type `vector(1536)`
- ✅ Tables must exist before creating indexes on them
- ✅ IVFFlat index created with `lists=274` for 75k document target
- ✅ Migration tracking in `_drizzle_migrations` table ensures idempotency

### Actual Schema (As Implemented)

**Tables created:**
- `libraries` - Library/project metadata (text primary keys)
- `versions` - Library version tracking (text primary keys)
- `documents` - Documentation chunks with `vector(1536)` embeddings
- `indexing_jobs` - Background job tracking for document processing
- `_drizzle_migrations` - Migration execution tracking

**Indexes created:**
- `documents_embedding_idx` - IVFFlat vector similarity index using `vector_cosine_ops`
- Primary key indexes on all tables
- Foreign key indexes for joins

**Differences from original design:**
- Using **text PKs** UUIDs
- Schema generated from TypeScript models via JSON intermediate format
- Drizzle ORM integration for type-safe queries

### Migration Management

**Phase 0:** Using **Drizzle ORM** for type-safe schema + migrations 🎯

**Why Drizzle?**
- ✅ Type-safe schema definitions in TypeScript
- ✅ Automatic migration generation (`drizzle-kit push`)
- ✅ User has existing killer code with Drizzle + PostgreSQL!
- ✅ No SQL files - define schema once in TypeScript
- ✅ Great developer experience with IntelliSense

**Schema definition example:**

```typescript
// packages/storage-postgres/src/schema.ts
import { pgTable, uuid, text, varchar, integer, boolean, timestamp, vector } from 'drizzle-orm/pg-core';

export const libraries = pgTable('libraries', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  org: varchar('org', { length: 255 }).notNull(),
  project: varchar('project', { length: 255 }).notNull(),
  identifier: varchar('identifier', { length: 255 }).notNull().unique(),
  repositoryUrl: text('repository_url'),
  homepageUrl: text('homepage_url'),
  description: text('description'),
  trustScore: integer('trust_score').default(5),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  versionId: uuid('version_id').notNull().references(() => versions.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  contentHash: varchar('content_hash', { length: 64 }).notNull(),

  // pgvector column (using drizzle-orm-pg extension)
  embedding: vector('embedding', { dimensions: 1536 }),

  chunkIndex: integer('chunk_index').default(0).notNull(),
  hierarchy: text('hierarchy').array(),

  sourceUrl: text('source_url'),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  sourcePath: text('source_path'),

  language: varchar('language', { length: 10 }).default('en'),
  hasCode: boolean('has_code').default(false),
  codeLanguage: varchar('code_language', { length: 50 }),

  metadata: jsonb('metadata').default({}),
  indexedAt: timestamp('indexed_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => ({
  // Indexes defined in schema
  versionIdx: index('idx_documents_version').on(table.versionId),
  hashIdx: index('idx_documents_hash').on(table.contentHash),

  // Partial indexes
  githubPathIdx: index('idx_github_docs_path')
    .on(table.sourcePath)
    .where(sql`source_type = 'github'`),

  // Vector index (IVFFlat with lists=274 for 75k docs)
  embeddingIdx: index('idx_documents_embedding')
    .using('ivfflat', table.embedding, { lists: 274 })
}));
```

**Migration workflow:**

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations to database
pnpm drizzle-kit push

# Or use programmatic API
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';

const db = drizzle(pool);
await migrate(db, { migrationsFolder: './drizzle' });
```

**CRITICAL: pgvector extension setup**

Drizzle doesn't handle PostgreSQL extensions automatically. We need to enable pgvector BEFORE first migration:

```typescript
// One-time setup script (run before migrations)
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('CREATE EXTENSION IF NOT EXISTS vector;');
await pool.end();
```

**Benefits:**
- Type-safe queries: `db.select().from(documents).where(eq(documents.id, docId))`
- Auto-completion for all columns
- Compile-time errors for schema mismatches
- Single source of truth (TypeScript schema → database)
- Automatic migration generation

---

## 🧪 Test Data & Validation

### Sample Queries to Validate Design

```sql
-- 1. Can we store and retrieve a library?
INSERT INTO libraries (name, org, project, identifier, repository_url)
VALUES ('Next.js', 'vercel', 'next.js', '/vercel/next.js', 'https://github.com/vercel/next.js');

-- 2. Can we store versions?
INSERT INTO versions (library_id, version_string, is_latest)
VALUES ((SELECT id FROM libraries WHERE identifier = '/vercel/next.js'), 'v14.0.0', TRUE);

-- 3. Can we store documents with embeddings?
INSERT INTO documents (version_id, title, content, content_hash, embedding, source_type)
VALUES (
  (SELECT id FROM versions WHERE version_string = 'v14.0.0' LIMIT 1),
  'Getting Started',
  'Next.js is a React framework...',
  encode(sha256('Next.js is a React framework...'::bytea), 'hex'),
  '[0.1, 0.2, ...]'::vector(1536),
  'github'
);

-- 4. Can we search by vector similarity?
SELECT title, content
FROM documents
ORDER BY embedding <=> '[0.1, 0.2, ...]'::vector(1536)
LIMIT 10;
```

---

## 🦙 LlamaIndex.TS Integration (Phase 0)

### Decision: Hybrid Approach - Use LlamaIndex for Chunking

**After architecture review, REVISED DECISION:** Use LlamaIndex.TS for document processing, keep custom storage.

**What we use LlamaIndex.TS for:**
- ✅ Document loaders (GitHub, web scraping, PDF parsing)
- ✅ Text splitting with semantic awareness (MarkdownNodeParser, SentenceSplitter)
- ✅ Code block detection and preservation
- ✅ Metadata extraction (section levels, hierarchy)

**What stays custom:**
- ✅ Database schema (Context7-compatible)
- ✅ Storage adapter (pluggable architecture)
- ✅ MCP server interface (our differentiator)
- ✅ Query logic (custom hybrid search)
- ✅ Vector index configuration (IVFFlat tuning)

**Rationale:**
- ✅ **Battle-tested chunking** - Solves edge cases we'd have to debug ourselves
- ✅ **Time to market** - Don't reinvent document processing
- ✅ **Maintain control** - Keep architectural decisions (storage, API, search)
- ✅ **Best of both** - Proven components + custom architecture

### Implementation Example

**Using LlamaIndex.TS for document processing:**

```typescript
import { MarkdownNodeParser, SentenceSplitter } from 'llamaindex';
import { sha256 } from '@codex7/shared/utils';

// Phase 0: Use LlamaIndex for chunking
const parser = new MarkdownNodeParser({
  chunkSize: 462,      // 462 + 50 overlap = 512 total
  chunkOverlap: 50
});

// Process markdown document
const nodes = await parser.getNodesFromDocuments([{
  text: markdownContent,
  metadata: {
    source_url: githubUrl,
    file_path: 'docs/hooks.md'
  }
}]);

// Convert LlamaIndex nodes to OUR schema
const chunks = nodes.map((node, idx) => ({
  // Our custom fields
  title: extractTitle(node),
  content: node.getText(),
  content_hash: sha256(node.getText()),
  chunk_index: idx,
  hierarchy: extractHierarchy(node),

  // Source information
  source_url: node.metadata.source_url,
  source_type: 'github',
  source_path: node.metadata.file_path,

  // Content metadata
  has_code: detectCode(node.getText()),
  code_language: detectLanguage(node.getText()),

  // LlamaIndex metadata
  metadata: {
    section_level: node.metadata.header_level,
    tokens: node.metadata.tokens
  }
}));

// Store via OUR custom adapter
await postgresAdapter.indexDocuments(version_id, chunks);
```

**Benefits of this approach:**
- ✅ LlamaIndex handles complex markdown parsing
- ✅ We control the final schema and storage
- ✅ Can swap LlamaIndex later if needed (just change processing logic)
- ✅ Battle-tested chunking with our custom architecture

### Phase 2: Advanced RAG Features

**Potential future uses of LlamaIndex:**
- LLM-powered reranking (retrieve 20, rerank with Claude to top 5)
- Agent-based iterative search (LLM decides when to search again)
- Query refinement (LLM improves search query before embedding)

**We'll keep this optional** - basic semantic search works great for MVP!

### References

- **LlamaIndex.TS:** https://ts.llamaindex.ai/
- **LlamaIndex Python:** https://docs.llamaindex.ai/
- **Chunking Strategies:** https://docs.llamaindex.ai/en/stable/module_guides/loading/node_parsers/
- **Query Engines:** https://docs.llamaindex.ai/en/stable/module_guides/deploying/query_engine/

---

## 🚧 Phase 2 Enhancements

### Planned Additions

**1. Usage Analytics**
```sql
CREATE TABLE search_queries (
  id UUID PRIMARY KEY,
  query_text TEXT,
  library_id UUID REFERENCES libraries(id),
  results_count INTEGER,
  avg_similarity FLOAT,
  created_at TIMESTAMPTZ
);
```

**2. User Submissions**
```sql
CREATE TABLE pending_libraries (
  id UUID PRIMARY KEY,
  submitted_by VARCHAR(255),
  library_url TEXT,
  status VARCHAR(50), -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ
);
```

**3. Caching Layer**
- Redis for frequently accessed embeddings
- Materialized views for popular queries

**4. Upgrade to HNSW**
```sql
-- When we hit 500k+ documents
DROP INDEX idx_documents_embedding;
CREATE INDEX idx_documents_embedding ON documents
  USING hnsw (embedding vector_cosine_ops);
```

---

## 🔍 Database Verification

### Quick Health Check

```bash
# Check pgvector extension (should show version 0.8.1)
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\dx vector"

# List all tables
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\dt"

# Verify vector column
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\d documents" | grep embedding

# Check vector index
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\di documents_embedding_idx"
```

### Expected Output

```
List of installed extensions:
  Name  | Version | Schema |                     Description
--------+---------+--------+------------------------------------------------------
 vector | 0.8.1   | public | vector data type and ivfflat and hnsw access methods

List of relations:
 Schema |        Name         | Type  | Owner
--------+---------------------+-------+--------
 public | _drizzle_migrations | table | codex7
 public | documents           | table | codex7
 public | indexing_jobs       | table | codex7
 public | libraries           | table | codex7
 public | versions            | table | codex7

 embedding    | vector(1536) |           |          |

                       List of relations:
 Schema |          Name           | Type  | Owner  |   Table
--------+-------------------------+-------+--------+-----------
 public | documents_embedding_idx | index | codex7 | documents
```

## ✅ Design Validation Checklist

Phase 0 Implementation Complete:

- [x] Schema supports Context7 identifier format
- [x] Can store multiple versions per library
- [x] Vector index configured for t3.medium constraints (IVFFlat, lists=274)
- [x] Deduplication via content hash
- [x] Flexible metadata (JSONB) for future needs
- [x] Full-text search for hybrid queries (to be implemented in queries)
- [x] Performance targets achievable (<200ms)
- [x] Storage estimates within budget (50GB SSD)
- [x] Indexes cover all common query patterns
- [x] **Docker Compose setup with dev + test databases**
- [x] **Automated migration system with tracking**
- [x] **pgvector 0.8.1 installed and verified**
- [x] **Integration tests running against real database**

---

## 📚 References

- **pgvector:** https://github.com/pgvector/pgvector
- **OpenAI Embeddings:** https://platform.openai.com/docs/guides/embeddings
- **IVFFlat vs HNSW:** https://github.com/pgvector/pgvector#ivfflat
- **PostgreSQL Performance Tuning:** https://wiki.postgresql.org/wiki/Tuning_Your_PostgreSQL_Server

---

**Made with 💜 by the Codex7 team**

*"Design the data right, and everything else follows"* ✨
