/**
 * 🔒 Base Error Classes for Codex7
 *
 * Following the error-as-values pattern from ERROR_HANDLING.md
 * Uses plain objects (not Error classes) for perfect JSON serialization
 *
 * @module @codex7/shared/errors
 */
import { type Result } from '@jenova-marie/ts-rust-result';
/**
 * Base error class for all Codex7 errors.
 *
 * Provides structured error information that can be serialized
 * and logged consistently across all services.
 *
 * NOTE: This is a traditional Error class for Phase 0 framework setup.
 * In Phase 1, we'll migrate to plain objects following ERROR_HANDLING.md
 */
export declare abstract class Codex7Error extends Error {
    /**
     * Machine-readable error code (e.g., "LIBRARY_NOT_FOUND")
     */
    readonly code: string;
    /**
     * HTTP status code (if applicable)
     */
    readonly statusCode: number;
    /**
     * Additional context data
     */
    readonly context?: Record<string, unknown>;
    constructor(message: string, code: string, statusCode?: number, context?: Record<string, unknown>);
    /**
     * Convert error to JSON-serializable format for logging/API responses
     */
    toJSON(): Record<string, unknown>;
}
/**
 * Helper to create an Err Result from a Codex7Error
 *
 * @param error - The error to wrap
 * @returns Err Result containing the error
 */
export declare function toErrResult<T>(error: Codex7Error): Result<T, Codex7Error>;
