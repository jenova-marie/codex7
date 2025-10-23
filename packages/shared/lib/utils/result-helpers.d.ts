/**
 * 🔧 Result Type Helper Utilities
 *
 * Utilities for working with Result types from @jenova-marie/ts-rust-result
 *
 * @module @codex7/shared/utils
 */
import { type Result } from '@jenova-marie/ts-rust-result';
import { Codex7Error } from '../errors/index.js';
/**
 * Wrap a promise in a Result type, catching any errors
 *
 * @param promise - Promise to wrap
 * @param errorMapper - Function to map caught errors to Codex7Error
 * @returns Result with success value or mapped error
 *
 * @example
 * ```typescript
 * const result = await wrapPromise(
 *   fetchData(),
 *   (err) => new DatabaseQueryError('Fetch failed', err as Error)
 * );
 * ```
 */
export declare function wrapPromise<T>(promise: Promise<T>, errorMapper: (error: unknown) => Codex7Error): Promise<Result<T, Codex7Error>>;
/**
 * Combine multiple Results into a single Result
 * Returns Ok with array of values if all succeed, Err with first error otherwise
 *
 * @param results - Array of Results to combine
 * @returns Combined Result
 *
 * @example
 * ```typescript
 * const results = [Ok(1), Ok(2), Ok(3)];
 * const combined = combineResults(results);
 * // combined = Ok([1, 2, 3])
 * ```
 */
export declare function combineResults<T>(results: Result<T, Codex7Error>[]): Result<T[], Codex7Error>;
/**
 * Map over an array with an async function that returns Results,
 * collecting all successes or returning the first error
 *
 * @param items - Array of items to map over
 * @param fn - Async function that returns a Result
 * @returns Result with array of mapped values or first error
 *
 * @example
 * ```typescript
 * const numbers = [1, 2, 3];
 * const result = await mapResults(numbers, async (n) => {
 *   return Ok(n * 2);
 * });
 * // result = Ok([2, 4, 6])
 * ```
 */
export declare function mapResults<T, U>(items: T[], fn: (item: T, index: number) => Promise<Result<U, Codex7Error>>): Promise<Result<U[], Codex7Error>>;
/**
 * Execute an async function and wrap it in a Result
 * Useful for converting throw-based APIs to Result-based APIs
 *
 * @param fn - Async function to execute
 * @param errorMapper - Function to map caught errors to Codex7Error
 * @returns Result with function return value or mapped error
 *
 * @example
 * ```typescript
 * const result = await tryAsync(
 *   async () => JSON.parse(data),
 *   (err) => new ValidationError('json', String(err))
 * );
 * ```
 */
export declare function tryAsync<T>(fn: () => Promise<T>, errorMapper: (error: unknown) => Codex7Error): Promise<Result<T, Codex7Error>>;
/**
 * Execute a synchronous function and wrap it in a Result
 * Useful for converting throw-based APIs to Result-based APIs
 *
 * @param fn - Synchronous function to execute
 * @param errorMapper - Function to map caught errors to Codex7Error
 * @returns Result with function return value or mapped error
 *
 * @example
 * ```typescript
 * const result = trySync(
 *   () => JSON.parse(data),
 *   (err) => new ValidationError('json', String(err))
 * );
 * ```
 */
export declare function trySync<T>(fn: () => T, errorMapper: (error: unknown) => Codex7Error): Result<T, Codex7Error>;
