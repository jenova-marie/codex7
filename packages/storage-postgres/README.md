# 💾 @codex7/storage-postgres

PostgreSQL + pgvector storage adapter for Codex7 documentation MCP server.

## 🎯 Automated Migration Workflow

**No manual steps required!** The migration process is fully automated.

### Quick Start

```bash
# 1. Generate Drizzle schemas from TypeScript models
pnpm make

# 2. Run all migrations (including pgvector index)
pnpm migrate

# Or do both in one command
pnpm setup
```

That's it! 🎉

## 📋 Available Commands

### Development Workflow

```bash
# Generate schemas and migrations
pnpm make                   # TypeScript → JSON → Drizzle → SQL

# Apply migrations to database
pnpm migrate                # Runs all .sql files in src/migrations/

# Complete setup (generate + migrate)
pnpm setup                  # make + migrate
```

### Database Management

```bash
# Fresh database (⚠️ deletes all data)
pnpm migrate:fresh          # Down, up, migrate

# Alternative
pnpm db:reset               # Same as migrate:fresh

# Interactive database viewer
pnpm drizzle:studio         # Opens Drizzle Studio
```

### Development

```bash
# Type checking
pnpm type-check

# Watch mode
pnpm dev
```

## 🔄 How It Works

### The Complete Pipeline

```
1. TypeScript Models (@codex7/shared)
   └─> src/models/library.ts
   └─> src/models/version.ts
   └─> src/models/document.ts

2. JSON Schemas (pnpm json:schema in @codex7/shared)
   └─> src/models/json/library.json
   └─> src/models/json/version.json
   └─> src/models/json/document.json

3. Drizzle Tables (pnpm drizzle:schema)
   └─> src/drizzle/libraries.drizzle.ts
   └─> src/drizzle/versions.drizzle.ts
   └─> src/drizzle/documents.drizzle.ts  ← vector(1536)!

4. SQL Migrations (pnpm drizzle:generate)
   └─> src/migrations/0000_*.sql         ← CREATE TABLE
   └─> src/migrations/0001_*.sql         ← CREATE INDEX (pgvector)

5. Apply to Database (pnpm migrate)
   └─> Runs migrations in order
   └─> Tracks executed migrations
   └─> Skips already-applied migrations
```

### Migration Tracking

The `run-migrations.ts` script:
- ✅ Runs all `.sql` files in `src/migrations/` alphabetically
- ✅ Tracks executed migrations in `_drizzle_migrations` table
- ✅ Skips already-applied migrations (idempotent)
- ✅ Includes pgvector index creation automatically
- ✅ Provides clear error messages

## 📁 Directory Structure

```
packages/storage-postgres/
├── src/
│   ├── drizzle/                    # Generated Drizzle schemas
│   │   ├── libraries.drizzle.ts
│   │   ├── versions.drizzle.ts
│   │   └── documents.drizzle.ts    # ← vector(1536) column!
│   ├── migrations/                 # Generated SQL migrations
│   │   ├── 0000_*.sql              # Tables
│   │   └── 0001_*.sql              # Indexes (pgvector)
│   └── scripts/
│       ├── json-to-drizzle.ts      # JSON → Drizzle converter
│       ├── run-migrations.ts       # 🎯 Automated migration runner
│       └── enable-pgvector.ts      # Standalone pgvector enabler
├── drizzle.config.ts               # Drizzle Kit configuration
└── package.json
```

## 🎨 Why No Manual Steps?

### The Problem

Drizzle Kit doesn't support custom PostgreSQL index operators in its schema API:

```typescript
// ❌ This doesn't work in Drizzle
.using('ivfflat', table.embedding.op('vector_cosine_ops'))
```

### The Solution

We use a **hybrid approach**:

1. **Drizzle Kit generates** the base table schemas (0000_*.sql)
2. **We manually create** the vector index migration (0001_*.sql)
3. **run-migrations.ts executes** all SQL files automatically

This gives us:
- ✅ Type-safe Drizzle schemas
- ✅ Automated pgvector index creation
- ✅ Migration tracking
- ✅ No manual database commands

## 🔧 Configuration

### Environment Variables

Create `.env` in this directory:

```env
# PostgreSQL Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=codex7

# Or use connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codex7
```

### Database Setup

#### Option 1: Local Docker Compose (Recommended for Development)

**We now have a local Docker Compose setup** in this package directory:

```bash
# Start both dev and test databases
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f postgres

# Stop services
docker compose down

# Fresh start (⚠️ deletes all data)
docker compose down -v && docker compose up -d
```

**Services included:**
- 🐘 **postgres** - Dev database on port 5432
- 🧪 **postgres-test** - Test database on port 5433 (ephemeral)
- 🎨 **pgadmin** - Web UI on port 5050 (optional, use `--profile tools`)

**Configuration:**
- Dev DB: `codex7_dev` / `codex7` / `codex7_dev_password`
- Test DB: `codex7_test` / `codex7_test` / `codex7_test_password`
- See `.env.example` for complete configuration

#### Option 2: Shared Docker Setup

```bash
# Start PostgreSQL + pgvector (from project root)
cd deployments/docker
docker compose up -d

# Or from this directory
docker compose -f ../../deployments/docker/docker-compose.yml up -d
```

## 📊 Database Schema

### Tables

**libraries** - Library/project metadata
- `id` (text, PK)
- `org`, `project`, `name`, `identifier`
- `repositoryUrl`, `homepageUrl`, `description`
- `trustScore`, `metadata`
- `created`, `updated`

**versions** - Library version tracking
- `id` (text, PK)
- `libraryId`, `versionString`, `versionNormalized`
- `gitCommitSha`, `releaseDate`
- `isLatest`, `isDeprecated`, `documentCount`
- `indexed`, `updated`

**documents** - Documentation chunks with embeddings
- `id` (text, PK)
- `versionId`, `title`, `content`, `contentHash`
- `embedding` **vector(1536)** ← OpenAI embeddings!
- `chunkIndex`, `hierarchy`, `sourceUrl`, `sourcePath`
- `language`, `hasCode`, `codeLanguage`
- `indexed`, `updated`

### Indexes

```sql
-- Primary keys
documents_pkey (id)
libraries_pkey (id)
versions_pkey (id)

-- pgvector similarity search
documents_embedding_idx (embedding vector_cosine_ops)
  USING ivfflat WITH (lists = 274)
```

## 🐛 Troubleshooting

### Migration fails with "connection refused"

```bash
# Check if PostgreSQL is running
docker compose -f ../../deployments/docker/docker-compose.yml ps

# View logs
docker compose -f ../../deployments/docker/docker-compose.yml logs postgres
```

### "pgvector extension not found"

The Docker init script enables it automatically, but if needed:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Want to start fresh?

```bash
# Reset database completely
pnpm db:reset

# This will:
# 1. Stop and remove database volumes
# 2. Start fresh database
# 3. Run all migrations
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests (unit + integration)
pnpm test

# Watch mode
pnpm test:watch

# Coverage report
pnpm test:coverage
```

### Integration Tests

Integration tests run against the **real test database** (port 5433):

```bash
# Start test database
docker compose up -d postgres-test

# Run migrations on test DB
export DATABASE_URL="postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test"
pnpm migrate

# Run integration tests
export TEST_DATABASE_URL="postgresql://codex7_test:codex7_test_password@localhost:5433/codex7_test"
pnpm test
```

**Integration tests verify:**
- ✅ Connection to real PostgreSQL database
- ✅ pgvector extension loaded correctly
- ✅ Vector similarity search with actual embeddings
- ✅ CRUD operations on all tables
- ✅ Migration tracking and execution

### Verify pgvector

```bash
# Check extension is installed
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\dx vector"

# Verify vector index exists
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\di documents_embedding_idx"

# Check embedding column type
docker exec codex7-postgres-dev psql -U codex7 -d codex7_dev -c "\d documents" | grep embedding
```

Expected output:
```
 embedding    | vector(1536) |           |          |
    "documents_embedding_idx" ivfflat (embedding vector_cosine_ops) WITH (lists='274')
```

## 🎯 Next Steps

After running migrations, you can:

1. **View your database**: `pnpm drizzle:studio`
2. **Build storage adapter**: Implement DocumentStore interface
3. **Create indexer service**: Populate the database
4. **Integrate LlamaIndex.TS**: For document chunking
5. **Run integration tests**: Verify everything works end-to-end

---

**Made with 💜 by Jenova Marie**

*No manual database commands required - just `pnpm setup`!* ✨
