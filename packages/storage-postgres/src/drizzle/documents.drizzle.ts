/**
 * Codex7 - PostgreSQL Storage Adapter
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { pgTable, text, integer, boolean, json, vector } from 'drizzle-orm/pg-core';

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
