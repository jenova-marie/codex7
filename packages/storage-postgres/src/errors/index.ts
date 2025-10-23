/**
 * 🔥 PostgreSQL Storage Errors
 *
 * Domain-specific Result type and error exports
 */

import { ok as tsOk, err as tsErr, type Result as TsResult } from '@jenova-marie/ts-rust-result';
import type { PostgresError } from './postgres-errors.js';

// Create domain-specific ok/err helpers
export function ok<T>(value: T): TsResult<T, PostgresError> {
  return tsOk(value) as TsResult<T, PostgresError>;
}

export function err(error: PostgresError): TsResult<never, PostgresError> {
  return tsErr(error) as TsResult<never, PostgresError>;
}

// Export type alias for convenience
export type PostgresResult<T> = TsResult<T, PostgresError>;

// Export all error types and factories
export * from './postgres-errors.js';
