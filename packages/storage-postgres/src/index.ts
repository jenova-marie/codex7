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

/**
 * 🐘 PostgreSQL Storage Adapter for Codex7
 *
 * PostgreSQL + pgvector implementation of the StorageAdapter interface
 *
 * @module @codex7/storage-postgres
 */

// Main adapter
export { PostgresAdapter } from './adapter.js';

// Configuration
export type { PostgresConfig } from './connection.js';
export { PostgresConnection } from './connection.js';

// Errors
export * from './errors/index.js';

// Migration runner
export { runMigrations } from './scripts/run-migrations.js';

// Logger
export { logger } from './utils/logger.js';
