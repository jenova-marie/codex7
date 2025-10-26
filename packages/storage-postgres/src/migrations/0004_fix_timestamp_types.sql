-- Fix timestamp columns to use bigint instead of integer
-- JavaScript Date.now() returns milliseconds (> 1.7 trillion) which exceeds 32-bit integer max (2.1 billion)

-- Libraries table
ALTER TABLE libraries
  ALTER COLUMN created TYPE bigint,
  ALTER COLUMN updated TYPE bigint;

-- Versions table
ALTER TABLE versions
  ALTER COLUMN indexed TYPE bigint,
  ALTER COLUMN "releaseDate" TYPE bigint,
  ALTER COLUMN updated TYPE bigint;

-- Documents table
ALTER TABLE documents
  ALTER COLUMN indexed TYPE bigint,
  ALTER COLUMN updated TYPE bigint;

-- Indexing jobs table
ALTER TABLE indexing_jobs
  ALTER COLUMN "startedAt" TYPE bigint,
  ALTER COLUMN "completedAt" TYPE bigint;
