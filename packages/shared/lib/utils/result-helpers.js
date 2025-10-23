/**
 * 🔧 Result Type Helper Utilities
 *
 * Utilities for working with Result types from @jenova-marie/ts-rust-result
 *
 * @module @codex7/shared/utils
 */
import { ok, err } from '@jenova-marie/ts-rust-result';
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
export async function wrapPromise(promise, errorMapper) {
    try {
        const value = await promise;
        return ok(value);
    }
    catch (error) {
        return err(errorMapper(error));
    }
}
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
export function combineResults(results) {
    const values = [];
    for (const result of results) {
        if (result.ok === false) {
            return err(result.error);
        }
        values.push(result.value);
    }
    return ok(values);
}
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
export async function mapResults(items, fn) {
    const results = [];
    for (let i = 0; i < items.length; i++) {
        const result = await fn(items[i], i);
        if (result.ok === false) {
            return err(result.error);
        }
        results.push(result.value);
    }
    return ok(results);
}
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
export async function tryAsync(fn, errorMapper) {
    return wrapPromise(fn(), errorMapper);
}
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
export function trySync(fn, errorMapper) {
    try {
        const value = fn();
        return ok(value);
    }
    catch (error) {
        return err(errorMapper(error));
    }
}
//# sourceMappingURL=result-helpers.js.map