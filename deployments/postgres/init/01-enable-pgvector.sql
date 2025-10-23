-- 🎯 Enable pgvector extension
-- This script runs automatically on first container startup

-- Enable pgvector extension (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
DO $$
DECLARE
    v_version text;
BEGIN
    SELECT extversion INTO v_version
    FROM pg_extension
    WHERE extname = 'vector';
    
    IF v_version IS NOT NULL THEN
        RAISE NOTICE '✅ pgvector extension enabled successfully (version: %)', v_version;
    ELSE
        RAISE WARNING '⚠️  pgvector extension not found';
    END IF;
END $$;

-- Create a test table to verify vector operations work
CREATE TABLE IF NOT EXISTS _pgvector_test (
    id serial PRIMARY KEY,
    embedding vector(3)
);

-- Insert test data
INSERT INTO _pgvector_test (embedding) VALUES 
    ('[1,2,3]'),
    ('[4,5,6]'),
    ('[7,8,9]');

-- Test cosine similarity
DO $$
DECLARE
    v_similarity float;
BEGIN
    SELECT 1 - (embedding <=> '[1,2,3]') INTO v_similarity
    FROM _pgvector_test
    WHERE id = 1;
    
    RAISE NOTICE '✅ pgvector cosine similarity test passed (similarity: %)', v_similarity;
END $$;

-- Clean up test table
DROP TABLE _pgvector_test;

-- Log success
DO $$
BEGIN
    RAISE NOTICE '🎉 PostgreSQL + pgvector is ready for Codex7!';
END $$;
