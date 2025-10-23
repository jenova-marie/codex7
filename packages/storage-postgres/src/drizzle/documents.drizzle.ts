import { pgTable, text, integer, boolean, varchar, json, timestamp, date, uuid, decimal, bigint, index, vector } from 'drizzle-orm/pg-core';

export const documents = pgTable('documents', {
  chunkIndex: integer('chunkIndex').notNull().default(0),
  codeLanguage: text('codeLanguage').notNull().default(''),
  content: text('content').notNull().default(''),
  contentHash: text('contentHash').notNull().default(''),
  embedding: vector('embedding', { dimensions: 1536 }),
  hasCode: boolean('hasCode').notNull().default(false),
  hierarchy: json('hierarchy').notNull(),
  id: text('id').notNull().primaryKey().default(''),
  indexed: integer('indexed').notNull().default(0),
  language: text('language').notNull().default('en'),
  metadata: text('metadata').notNull(),
  sourcePath: text('sourcePath').notNull().default(''),
  sourceType: text('sourceType').notNull().default('github'),
  sourceUrl: text('sourceUrl').notNull().default(''),
  title: text('title').notNull().default(''),
  updated: integer('updated').notNull().default(0),
  versionId: text('versionId').notNull().default(''),
});


// NOTE: Vector index must be created manually in a migration SQL file
// Add this to your migration:
//
// CREATE INDEX documents_embedding_idx ON documents
//   USING ivfflat (embedding vector_cosine_ops)
//   WITH (lists = 274);
//
// Where lists = sqrt(row_count) ≈ 274 for ~75k documents
