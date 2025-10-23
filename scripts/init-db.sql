-- 🗄️ Database Initialization Script
-- Creates necessary extensions and initial setup for Codex7

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pg_trgm for text similarity search (fuzzy matching)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create custom types
DO $$ BEGIN
    CREATE TYPE source_type AS ENUM (
        'github',
        'npm',
        'pypi',
        'crates_io',
        'docs_url',
        'manual'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Set timezone
SET timezone = 'UTC';

-- Create indexes after tables are created (migrations will handle table creation)
-- This file is for extensions and global setup only

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE '✅ Database initialized successfully';
    RAISE NOTICE '📦 Extensions: vector, uuid-ossp, pg_trgm';
    RAISE NOTICE '🌍 Timezone: UTC';
END $$;
