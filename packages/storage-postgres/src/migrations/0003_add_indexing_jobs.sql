-- Create indexing_jobs table for tracking document processing jobs
CREATE TABLE "indexing_jobs" (
	"id" text PRIMARY KEY DEFAULT '' NOT NULL,
	"libraryId" text DEFAULT '' NOT NULL,
	"versionId" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"totalDocuments" integer,
	"processedDocuments" integer DEFAULT 0 NOT NULL,
	"failedDocuments" integer DEFAULT 0 NOT NULL,
	"error" text,
	"startedAt" integer DEFAULT 0 NOT NULL,
	"completedAt" integer,
	"metadata" text DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
-- Index on status for querying pending/processing jobs
CREATE INDEX IF NOT EXISTS indexing_jobs_status_idx ON indexing_jobs (status);
--> statement-breakpoint
-- Index on versionId for looking up jobs by version
CREATE INDEX IF NOT EXISTS indexing_jobs_version_idx ON indexing_jobs ("versionId");
--> statement-breakpoint
-- Index on startedAt for sorting by recency
CREATE INDEX IF NOT EXISTS indexing_jobs_started_idx ON indexing_jobs ("startedAt" DESC);
