-- Migration: Initial database schema
-- Description: Create core tables for libraries, versions, and documents

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Libraries table
CREATE TABLE IF NOT EXISTS libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  identifier VARCHAR(255) UNIQUE NOT NULL,
  repository_url TEXT,
  homepage_url TEXT,
  description TEXT,
  trust_score INTEGER DEFAULT 5 CHECK (trust_score >= 1 AND trust_score <= 10),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Versions table
CREATE TABLE IF NOT EXISTS versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  version_string VARCHAR(50) NOT NULL,
  git_commit_sha VARCHAR(40),
  release_date TIMESTAMP,
  is_latest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(library_id, version_string)
);

-- Documents table (chunks with embeddings)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id UUID NOT NULL REFERENCES versions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_hash VARCHAR(64),
  embedding vector(1536), -- OpenAI ada-002 embedding dimensions
  chunk_index INTEGER,
  parent_doc_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  url TEXT,
  source_type VARCHAR(50) NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  indexed_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexing jobs table
CREATE TABLE IF NOT EXISTS indexing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  library_id UUID NOT NULL REFERENCES libraries(id) ON DELETE CASCADE,
  version_id UUID REFERENCES versions(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  documents_processed INTEGER DEFAULT 0,
  documents_total INTEGER DEFAULT 0,
  started_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'
);

-- Migration metadata table
CREATE TABLE IF NOT EXISTS migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  version INTEGER NOT NULL,
  executed_at TIMESTAMP DEFAULT NOW(),
  execution_time_ms INTEGER
);
