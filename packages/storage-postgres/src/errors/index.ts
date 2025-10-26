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
