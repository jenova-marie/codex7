# 🐳 Codex7 Docker Development Environment

PostgreSQL 16 + pgvector local development stack for Codex7.

## 🚀 Quick Start

```bash
# From this directory (deployments/docker/)
docker compose up -d

# Or from project root
docker compose -f deployments/docker/docker-compose.yml up -d
```

## 📦 Services

### PostgreSQL + pgvector
- **Image**: `pgvector/pgvector:pg16`
- **Port**: `5432` (configurable via `POSTGRES_PORT`)
- **Database**: `codex7`
- **User**: `postgres`
- **Password**: `postgres`

### pgAdmin (Optional)
Enable with the `admin` profile:

```bash
docker compose --profile admin up -d
```

Access at: http://localhost:5050
- **Email**: `admin@codex7.local`
- **Password**: `admin`

## ⚙️ Configuration

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

Key settings:
- `POSTGRES_USER` - Database user
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name
- `POSTGRES_PORT` - Host port mapping
- `POSTGRES_SHARED_BUFFERS` - Memory for database cache
- `POSTGRES_MAINTENANCE_WORK_MEM` - Memory for vector indexing

## 🔧 Common Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f postgres

# Stop services
docker compose down

# Stop and remove volumes (⚠️ deletes all data)
docker compose down -v

# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d codex7

# Run SQL file
docker compose exec -T postgres psql -U postgres -d codex7 < script.sql
```

## 🧪 Verify Installation

```bash
# Check pgvector is enabled
docker compose exec postgres psql -U postgres -d codex7 -c "SELECT extversion FROM pg_extension WHERE extname = 'vector';"

# Test vector operations
docker compose exec postgres psql -U postgres -d codex7 -c "SELECT '[1,2,3]'::vector <=> '[4,5,6]'::vector AS distance;"
```

## 📊 Performance Tuning

For production workloads, adjust memory settings in `.env`:

**For 4GB RAM system** (t3.medium):
```env
POSTGRES_SHARED_BUFFERS=1GB
POSTGRES_WORK_MEM=32MB
POSTGRES_MAINTENANCE_WORK_MEM=512MB
```

**For 8GB RAM system**:
```env
POSTGRES_SHARED_BUFFERS=2GB
POSTGRES_WORK_MEM=64MB
POSTGRES_MAINTENANCE_WORK_MEM=1GB
```

## 🔗 Connection String

```
postgresql://postgres:postgres@localhost:5432/codex7
```

Or set in your `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/codex7
```

## 📁 Directory Structure

```
deployments/
├── docker/
│   ├── docker-compose.yml    # Docker Compose configuration
│   ├── .env.example           # Environment variables template
│   └── README.md              # This file
└── postgres/
    └── init/
        └── 01-enable-pgvector.sql  # Initialization script
```

## 🎯 Running Migrations

From `packages/storage-postgres`:

```bash
# Enable pgvector (if not using Docker init script)
pnpm pgvector:enable

# Generate migrations from Drizzle schemas
pnpm drizzle:generate

# Apply migrations to database
pnpm drizzle:push
```

## 🐛 Troubleshooting

### Connection refused
Ensure the container is running:
```bash
docker compose ps
docker compose logs postgres
```

### pgvector not found
Check the initialization script ran:
```bash
docker compose logs postgres | grep pgvector
```

Force recreation:
```bash
docker compose down -v
docker compose up -d
```

### Out of memory during indexing
Increase `POSTGRES_MAINTENANCE_WORK_MEM` in `.env` and restart:
```bash
docker compose restart postgres
```

---

**Made with 💜 by Jenova Marie**
