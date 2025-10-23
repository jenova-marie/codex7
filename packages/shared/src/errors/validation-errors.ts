/**
 * ✅ Validation-Related Errors
 *
 * Errors for input validation failures
 *
 * @module @codex7/shared/errors
 */

import { Codex7Error } from './base.js';

/**
 * Thrown when input validation fails
 */
export class ValidationError extends Codex7Error {
  constructor(field: string, reason: string) {
    super(
      `Validation failed for field '${field}': ${reason}`,
      'VALIDATION_ERROR',
      400,
      { field, reason }
    );
  }
}

/**
 * Thrown when a required parameter is missing
 */
export class MissingParameterError extends Codex7Error {
  constructor(parameter: string) {
    super(
      `Missing required parameter: ${parameter}`,
      'MISSING_PARAMETER',
      400,
      { parameter }
    );
  }
}

/**
 * Thrown when a parameter has an invalid format
 */
export class InvalidFormatError extends Codex7Error {
  constructor(field: string, expected: string, received: string) {
    super(
      `Invalid format for '${field}': expected ${expected}, received ${received}`,
      'INVALID_FORMAT',
      400,
      { field, expected, received }
    );
  }
}

/**
 * Thrown when a value is out of acceptable range
 */
export class OutOfRangeError extends Codex7Error {
  constructor(field: string, value: number, min?: number, max?: number) {
    const rangeStr = min !== undefined && max !== undefined
      ? `between ${min} and ${max}`
      : min !== undefined
      ? `at least ${min}`
      : max !== undefined
      ? `at most ${max}`
      : 'acceptable range';

    super(
      `Value for '${field}' (${value}) is out of range: must be ${rangeStr}`,
      'OUT_OF_RANGE',
      400,
      { field, value, min, max }
    );
  }
}

/**
 * Thrown when a library identifier format is invalid
 */
export class InvalidLibraryIdError extends Codex7Error {
  constructor(identifier: string) {
    super(
      `Invalid library identifier format: ${identifier}. Expected format: /org/project or /org/project/version`,
      'INVALID_LIBRARY_ID',
      400,
      { identifier, expectedFormat: '/org/project or /org/project/version' }
    );
  }
}
