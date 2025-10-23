CREATE TABLE "documents" (
	"chunkIndex" integer DEFAULT 0 NOT NULL,
	"codeLanguage" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"contentHash" text DEFAULT '' NOT NULL,
	"embedding" vector(1536),
	"hasCode" boolean DEFAULT false NOT NULL,
	"hierarchy" json NOT NULL,
	"id" text PRIMARY KEY DEFAULT '' NOT NULL,
	"indexed" integer DEFAULT 0 NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"metadata" text NOT NULL,
	"sourcePath" text DEFAULT '' NOT NULL,
	"sourceType" text DEFAULT 'github' NOT NULL,
	"sourceUrl" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL,
	"versionId" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "libraries" (
	"created" integer DEFAULT 0 NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"homepageUrl" text DEFAULT '' NOT NULL,
	"id" text PRIMARY KEY DEFAULT '' NOT NULL,
	"identifier" text DEFAULT '' NOT NULL,
	"metadata" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"org" text DEFAULT '' NOT NULL,
	"project" text DEFAULT '' NOT NULL,
	"repositoryUrl" text DEFAULT '' NOT NULL,
	"trustScore" integer DEFAULT 5 NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"documentCount" integer DEFAULT 0 NOT NULL,
	"gitCommitSha" text DEFAULT '' NOT NULL,
	"id" text PRIMARY KEY DEFAULT '' NOT NULL,
	"indexed" integer DEFAULT 0 NOT NULL,
	"isDeprecated" boolean DEFAULT false NOT NULL,
	"isLatest" boolean DEFAULT false NOT NULL,
	"libraryId" text DEFAULT '' NOT NULL,
	"metadata" text NOT NULL,
	"releaseDate" integer DEFAULT 0 NOT NULL,
	"updated" integer DEFAULT 0 NOT NULL,
	"versionNormalized" text DEFAULT '' NOT NULL,
	"versionString" text DEFAULT '' NOT NULL
);
