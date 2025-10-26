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

import { pgTable, text, integer, bigint } from 'drizzle-orm/pg-core';

/**
 * IndexingJob table schema
 *
 * Tracks document indexing jobs for library versions
 */
export const indexingJobs = pgTable('indexing_jobs', {
  id: text('id').notNull().primaryKey().default(''),
  libraryId: text('libraryId').notNull().default(''),
  versionId: text('versionId').notNull().default(''),
  status: text('status').notNull().default('pending'),
  totalDocuments: integer('totalDocuments'),
  processedDocuments: integer('processedDocuments').notNull().default(0),
  failedDocuments: integer('failedDocuments').notNull().default(0),
  error: text('error'),
  startedAt: bigint('startedAt', { mode: 'number' }).notNull().default(0),
  completedAt: bigint('completedAt', { mode: 'number' }),
  metadata: text('metadata').notNull().default('{}'),
});
