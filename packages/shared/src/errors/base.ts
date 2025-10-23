/**
 * 🔒 Base Error Classes for Codex7
 *
 * Following the error-as-values pattern from ERROR_HANDLING.md
 * Uses plain objects (not Error classes) for perfect JSON serialization
 *
 * @module @codex7/shared/errors
 */

import { type Result, err } from '@jenova-marie/ts-rust-result';

/**
 * Base error class for all Codex7 errors.
 *
 * Provides structured error information that can be serialized
 * and logged consistently across all services.
 *
 * NOTE: This is a traditional Error class for Phase 0 framework setup.
 * In Phase 1, we'll migrate to plain objects following ERROR_HANDLING.md
 */
export abstract class Codex7Error extends Error {
  /**
   * Machine-readable error code (e.g., "LIBRARY_NOT_FOUND")
   */
  public readonly code: string;

  /**
   * HTTP status code (if applicable)
   */
  public readonly statusCode: number;

  /**
   * Additional context data
   */
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;

    // Maintains proper stack trace for where error was thrown (V8 only)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON-serializable format for logging/API responses
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack
    };
  }
}

/**
 * Helper to create an Err Result from a Codex7Error
 *
 * @param error - The error to wrap
 * @returns Err Result containing the error
 */
export function toErrResult<T>(error: Codex7Error): Result<T, Codex7Error> {
  return err(error);
}
