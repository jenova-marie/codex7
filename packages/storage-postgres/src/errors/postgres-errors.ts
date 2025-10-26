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
 * 🐘 PostgreSQL Storage Adapter Errors
 *
 * Domain-specific error types for the PostgreSQL storage adapter
 */

import { error } from '@jenova-marie/ts-rust-result/errors';
import type { DomainError } from '@jenova-marie/ts-rust-result/errors';

// ===== Error Type Union =====

export type PostgresError =
  | PostgresConnectionError
  | PostgresQueryError
  | PgVectorNotInstalledError
  | MigrationError
  | NotImplementedError
  | StorageErrorType;

// ===== Error Interfaces =====

/**
 * Thrown when PostgreSQL connection fails
 */
export interface PostgresConnectionError extends DomainError {
  kind: 'PostgresConnectionError';
  context: {
    details: string;
    host?: string;
    database?: string;
  };
}

/**
 * Thrown when a PostgreSQL query fails
 */
export interface PostgresQueryError extends DomainError {
  kind: 'PostgresQueryError';
  context: {
    query: string;
    sqlState?: string;
    table?: string;
  };
}

/**
 * Thrown when pgvector extension is not available
 */
export interface PgVectorNotInstalledError extends DomainError {
  kind: 'PgVectorNotInstalledError';
  context: Record<string, never>;
}

/**
 * Thrown when migration fails
 */
export interface MigrationError extends DomainError {
  kind: 'MigrationError';
  context: {
    migrationName: string;
  };
}

/**
 * Thrown when a method is not yet implemented (Phase 0 stubs)
 */
export interface NotImplementedError extends DomainError {
  kind: 'NotImplementedError';
  context: {
    method: string;
    phase: string;
  };
}

/**
 * General storage operation error
 */
export interface StorageErrorType extends DomainError {
  kind: 'StorageError';
  context: {
    operation: string;
    details?: string;
  };
}

// ===== Error Factory Functions =====

/**
 * Create a PostgreSQL connection error
 */
export function postgresConnectionFailed(
  details: string,
  host?: string,
  database?: string,
  cause?: unknown
): PostgresConnectionError {
  return error('PostgresConnectionError')
    .withMessage(`PostgreSQL connection failed: ${details}`)
    .withContext({ details, host, database })
    .withCause(cause)
    .captureStack()
    .build() as PostgresConnectionError;
}

/**
 * Create a PostgreSQL query error
 */
export function postgresQueryFailed(
  query: string,
  cause?: unknown,
  sqlState?: string,
  table?: string
): PostgresQueryError {
  return error('PostgresQueryError')
    .withMessage(`PostgreSQL query failed: ${(cause as Error)?.message || 'Unknown error'}`)
    .withContext({
      query: query.substring(0, 200), // Truncate for logging
      sqlState,
      table,
    })
    .withCause(cause)
    .captureStack()
    .build() as PostgresQueryError;
}

/**
 * Create a pgvector not installed error
 */
export function pgVectorNotInstalled(): PgVectorNotInstalledError {
  return error('PgVectorNotInstalledError')
    .withMessage(
      'pgvector extension is not installed. Run: CREATE EXTENSION vector;'
    )
    .withContext({})
    .build() as PgVectorNotInstalledError;
}

/**
 * Create a migration error
 */
export function migrationFailed(
  migrationName: string,
  cause?: unknown
): MigrationError {
  return error('MigrationError')
    .withMessage(`Migration failed: ${migrationName}`)
    .withContext({ migrationName })
    .withCause(cause)
    .captureStack()
    .build() as MigrationError;
}

/**
 * Create a not implemented error for Phase 0 stubs
 */
export function notImplemented(
  method: string,
  phase: string = 'Phase 1'
): NotImplementedError {
  return error('NotImplementedError')
    .withMessage(`Not implemented: ${method} - Coming in ${phase}`)
    .withContext({ method, phase })
    .build() as NotImplementedError;
}

/**
 * Create a general storage error
 */
export class StorageError extends Error {
  constructor(public operation: string, public details: string) {
    super(`Storage operation failed: ${operation} - ${details}`);
    this.name = 'StorageError';
  }
}
