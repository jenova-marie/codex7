-- Migration: Add performance indexes
-- Description: Create indexes for fast queries and vector search

-- Libraries indexes
CREATE INDEX IF NOT EXISTS idx_libraries_identifier ON libraries(identifier);
CREATE INDEX IF NOT EXISTS idx_libraries_name ON libraries(name);

-- Versions indexes
CREATE INDEX IF NOT EXISTS idx_versions_library ON versions(library_id, version_string);
CREATE INDEX IF NOT EXISTS idx_versions_latest ON versions(library_id, is_latest) WHERE is_latest = true;

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_version ON documents(version_id);
CREATE INDEX IF NOT EXISTS idx_documents_hash ON documents(content_hash);

-- Vector similarity index (IVFFlat for approximate nearest neighbor)
-- NOTE: This will be slow on empty table, run after initial data load
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_documents_content_fts ON documents
USING GIN(to_tsvector('english', content));

-- Indexing jobs indexes
CREATE INDEX IF NOT EXISTS idx_indexing_jobs_library ON indexing_jobs(library_id);
CREATE INDEX IF NOT EXISTS idx_indexing_jobs_status ON indexing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_indexing_jobs_started_at ON indexing_jobs(started_at);
