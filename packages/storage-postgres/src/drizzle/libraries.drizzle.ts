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

import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const libraries = pgTable('libraries', {
  created: integer('created').notNull().default(0),
  description: text('description').notNull().default(''),
  homepageUrl: text('homepageUrl').notNull().default(''),
  id: text('id').notNull().primaryKey().default(''),
  identifier: text('identifier').notNull().default(''),
  metadata: text('metadata').notNull(),
  name: text('name').notNull().default(''),
  org: text('org').notNull().default(''),
  project: text('project').notNull().default(''),
  repositoryUrl: text('repositoryUrl').notNull().default(''),
  trustScore: integer('trustScore').notNull().default(5),
  updated: integer('updated').notNull().default(0),
});
