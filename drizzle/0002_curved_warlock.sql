ALTER TABLE "local_snippets" ADD COLUMN "quality_score" real DEFAULT 0.5;--> statement-breakpoint
ALTER TABLE "local_snippets" ADD COLUMN "has_code" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "local_snippets" ADD COLUMN "code_block_count" integer DEFAULT 0;