# 🏗️ Codex7 Architecture

> **A comprehensive guide to the system design of the truly open-source documentation MCP server**

---

## 📖 Table of Contents

1. [Introduction & Design Principles](#-introduction--design-principles)
2. [System Overview](#-system-overview)
3. [Component Architecture](#-component-architecture)
4. [Storage Architecture](#-storage-architecture)
5. [Data Architecture](#-data-architecture)
6. [API Architecture](#-api-architecture)
7. [Deployment Architecture](#-deployment-architecture)
8. [Security Architecture](#-security-architecture)
9. [Observability Architecture](#-observability-architecture)
10. [Design Decisions & Rationale](#-design-decisions--rationale)

---

## 🎯 Introduction & Design Principles

Codex7 is built on a foundation of **transparency, modularity, and community ownership**. Unlike proprietary alternatives that hide their implementation behind closed APIs, every aspect of Codex7's architecture is open and self-hostable.

### Core Architectural Principles

**🎯 Microservices Architecture**
Each component runs independently, can be scaled separately, and has a single, well-defined responsibility. This enables teams to work on different parts of the system simultaneously and allows fine-grained scaling based on usage patterns.

**🔌 Database Adapter Pattern**
Storage is abstracted behind an interface, allowing Codex7 to support multiple database backends (PostgreSQL, SQLite, Qdrant) without changing application logic. This gives deployers choice based on their scale and infrastructure preferences.

**🔒 Security First**
Security isn't bolted on—it's baked into every layer. From encrypted storage to JWT authentication to rate limiting, Codex7 treats security as a fundamental architectural concern, not an afterthought.

**📊 Observable by Design**
Every service emits structured logs, metrics, and traces using wonder-logger and OpenTelemetry. This isn't optional instrumentation—it's core to how the system operates and debugs issues in production.

**🧪 Test-Driven Architecture**
Components are designed to be testable in isolation. The adapter pattern, dependency injection, and Result-based error handling all support comprehensive testing without complex mocking.

**📦 Container Native**
Every service is designed to run in Docker from day one. Development environments match production, and deployment is as simple as `docker-compose up`.

---

## 🌐 System Overview

### High-Level Architecture

```
                                 Users & LLMs
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              Claude Desktop    REST Clients      Web Browser
                    │                 │                 │
                    └─────────┬───────┴─────────┬───────┘
                              │                 │
                              │                 │
                    ┌─────────▼─────────────────▼─────────┐
                    │                                      │
                    │        Application Layer             │
                    │                                      │
                    │  ┌──────────────┐  ┌─────────────┐  │
                    │  │  MCP Server  │  │  REST API   │  │
                    │  │   (stdio)    │  │  (Express)  │  │
                    │  └──────┬───────┘  └──────┬──────┘  │
                    │         │                 │         │
                    └─────────┼─────────────────┼─────────┘
                              │                 │
                              └────────┬────────┘
                                       │
                    ┌──────────────────▼──────────────────┐
                    │                                      │
                    │         Business Logic Layer         │
                    │                                      │
                    │  ┌───────────────────────────────┐  │
                    │  │      Search Service           │  │
                    │  │   (Semantic + Exact Search)   │  │
                    │  └──────────────┬────────────────┘  │
                    │                 │                    │
                    └─────────────────┼────────────────────┘
                                      │
                    ┌─────────────────▼────────────────┐
                    │                                   │
                    │      Storage Abstraction Layer    │
                    │                                   │
                    │  ┌─────────────────────────────┐  │
                    │  │    Storage Adapter          │  │
                    │  │  (Interface Implementation) │  │
                    │  └──────────────┬──────────────┘  │
                    │                 │                  │
                    └─────────────────┼──────────────────┘
                                      │
                    ┌─────────────────▼──────────────┐
                    │                                 │
                    │        Data Layer               │
                    │                                 │
                    │  ┌─────────┐  ┌────────┐       │
                    │  │ Postgres│  │ SQLite │       │
                    │  │+pgvector│  │ +vec   │       │
                    │  └─────────┘  └────────┘       │
                    │                                 │
                    └─────────────────────────────────┘


    Background Processing (Runs Independently)

    ┌──────────────────────────────────────────────┐
    │                                               │
    │           Indexer Service                     │
    │                                               │
    │  ┌──────────┐  ┌──────────┐  ┌───────────┐  │
    │  │  GitHub  │  │   Web    │  │    PDF    │  │
    │  │ Scraper  │  │ Scraper  │  │  Parser   │  │
    │  └─────┬────┘  └────┬─────┘  └─────┬─────┘  │
    │        │            │              │         │
    │        └────────────┼──────────────┘         │
    │                     │                        │
    │              ┌──────▼──────┐                 │
    │              │  Job Queue  │                 │
    │              │   (Redis)   │                 │
    │              └─────────────┘                 │
    │                                               │
    └───────────────────┬───────────────────────────┘
                        │
                        │ (Writes to Storage)
                        ▼
                  [Storage Layer]
```

### Component Overview

**Application Layer**
- **MCP Server**: Implements the Model Context Protocol for direct integration with AI tools like Claude Desktop
- **REST API**: Provides HTTP endpoints for web clients and third-party integrations
- **Web UI**: React-based dashboard for managing documentation sources and monitoring system status

**Business Logic Layer**
- **Search Service**: Orchestrates semantic (vector) and exact (keyword) search, merges results, applies ranking

**Storage Layer**
- **Storage Adapter**: Abstract interface allowing multiple database backends
- **PostgreSQL Adapter**: Production-ready implementation with pgvector for semantic search
- **Future Adapters**: SQLite (lightweight), Qdrant (high-scale)

**Background Processing**
- **Indexer Service**: Asynchronously processes documentation from various sources
- **Job Queue**: Redis-backed queue for reliable, distributed job processing

### Data Flow: Query Path

```
1. User asks question
   ↓
2. Claude Desktop → MCP Server (stdio)
   ↓
3. MCP Server calls Search Service
   ↓
4. Search Service:
   - Generates query embedding (OpenAI API)
   - Performs vector similarity search (pgvector)
   - Performs keyword search (PostgreSQL FTS)
   - Merges and ranks results
   ↓
5. Results formatted for LLM consumption
   ↓
6. Response sent back to Claude Desktop
   ↓
7. User receives documentation context
```

### Data Flow: Indexing Path

```
1. User submits GitHub repo URL
   ↓
2. Web UI → REST API → Job Queue
   ↓
3. Indexer Service picks up job
   ↓
4. GitHub Scraper:
   - Clones repository
   - Finds documentation files (docs/, README.md, etc.)
   - Extracts markdown content
   ↓
5. Document Processor:
   - Parses markdown AST
   - Chunks by headers (structural chunking)
   - Preserves hierarchy and context
   ↓
6. Embedding Generator:
   - Batches chunks for efficiency
   - Calls OpenAI embeddings API
   - Generates 1536-dimensional vectors
   ↓
7. Storage Adapter:
   - Stores documents in PostgreSQL
   - Stores embeddings in pgvector
   - Indexes for fast retrieval
   ↓
8. Status updated in UI
```

---

## 🧩 Component Architecture

### MCP Server

**Purpose**: Provide direct integration with AI tools via the Model Context Protocol

```
┌────────────────────────────────────────────┐
│           MCP Server Process               │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │      Transport Layer (stdio)         │ │
│  │  - Reads from stdin                  │ │
│  │  - Writes to stdout                  │ │
│  │  - JSON-RPC 2.0 protocol             │ │
│  └──────────────┬───────────────────────┘ │
│                 │                          │
│  ┌──────────────▼───────────────────────┐ │
│  │         MCP SDK Core                 │ │
│  │  - Protocol handling                 │ │
│  │  - Request routing                   │ │
│  │  - Error formatting                  │ │
│  └──────────────┬───────────────────────┘ │
│                 │                          │
│  ┌──────────────▼───────────────────────┐ │
│  │         Tool Handlers                │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  resolve-library-id             │ │ │
│  │  │  - Parse library identifier     │ │ │
│  │  │  - Return internal ID + metadata│ │ │
│  │  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  get-library-docs               │ │ │
│  │  │  - Generate query embedding     │ │ │
│  │  │  - Vector similarity search     │ │ │
│  │  │  - Format for LLM               │ │ │
│  │  └─────────────────────────────────┘ │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │  search-documentation (ext)     │ │ │
│  │  │  - Free-form semantic search    │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └──────────────┬───────────────────────┘ │
│                 │                          │
│  ┌──────────────▼───────────────────────┐ │
│  │      Storage Adapter Client          │ │
│  │  - Abstracts database operations     │ │
│  └──────────────────────────────────────┘ │
│                                            │
└────────────────────────────────────────────┘
```

**Key Characteristics**:
- **Stateless**: Each request is independent, no session state
- **Synchronous**: Blocks on I/O, optimized for request-response pattern
- **Lightweight**: Minimal dependencies, fast startup
- **Context7-Compatible**: Implements their tool signatures for easy migration

### REST API

**Purpose**: Provide HTTP interface for web clients and integrations

```
┌──────────────────────────────────────────────┐
│             REST API Service                 │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │         Express.js Server              │ │
│  │  - HTTP/HTTPS listener                 │ │
│  │  - Middleware pipeline                 │ │
│  │  - Route registration                  │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│  ┌─────────────▼──────────────────────────┐ │
│  │          Middleware Stack              │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Authentication (JWT)            │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Rate Limiting (per API key)     │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Request Validation              │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Structured Logging              │  │ │
│  │  └──────────────────────────────────┘  │ │
│  │  ┌──────────────────────────────────┐  │ │
│  │  │  Error Handling                  │  │ │
│  │  └──────────────────────────────────┘  │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│  ┌─────────────▼──────────────────────────┐ │
│  │             Route Handlers             │ │
│  │  GET    /api/libraries                 │ │
│  │  POST   /api/libraries                 │ │
│  │  GET    /api/libraries/:id             │ │
│  │  GET    /api/libraries/:id/versions    │ │
│  │  POST   /api/search                    │ │
│  │  GET    /health                        │ │
│  │  GET    /metrics (Prometheus)          │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│  ┌─────────────▼──────────────────────────┐ │
│  │          Business Logic                │ │
│  │  (Controllers, Services)               │ │
│  └─────────────┬──────────────────────────┘ │
│                │                             │
│  ┌─────────────▼──────────────────────────┐ │
│  │        Storage Adapter Client          │ │
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

**Key Characteristics**:
- **RESTful**: Standard HTTP verbs, resource-oriented URLs
- **Authenticated**: JWT-based authentication for all non-public endpoints
- **Rate Limited**: Per-API-key limits to prevent abuse
- **Validated**: Request schemas enforced before processing
- **Observable**: All requests logged with trace context

### Web UI

**Purpose**: Provide human-friendly interface for system management

```
┌──────────────────────────────────────────────┐
│              Web UI (React)                  │
│                                              │
│  ┌────────────────────────────────────────┐ │
│  │           React Application            │ │
│  │                                        │ │
│  │  Pages:                                │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │  Dashboard                       │ │ │
│  │  │  - System status                 │ │ │
│  │  │  - Recent activity               │ │ │
│  │  │  - Quick stats                   │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │  Libraries                       │ │ │
│  │  │  - Browse indexed libraries      │ │ │
│  │  │  - View versions                 │ │ │
│  │  │  - Manage sources                │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │  Add Source                      │ │ │
│  │  │  - GitHub repo form              │ │ │
│  │  │  - Web scraper config            │ │ │
│  │  │  - Indexing options              │ │ │
│  │  └──────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────┐ │ │
│  │  │  Settings                        │ │ │
│  │  │  - API key management            │ │ │
│  │  │  - System configuration          │ │ │
│  │  └──────────────────────────────────┘ │ │
│  └────────────┬───────────────────────────┘ │
│               │                             │
│  ┌────────────▼───────────────────────────┐ │
│  │         API Client Layer               │ │
│  │  - REST API calls                      │ │
│  │  - Request/response handling           │ │
│  │  - Error boundary wrapping             │ │
│  └────────────────────────────────────────┘ │
│                                              │
└──────────────────────────────────────────────┘
```

**Key Characteristics**:
- **SPA**: Single-page application built with React 18
- **Type-Safe**: Full TypeScript for compile-time safety
- **Modern**: Vite for fast builds and HMR
- **Responsive**: Works on desktop, tablet, mobile
- **Accessible**: WCAG 2.1 AA compliance

### Indexer Service

**Purpose**: Process documentation from various sources asynchronously

```
┌──────────────────────────────────────────────────────┐
│             Indexer Service                          │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │            Job Queue Consumer                  │ │
│  │  - Connects to Redis                           │ │
│  │  - Polls for indexing jobs                     │ │
│  │  - Manages job lifecycle                       │ │
│  └─────────────┬──────────────────────────────────┘ │
│                │                                     │
│  ┌─────────────▼──────────────────────────────────┐ │
│  │         Source Processors                      │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  GitHub Processor                        │ │ │
│  │  │  - Clone repository                      │ │ │
│  │  │  - Find documentation files              │ │ │
│  │  │  - Extract markdown                      │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Web Scraper                             │ │ │
│  │  │  - Playwright for dynamic content        │ │ │
│  │  │  - Respect robots.txt                    │ │ │
│  │  │  - Extract text + code                   │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  PDF Parser (future)                     │ │ │
│  │  │  - Extract text                          │ │ │
│  │  │  - Preserve formatting                   │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  └─────────────┬──────────────────────────────────┘ │
│                │                                     │
│  ┌─────────────▼──────────────────────────────────┐ │
│  │         Document Processor                     │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Markdown Parser (unified/remark)        │ │ │
│  │  │  - Parse to AST                          │ │ │
│  │  │  - Extract structure                     │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Structural Chunker                      │ │ │
│  │  │  - Split by headers (h1, h2, h3)         │ │ │
│  │  │  - Preserve hierarchy                    │ │ │
│  │  │  - Maintain context                      │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────┐ │ │
│  │  │  Metadata Extractor                      │ │ │
│  │  │  - Section headers                       │ │ │
│  │  │  - Code language detection               │ │ │
│  │  │  - Content type classification           │ │ │
│  │  └──────────────────────────────────────────┘ │ │
│  └─────────────┬──────────────────────────────────┘ │
│                │                                     │
│  ┌─────────────▼──────────────────────────────────┐ │
│  │         Embedding Generator                    │ │
│  │  - Batch chunks for efficiency                 │ │
│  │  - Call OpenAI embeddings API                  │ │
│  │  - Generate 1536-dimensional vectors           │ │
│  │  - Handle rate limits and retries              │ │
│  └─────────────┬──────────────────────────────────┘ │
│                │                                     │
│  ┌─────────────▼──────────────────────────────────┐ │
│  │         Storage Writer                         │ │
│  │  - Batch inserts for performance               │ │
│  │  - Content-hash deduplication                  │ │
│  │  - Transactional writes                        │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Key Characteristics**:
- **Asynchronous**: Non-blocking, uses job queue for reliability
- **Resumable**: Jobs can be retried on failure
- **Scalable**: Multiple workers can process jobs in parallel
- **Fault-Tolerant**: Failed jobs are requeued with exponential backoff
- **Efficient**: Batches API calls to reduce costs and improve throughput

---

## 💾 Storage Architecture

### Adapter Pattern

The storage adapter pattern allows Codex7 to support multiple database backends without changing application code. All storage operations go through a common interface:

```
┌─────────────────────────────────────────────────────┐
│          Application Code (MCP, API, etc.)          │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ (Uses common interface)
                      │
┌─────────────────────▼───────────────────────────────┐
│              Storage Adapter Interface              │
│                                                      │
│  interface DocumentStore {                          │
│    indexDocument(doc: Document): Promise<void>      │
│    semanticSearch(query, limit): Promise<Doc[]>     │
│    exactSearch(filters): Promise<Doc[]>             │
│    getLibrary(id): Promise<Library>                 │
│    listLibraries(): Promise<Library[]>              │
│    ... (other methods)                              │
│  }                                                   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ (Multiple implementations)
                      │
        ┌─────────────┼─────────────┐
        │             │             │
┌───────▼──────┐ ┌────▼────────┐ ┌─▼─────────────┐
│  PostgreSQL  │ │   SQLite    │ │    Qdrant     │
│   Adapter    │ │   Adapter   │ │    Adapter    │
│              │ │             │ │               │
│ + pgvector   │ │  + vec      │ │ (specialized) │
└──────┬───────┘ └─────┬───────┘ └───────┬───────┘
       │               │                 │
       ▼               ▼                 ▼
   [Postgres]      [SQLite]         [Qdrant]
```

**Benefits**:
- **Flexibility**: Users choose the database that fits their needs
- **Testability**: Easy to create in-memory adapters for testing
- **Future-Proof**: New backends can be added without touching application code
- **Vendor Independence**: Not locked into a specific database

### PostgreSQL + pgvector (Primary)

**Why PostgreSQL?**
- Industry-standard relational database with excellent reliability
- pgvector extension provides vector similarity search
- Single database for both relational and vector data (no data duplication)
- ACID compliance for data integrity
- Mature tooling, monitoring, and backup solutions

```
┌──────────────────────────────────────────────────┐
│           PostgreSQL Database                    │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │           Core Tables                      │ │
│  │                                            │ │
│  │  libraries                                 │ │
│  │  - Metadata about each library            │ │
│  │  - Repository URL, homepage, description  │ │
│  │  - Trust score                            │ │
│  │                                            │ │
│  │  versions                                  │ │
│  │  - Tracks multiple versions per library   │ │
│  │  - Version string, git commit, dates      │ │
│  │  - "latest" flag                          │ │
│  │                                            │ │
│  │  documents                                 │ │
│  │  - Documentation chunks                   │ │
│  │  - Title, content, URL                    │ │
│  │  - embedding (vector[1536])               │ │
│  │  - Hierarchy and metadata                 │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │            Indexes                         │ │
│  │                                            │ │
│  │  Vector Similarity (IVFFlat)               │ │
│  │  - Fast approximate nearest neighbor      │ │
│  │  - Cosine similarity metric                │ │
│  │                                            │ │
│  │  Full-Text Search (GIN)                    │ │
│  │  - Keyword search on content               │ │
│  │  - English language processing             │ │
│  │                                            │ │
│  │  Performance Indexes (B-Tree)              │ │
│  │  - library_id, version_id                  │ │
│  │  - content_hash (deduplication)            │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

**pgvector Details**:
- Uses IVFFlat index for approximate nearest neighbor search
- Trades perfect accuracy for speed (typically 85-90% recall)
- Supports multiple distance metrics (cosine, L2, inner product)
- Scales to millions of vectors on modern hardware

### Future: SQLite + sqlite-vec

**Use Case**: Lightweight deployments, embedded systems, local development

- Single file database, no server required
- Full SQL capabilities with minimal overhead
- sqlite-vec provides vector similarity search
- Perfect for developers running Codex7 locally

### Future: Qdrant

**Use Case**: High-scale deployments with millions of documents

- Purpose-built vector database
- Horizontal scaling capabilities
- Advanced filtering and hybrid search
- Production-grade clustering and replication

---

## 📊 Data Architecture

### Database Schema Overview

The Codex7 data model is designed around three core entities:

```
┌──────────────────┐
│    Libraries     │  (What: react, next.js, etc.)
│                  │
│  - id            │
│  - name          │
│  - identifier    │
│  - repository    │
│  - trust_score   │
│  - metadata      │
└────────┬─────────┘
         │
         │ one-to-many
         │
         ▼
┌──────────────────┐
│     Versions     │  (When: v18.2.0, v13.0.0, latest)
│                  │
│  - id            │
│  - library_id    │
│  - version_str   │
│  - git_commit    │
│  - is_latest     │
└────────┬─────────┘
         │
         │ one-to-many
         │
         ▼
┌──────────────────┐
│    Documents     │  (Chunks of documentation)
│                  │
│  - id            │
│  - version_id    │
│  - title         │
│  - content       │
│  - embedding     │  ← vector[1536]
│  - chunk_index   │
│  - url           │
│  - metadata      │
└──────────────────┘
```

### Document Structure

Each document represents a logical chunk of documentation:

```
Document {
  id: UUID
  version_id: UUID  (points to specific version)

  title: string
    Example: "React Hooks > useState"

  content: string (markdown or plain text)
    Example: "The useState hook allows you to add state..."

  embedding: float[1536]
    (Vector representation for semantic search)

  chunk_index: integer
    (Position in original document)

  parent_doc_id: UUID | null
    (For hierarchical documentation)

  url: string
    (Source URL for linking back)

  source_type: enum
    (github | web | pdf | manual)

  metadata: JSON {
    hierarchy: string[]
      Example: ["React Hooks", "useState", "Example"]

    section_level: integer
      (1 for h1, 2 for h2, etc.)

    has_code: boolean

    language: string | null
      (jsx, python, bash, etc.)

    keywords: string[]
      (Extracted important terms)
  }
}
```

### Vector Embeddings

**What are embeddings?**
Embeddings are dense vector representations of text that capture semantic meaning. Similar concepts have similar vectors, enabling semantic search.

```
Text: "React useState hook"
  ↓ (OpenAI embeddings API)
Embedding: [0.123, -0.456, 0.789, ..., 0.321]  (1536 dimensions)


Similarity Calculation (cosine similarity):

Query: "How to use state in React?"
Query Vector: [0.145, -0.423, 0.812, ..., 0.298]

Document: "React useState hook"
Doc Vector:   [0.123, -0.456, 0.789, ..., 0.321]

Cosine Similarity: 0.89  (very similar!)


Document: "Python dictionary methods"
Doc Vector:   [-0.234, 0.678, -0.123, ..., 0.456]

Cosine Similarity: 0.12  (not similar)
```

**Why OpenAI embeddings?**
- High quality semantic representations
- Well-documented and stable
- Cost-effective for moderate volumes
- Industry standard

**Future: Local embeddings**
- Use transformers.js for privacy-focused deployments
- Run entirely offline
- No per-request costs
- Trade-off: slightly lower quality vs OpenAI

### Chunking Strategy

Documentation is split into semantic chunks to optimize retrieval:

```
Original Document:
═══════════════════════════════════════════════════
# React Hooks

## useState Hook
The useState hook allows you to add state to
functional components.

### Example
```jsx
const [count, setCount] = useState(0);
```

### Parameters
- initialState: The initial state value

## useEffect Hook
The useEffect hook lets you perform side effects...
═══════════════════════════════════════════════════

↓ (Structural Chunking)

Chunk 1:
───────────────────────────────────────────────────
title: "React Hooks > useState Hook"
content: "The useState hook allows you to add
          state to functional components."
hierarchy: ["React Hooks", "useState Hook"]
section_level: 2
───────────────────────────────────────────────────

Chunk 2:
───────────────────────────────────────────────────
title: "React Hooks > useState Hook > Example"
content: "```jsx
          const [count, setCount] = useState(0);
          ```"
hierarchy: ["React Hooks", "useState Hook", "Example"]
section_level: 3
has_code: true
language: "jsx"
───────────────────────────────────────────────────

Chunk 3:
───────────────────────────────────────────────────
title: "React Hooks > useState Hook > Parameters"
content: "- initialState: The initial state value"
hierarchy: ["React Hooks", "useState Hook", "Parameters"]
section_level: 3
───────────────────────────────────────────────────

Chunk 4:
───────────────────────────────────────────────────
title: "React Hooks > useEffect Hook"
content: "The useEffect hook lets you perform side
          effects..."
hierarchy: ["React Hooks", "useEffect Hook"]
section_level: 2
───────────────────────────────────────────────────
```

**Benefits of Structural Chunking**:
- Preserves document hierarchy in search results
- Each chunk is self-contained and meaningful
- Enables precise retrieval (get just the relevant section)
- Maintains context (hierarchy path shows where chunk came from)

---

## 🔌 API Architecture

### MCP Tools

Codex7 implements two categories of MCP tools:

**Context7-Compatible Tools** (for easy migration):

```
Tool: resolve-library-id
───────────────────────────────────────────────────
Purpose: Map library name to internal identifier

Input:
  libraryName: string
    Example: "react", "next.js", "@vercel/next.js"

Output: {
  matches: [{
    id: string                 (e.g., "/facebook/react")
    name: string               (e.g., "React")
    description: string
    trust_score: number        (1-10)
    repository_url: string
    versions: string[]         (e.g., ["v18.2.0", "latest"])
  }]
}
───────────────────────────────────────────────────

Tool: get-library-docs
───────────────────────────────────────────────────
Purpose: Retrieve documentation for a library

Input:
  context7CompatibleLibraryID: string
    Example: "/facebook/react" or "/facebook/react/v18.2.0"
  topic?: string
    Example: "hooks", "routing"
  tokens?: number
    (Default: 5000, maximum docs to return)

Output: {
  content: string             (formatted for LLM)
  metadata: {
    library: string
    version: string
    chunks_returned: number
    total_tokens: number
  }
}

Flow:
  1. Parse library ID (org/project/version)
  2. Build search query (topic or generic)
  3. Generate query embedding
  4. Vector similarity search
  5. Format results for LLM consumption
  6. Truncate to token limit
───────────────────────────────────────────────────
```

**Extended Tools** (Codex7 enhancements):

```
Tool: search-documentation
───────────────────────────────────────────────────
Purpose: Free-form semantic search across all indexed docs

Input:
  query: string
  filters?: {
    library?: string
    version?: string
    has_code?: boolean
  }
  limit?: number

Output: [
  {
    title: string
    content: string
    library: string
    version: string
    url: string
    relevance_score: number
  }
]
───────────────────────────────────────────────────

Tool: get-library-versions
───────────────────────────────────────────────────
Purpose: List all available versions for a library

Input:
  library_id: string

Output: [
  {
    version: string
    git_commit: string
    release_date: string
    is_latest: boolean
  }
]
───────────────────────────────────────────────────

Tool: check-freshness
───────────────────────────────────────────────────
Purpose: Check when documentation was last updated

Input:
  library_id: string
  version?: string

Output: {
  last_indexed: string (ISO timestamp)
  stale: boolean (> 30 days old)
  update_available: boolean
}
───────────────────────────────────────────────────
```

### REST API Endpoints

```
Authentication:
  All endpoints (except /health, /metrics) require JWT token
  Header: Authorization: Bearer <token>

Rate Limiting:
  Per API key: 100 requests/minute
  Response header: X-RateLimit-Remaining

─────────────────────────────────────────────────────

GET /health
  Health check endpoint
  Returns: { status: "ok", version: "0.1.0" }

GET /metrics
  Prometheus metrics
  Returns: text/plain metrics

POST /api/auth/token
  Generate API token
  Body: { username, password }
  Returns: { token: string }

GET /api/libraries
  List all indexed libraries
  Query params: ?limit=50&offset=0
  Returns: { libraries: [...], total: number }

POST /api/libraries
  Add library to indexing queue
  Body: {
    type: "github" | "web" | "pdf",
    source: string (URL or path),
    options?: { branch?, path? }
  }
  Returns: { job_id: string }

GET /api/libraries/:id
  Get library details
  Returns: { library, versions: [...] }

GET /api/libraries/:id/versions
  List versions for library
  Returns: { versions: [...] }

POST /api/search
  Semantic + keyword search
  Body: {
    query: string,
    filters?: { library?, version?, has_code? },
    limit?: number
  }
  Returns: {
    results: [...],
    took_ms: number
  }

GET /api/jobs/:id
  Check indexing job status
  Returns: {
    id: string,
    status: "pending" | "processing" | "completed" | "failed",
    progress?: number,
    error?: string
  }
```

### Authentication Flow

```
User Registration:
──────────────────────────────────────────────
1. Admin creates user account
   POST /api/admin/users
   Body: { username, password, role }

2. User credentials stored (bcrypt hashed)


Token Generation:
──────────────────────────────────────────────
1. User logs in
   POST /api/auth/token
   Body: { username, password }

2. Server validates credentials

3. Server generates JWT:
   {
     sub: user_id,
     username: string,
     role: "user" | "admin",
     iat: timestamp,
     exp: timestamp (24 hours)
   }

4. Token signed with JWT_SECRET

5. Token returned to client


Authenticated Request:
──────────────────────────────────────────────
1. Client includes token in header:
   Authorization: Bearer <token>

2. Middleware validates:
   - Token not expired
   - Signature valid
   - User still exists

3. Request context enriched with user data

4. Rate limit checked against user_id

5. Request proceeds to handler
```

---

## 🐳 Deployment Architecture

### Docker Compose Stack

Codex7 uses Docker Compose for both development and production deployments:

```
┌────────────────────────────────────────────────────────┐
│                   Host Machine                         │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │              nginx (Reverse Proxy)               │ │
│  │  - SSL termination (Let's Encrypt)               │ │
│  │  - Load balancing                                │ │
│  │  - Static file serving                           │ │
│  │  Ports: 80 (HTTP), 443 (HTTPS)                  │ │
│  └───────────┬──────────────┬───────────────────────┘ │
│              │              │                          │
│              │              │                          │
│  ┌───────────▼────────┐  ┌──▼──────────────────────┐ │
│  │    Web UI          │  │    REST API             │ │
│  │  (nginx serving    │  │  (Express.js)           │ │
│  │   static React)    │  │  Port: 3000 (internal)  │ │
│  │  Port: 80          │  └──┬──────────────────────┘ │
│  └────────────────────┘     │                         │
│                              │                         │
│  ┌──────────────────────────▼───────────────────────┐ │
│  │            MCP Server (stdio)                    │ │
│  │  - Runs in container                             │ │
│  │  - stdio transport for Claude Desktop            │ │
│  │  - No network port (accessed via docker exec)   │ │
│  └──────────────────┬───────────────────────────────┘ │
│                     │                                  │
│  ┌──────────────────▼───────────────────────────────┐ │
│  │           PostgreSQL + pgvector                  │ │
│  │  - Persistent volume                             │ │
│  │  - Port: 5432 (internal only)                    │ │
│  │  - Health checks enabled                         │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │              Redis                             │  │
│  │  - Job queue backend                           │  │
│  │  - Port: 6379 (internal only)                  │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │           Indexer Service                      │  │
│  │  - Background job processor                    │  │
│  │  - Connects to Redis for jobs                  │  │
│  │  - Connects to Postgres for storage            │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
│  ┌────────────────────────────────────────────────┐  │
│  │     Observability Stack (Optional)             │  │
│  │  ┌──────────────┐  ┌───────────────────────┐  │  │
│  │  │ Prometheus   │  │ Grafana               │  │  │
│  │  │ (metrics)    │  │ (visualization)       │  │  │
│  │  └──────────────┘  └───────────────────────┘  │  │
│  │  ┌──────────────┐  ┌───────────────────────┐  │  │
│  │  │ Loki         │  │ Tempo                 │  │  │
│  │  │ (logs)       │  │ (traces)              │  │  │
│  │  └──────────────┘  └───────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                        │
└────────────────────────────────────────────────────────┘
```

### Network Architecture

```
Docker Networks:
════════════════════════════════════════════════════

codex7-frontend (bridge network)
  - nginx
  - web UI
  Purpose: Public-facing services

codex7-backend (internal network)
  - REST API
  - MCP Server
  - Indexer Service
  Purpose: Application services

codex7-data (internal network)
  - PostgreSQL
  - Redis
  Purpose: Data persistence layer

Security:
  - Only nginx exposed to public internet
  - All service-to-service communication internal
  - Database not accessible from outside host
```

### Volume Management

```
Persistent Volumes:
═══════════════════════════════════════════════════

postgres_data/
  └─ PostgreSQL data directory
     - Contains all database files
     - Backed up regularly
     - Survives container restarts

redis_data/
  └─ Redis persistence (optional)
     - Job queue state
     - Can be ephemeral

nginx_certs/
  └─ SSL certificates
     - Let's Encrypt certificates
     - Renewed automatically

nginx_logs/
  └─ Access and error logs
     - Rotated daily
     - Retained for 30 days
```

### Scaling Considerations

```
Horizontal Scaling:
═══════════════════════════════════════════════════

Can scale independently:
  - MCP Server instances (load balanced)
  - REST API instances (load balanced)
  - Indexer workers (pull from shared queue)

Cannot easily scale (single instance):
  - PostgreSQL (use replicas for read scaling)
  - Redis (use Redis Cluster for production scale)

Vertical Scaling:
═══════════════════════════════════════════════════

Resource allocation per service (recommended minimums):

MCP Server:
  CPU: 0.5 cores
  Memory: 512 MB

REST API:
  CPU: 1 core
  Memory: 1 GB

Indexer:
  CPU: 2 cores (embedding generation is CPU-intensive)
  Memory: 2 GB

PostgreSQL:
  CPU: 2 cores
  Memory: 4 GB (more for large deployments)

Overall minimum for self-hosting:
  CPU: 4 cores
  Memory: 8 GB
  Storage: 50 GB SSD
```

---

## 🔒 Security Architecture

### Defense in Depth

Codex7 implements multiple layers of security:

```
┌────────────────────────────────────────────────┐
│         Layer 1: Network Security              │
│  - SSL/TLS encryption (Let's Encrypt)          │
│  - HTTPS only (HTTP redirects to HTTPS)        │
│  - Internal networks (Docker)                  │
│  - Firewall rules (only 80, 443 public)        │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│      Layer 2: Application Security             │
│  - JWT authentication                          │
│  - Rate limiting per API key                   │
│  - Request validation (schemas)                │
│  - CORS configuration                          │
│  - XSS protection headers                      │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│        Layer 3: Data Security                  │
│  - Parameterized queries (no SQL injection)    │
│  - Encryption at rest (database level)         │
│  - Embeddings encrypted                        │
│  - Password hashing (bcrypt)                   │
│  - Secrets in environment variables            │
└────────────────────┬───────────────────────────┘
                     │
┌────────────────────▼───────────────────────────┐
│      Layer 4: Operational Security             │
│  - Audit logging (all actions)                 │
│  - Dependency scanning (GitHub Actions)        │
│  - Container image scanning                    │
│  - Regular security updates                    │
│  - Backup encryption                           │
└────────────────────────────────────────────────┘
```

### Authentication Flow Details

```
Password Storage:
═══════════════════════════════════════════════════
User submits password
  ↓
bcrypt hash (cost factor 12)
  ↓
Hashed password stored in database
  (never store plaintext!)


JWT Token Structure:
═══════════════════════════════════════════════════
{
  "header": {
    "alg": "HS256",        // HMAC SHA-256
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id",      // Subject (user identifier)
    "username": "alice",
    "role": "admin",
    "iat": 1704067200,     // Issued at (timestamp)
    "exp": 1704153600      // Expires (24 hours)
  },
  "signature": "..."       // HMAC(header + payload, JWT_SECRET)
}


Token Validation:
═══════════════════════════════════════════════════
1. Extract token from Authorization header
2. Verify signature using JWT_SECRET
3. Check expiration (exp claim)
4. Verify user still exists in database
5. Check user hasn't been disabled
6. Proceed with request
```

### Rate Limiting Strategy

```
Per-API-Key Limits:
═══════════════════════════════════════════════════
Window: 1 minute
Limit: 100 requests

Implementation:
  - Redis-backed counter
  - Sliding window algorithm
  - Headers returned:
    X-RateLimit-Limit: 100
    X-RateLimit-Remaining: 73
    X-RateLimit-Reset: 1704067260

When exceeded:
  - HTTP 429 Too Many Requests
  - Retry-After header with seconds
  - Body: { error: "Rate limit exceeded" }


Per-IP Limits (unauthenticated):
═══════════════════════════════════════════════════
Window: 1 minute
Limit: 10 requests

Purpose: Prevent abuse of public endpoints
```

### Data Encryption

```
At Rest:
═══════════════════════════════════════════════════
PostgreSQL:
  - Full database encryption (pgcrypto)
  - Individual column encryption for sensitive data
  - Encryption keys stored in secure environment

Embeddings:
  - Encrypted at column level
  - Transparent to application code


In Transit:
═══════════════════════════════════════════════════
External:
  - TLS 1.3 (SSL certificates from Let's Encrypt)
  - HSTS headers (strict transport security)
  - Certificate pinning (optional)

Internal (Docker networks):
  - Encrypted by default in Docker overlay networks
  - Service-to-service communication secured
```

---

## 📊 Observability Architecture

Codex7 uses [wonder-logger](https://github.com/jenova-marie/wonder-logger) for comprehensive observability. See [LOGGING.md](./LOGGING.md) for complete details.

### Three Pillars of Observability

```
┌────────────────────────────────────────────────┐
│              Application Code                  │
│  (MCP Server, API, Indexer, etc.)              │
└─────────────┬──────────────────────────────────┘
              │
              │ (wonder-logger)
              │
    ┌─────────┼─────────┐
    │         │         │
┌───▼───┐ ┌───▼────┐ ┌──▼──────┐
│ LOGS  │ │ METRICS│ │ TRACES  │
└───┬───┘ └───┬────┘ └──┬──────┘
    │         │         │
    ▼         ▼         ▼
┌───────────────────────────────┐
│   Observability Backend       │
│                               │
│  ┌──────┐  ┌──────────────┐  │
│  │ Loki │  │ Prometheus   │  │
│  └──┬───┘  └──────┬───────┘  │
│     │             │           │
│     └──────┬──────┘           │
│            │                  │
│     ┌──────▼───────┐          │
│     │  Grafana     │          │
│     │ (Dashboard)  │          │
│     └──────────────┘          │
│                               │
│  ┌──────────────┐             │
│  │    Tempo     │             │
│  │  (Tracing)   │             │
│  └──────────────┘             │
│                               │
└───────────────────────────────┘
```

### Structured Logging

All logs are JSON-formatted with trace context:

```json
{
  "level": "info",
  "time": "2025-01-22T10:30:45.123Z",
  "service": "mcp-server",
  "trace_id": "a1b2c3d4e5f6",
  "span_id": "f6e5d4c3b2a1",
  "msg": "Semantic search completed",
  "query": "react hooks",
  "results": 12,
  "took_ms": 145
}
```

### Distributed Tracing

Every request generates a trace that spans all services:

```
User Query: "How to use React hooks?"
─────────────────────────────────────────────────

Trace ID: a1b2c3d4e5f6

Span 1: MCP Tool Handler (get-library-docs)
  Duration: 450ms
  ├─ Span 2: Generate Query Embedding
  │  Duration: 120ms
  │  Service: OpenAI API
  ├─ Span 3: Vector Similarity Search
  │  Duration: 280ms
  │  Service: PostgreSQL
  │  ├─ Span 4: Database Query
  │  │  Duration: 250ms
  │  └─ Span 5: Result Formatting
  │     Duration: 30ms
  └─ Span 6: Response Formatting
     Duration: 50ms

Total: 450ms
```

### Metrics Collection

```
Application Metrics:
═══════════════════════════════════════════════════
- codex7_search_requests_total (counter)
- codex7_search_duration_seconds (histogram)
- codex7_documents_indexed_total (counter)
- codex7_embedding_api_calls_total (counter)
- codex7_storage_operations_total (counter)

System Metrics (automatic):
═══════════════════════════════════════════════════
- CPU usage per container
- Memory usage per container
- Network I/O per container
- Disk I/O per container

Database Metrics:
═══════════════════════════════════════════════════
- Query duration percentiles (p50, p95, p99)
- Connection pool usage
- Cache hit rate
- Index usage statistics
```

For complete observability details, see [LOGGING.md](./LOGGING.md).

---

## 🤔 Design Decisions & Rationale

### Why Microservices?

**Decision**: Split system into independent services (MCP Server, REST API, Indexer, Web UI)

**Rationale**:
- **Independent Scaling**: Scale indexer workers without scaling API servers
- **Technology Choice**: Each service can use different tools (e.g., Playwright for indexer)
- **Team Velocity**: Multiple developers can work on different services simultaneously
- **Fault Isolation**: Indexer crash doesn't affect real-time queries
- **Deployment Flexibility**: Update one service without redeploying everything

**Trade-offs**:
- More operational complexity (multiple containers)
- Network overhead for inter-service communication
- Requires orchestration (Docker Compose or Kubernetes)

**Why this is right for Codex7**:
The benefits outweigh the costs. Self-hosters can start with `docker-compose up` (simple), and the architecture allows scaling as usage grows.

---

### Why PostgreSQL + pgvector?

**Decision**: Use PostgreSQL with pgvector extension as primary database

**Rationale**:
- **Single Database**: No data duplication between relational DB and vector DB
- **Proven Reliability**: PostgreSQL is battle-tested for 30+ years
- **Good Enough**: pgvector provides 85-90% recall, sufficient for documentation search
- **Operational Simplicity**: One database to backup, monitor, and maintain
- **SQL Power**: Full SQL capabilities for complex queries and aggregations
- **Self-Hosting Friendly**: Easy to run PostgreSQL, mature tooling

**Alternatives Considered**:
- **Qdrant/Weaviate**: Better vector search performance, but adds complexity
- **Pinecone**: Cloud-only, not self-hostable
- **SQLite**: Great for development, but limited concurrency

**Why this is right for Codex7**:
Self-hosters value simplicity. PostgreSQL is familiar, reliable, and "good enough" for semantic search. We can add Qdrant adapter later for scale.

---

### Why Adapter Pattern for Storage?

**Decision**: Abstract storage behind `DocumentStore` interface

**Rationale**:
- **Flexibility**: Users choose database based on their needs (Postgres, SQLite, Qdrant)
- **Future-Proof**: Can add new backends without changing application code
- **Testing**: Easy to create in-memory adapters for fast tests
- **Vendor Independence**: Not locked into specific database

**Trade-offs**:
- Abstraction layer adds small performance overhead
- Interface must be broad enough for all backends
- Some database-specific features can't be used

**Why this is right for Codex7**:
The flexibility is essential for a self-hosted project. Different users have different constraints (embedded SQLite vs cloud Qdrant), and the adapter pattern accommodates all.

---

### Why OpenAI Embeddings (Initially)?

**Decision**: Use OpenAI embeddings API for MVP, with plans for local models

**Rationale**:
- **Quality**: OpenAI embeddings are state-of-the-art
- **Time to Market**: No need to train or fine-tune models
- **Cost-Effective**: $0.0001 per 1K tokens is reasonable for moderate usage
- **Stable API**: Well-documented, reliable service

**Future Plan**:
- Support local models (transformers.js) for privacy-focused deployments
- Pluggable embedding providers via adapter pattern
- Users can run 100% offline if desired

**Why this is right for Codex7**:
Start with quality embeddings to prove value, then add local options for privacy. Most self-hosters are pragmatic—they'll accept OpenAI for convenience unless they have strict privacy requirements.

---

### Why Structural Chunking (vs Semantic)?

**Decision**: Chunk documentation by markdown headers, not semantic similarity

**Rationale**:
- **Preserves Hierarchy**: Each chunk knows its place in document structure
- **Deterministic**: Same document always chunks the same way
- **Fast**: No LLM calls required during indexing
- **Context Preservation**: Chunk titles include full hierarchy path
- **Code-Friendly**: Respects code block boundaries

**Alternatives Considered**:
- **Fixed-Size Chunking**: Breaks mid-sentence, loses context
- **Semantic Chunking**: Better quality but requires LLM, slow and expensive

**Why this is right for Codex7**:
Documentation is naturally structured with headers. Structural chunking respects that structure, is fast, and produces consistent results. For technical documentation, this beats semantic chunking.

---

### Why Monorepo?

**Decision**: Use pnpm monorepo for all packages

**Rationale**:
- **Code Sharing**: Shared types, utilities, constants across all services
- **Atomic Changes**: Update interface and all implementations in one commit
- **Consistent Tooling**: One TypeScript config, one test runner, one linter
- **Simplified CI/CD**: One pipeline tests all packages
- **Better DX**: Jump between packages in IDE easily

**Trade-offs**:
- Larger repository size
- All developers need full repo (can't clone just one service)
- Requires understanding of monorepo tooling

**Why this is right for Codex7**:
For a project with tight coupling between services (shared types, interfaces), a monorepo reduces friction. pnpm makes it fast and efficient.

---

### Why Result Types (ts-rust-result)?

**Decision**: Use `Result<T, E>` for all error handling instead of exceptions

**Rationale**:
- **Explicit**: Function signatures reveal possible errors
- **Type-Safe**: Compiler forces error handling
- **Composable**: Easy to chain operations and propagate errors
- **JSON-Friendly**: Errors are serializable for APIs and logs
- **Predictable**: No surprise exceptions breaking control flow

See [ERROR_HANDLING.md](./ERROR_HANDLING.md) for complete details.

**Why this is right for Codex7**:
Distributed systems need explicit error handling. Result types make errors first-class values, improving reliability and debuggability.

---

### Why Docker-First?

**Decision**: All services designed to run in Docker containers

**Rationale**:
- **Dev-Prod Parity**: Development environment matches production
- **Easy Onboarding**: New developers run `docker-compose up`
- **Dependency Isolation**: No "works on my machine" issues
- **Deployment Simplicity**: Ship containers, not installation scripts
- **Portability**: Run anywhere Docker runs (AWS, DigitalOcean, local)

**Why this is right for Codex7**:
Self-hosting needs to be easy. Docker Compose gives one-command deployment that works on any Linux server. It's the right balance of simplicity and professionalism.

---

## 🎯 Summary

Codex7's architecture is designed around three core values:

1. **Transparency**: Every component is open and understandable
2. **Modularity**: Swap databases, add features, scale independently
3. **Self-Hostability**: Run the entire stack on your infrastructure

The result is a system that's both powerful and approachable—suitable for individual developers running it locally and teams deploying it to production.

**Key Architectural Strengths**:
- Microservices enable independent scaling and development
- Storage adapter pattern provides database flexibility
- Result-based error handling improves reliability
- Comprehensive observability aids debugging and monitoring
- Docker-first approach simplifies deployment

**Next Steps**:
- Explore [GETTING_STARTED.md](./GETTING_STARTED.md) to run Codex7 locally
- Read [SELF_HOSTING.md](./SELF_HOSTING.md) for production deployment
- Review [ERROR_HANDLING.md](./ERROR_HANDLING.md) and [LOGGING.md](./LOGGING.md) for implementation details
- Check [TESTING.md](./TESTING.md) for test strategies

---

**Made with 💜 by the Codex7 community**

*"Transparent architecture for transparent open-source"* ✨
