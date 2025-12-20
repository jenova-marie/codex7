CREATE TABLE "local_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"library_id" text NOT NULL,
	"path" text NOT NULL,
	"title" text,
	"content" text NOT NULL,
	"tokens" integer DEFAULT 0,
	"source_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_libraries" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"branch" text DEFAULT 'main',
	"source_path" text NOT NULL,
	"package_name" text,
	"version" text,
	"keywords" text[],
	"rules" text[],
	"total_tokens" integer DEFAULT 0,
	"total_snippets" integer DEFAULT 0,
	"total_pages" integer DEFAULT 0,
	"trust_score" real DEFAULT 10,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_snippets" (
	"id" text PRIMARY KEY NOT NULL,
	"library_id" text NOT NULL,
	"title" text NOT NULL,
	"source_file" text NOT NULL,
	"source_type" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"code_blocks" jsonb,
	"tokens" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "local_documents" ADD CONSTRAINT "local_documents_library_id_local_libraries_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."local_libraries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_snippets" ADD CONSTRAINT "local_snippets_library_id_local_libraries_id_fk" FOREIGN KEY ("library_id") REFERENCES "public"."local_libraries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_documents_library" ON "local_documents" USING btree ("library_id");--> statement-breakpoint
CREATE INDEX "idx_snippets_library" ON "local_snippets" USING btree ("library_id");