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
export { runMigrations } from './migrations/migration-runner.js';

// Logger
export { logger } from './utils/logger.js';
