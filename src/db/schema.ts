import { pgTable, text, integer, real, timestamp, jsonb, index } from "drizzle-orm/pg-core";

/**
 * Local libraries table - stores metadata for indexed projects
 * Mirrors the Context7 SearchResult structure for compatibility
 */
export const localLibraries = pgTable("local_libraries", {
  // Library ID in /org/project format
  id: text("id").primaryKey(),
  // Human-readable title
  title: text("title").notNull(),
  // Short description
  description: text("description"),
  // Git branch the docs were generated from
  branch: text("branch").default("main"),
  // Absolute path to the source project
  sourcePath: text("source_path").notNull(),
  // Package name from package.json
  packageName: text("package_name"),
  // Version from package.json
  version: text("version"),
  // Keywords for search matching
  keywords: text("keywords").array(),
  // Approximate token count of all snippets
  totalTokens: integer("total_tokens").default(0),
  // Number of code snippets
  totalSnippets: integer("total_snippets").default(0),
  // Number of source files processed
  totalPages: integer("total_pages").default(0),
  // Trust score (default 10 for local projects - highest priority)
  trustScore: real("trust_score").default(10.0),
  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

/**
 * Code block structure stored in JSONB
 */
export interface CodeBlock {
  language: string;
  code: string;
}

/**
 * Local snippets table - individual documentation chunks
 */
export const localSnippets = pgTable(
  "local_snippets",
  {
    // Unique ID: library_id + content hash
    id: text("id").primaryKey(),
    // Reference to parent library
    libraryId: text("library_id")
      .references(() => localLibraries.id, { onDelete: "cascade" })
      .notNull(),
    // Section title/heading
    title: text("title").notNull(),
    // Relative path to source file
    sourceFile: text("source_file").notNull(),
    // Type of source: readme, api, docs, examples, content
    sourceType: text("source_type").notNull(),
    // Description text (prose before code)
    description: text("description"),
    // Full markdown content of the snippet
    content: text("content").notNull(),
    // Extracted code blocks
    codeBlocks: jsonb("code_blocks").$type<CodeBlock[]>(),
    // Approximate token count
    tokens: integer("tokens").default(0),
    // Timestamp
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("idx_snippets_library").on(table.libraryId)]
);

/**
 * Type exports for use in application code
 */
export type LocalLibrary = typeof localLibraries.$inferSelect;
export type NewLocalLibrary = typeof localLibraries.$inferInsert;
export type LocalSnippet = typeof localSnippets.$inferSelect;
export type NewLocalSnippet = typeof localSnippets.$inferInsert;
