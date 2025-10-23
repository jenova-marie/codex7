/**
 * 🧪 Tests for Result Helper Utilities
 */
import { describe, it, expect } from 'vitest';
import { wrapPromise, combineResults, mapResults, tryAsync, trySync, } from '../result-helpers.js';
import { ValidationError, DatabaseQueryError } from '../../errors/index.js';
describe('wrapPromise', () => {
    it('should wrap successful promise in Ok', async () => {
        const promise = Promise.resolve(42);
        const result = await wrapPromise(promise, (e) => new ValidationError('test', String(e)));
        expect(result.isOk()).toBe(true);
        expect(result.value).toBe(42);
    });
    it('should wrap rejected promise in Err', async () => {
        const promise = Promise.reject(new Error('Failed'));
        const result = await wrapPromise(promise, (e) => new ValidationError('test', e instanceof Error ? e.message : String(e)));
        expect(result.isErr()).toBe(true);
        expect(result.error).toBeInstanceOf(ValidationError);
        expect(result.error.message).toContain('Failed');
    });
    it('should map error correctly', async () => {
        const promise = Promise.reject(new Error('Network error'));
        const result = await wrapPromise(promise, (e) => new DatabaseQueryError('SELECT *', e));
        expect(result.isErr()).toBe(true);
        expect(result.error).toBeInstanceOf(DatabaseQueryError);
        expect(result.error.context?.query).toBe('SELECT *');
    });
});
describe('combineResults', () => {
    it('should combine all Ok results', () => {
        const results = [Ok(1), Ok(2), Ok(3)];
        const combined = combineResults(results);
        expect(combined.isOk()).toBe(true);
        expect(combined.value).toEqual([1, 2, 3]);
    });
    it('should return first Err if any Result is Err', () => {
        const error = new ValidationError('test', 'error');
        const results = [Ok(1), Err(error), Ok(3)];
        const combined = combineResults(results);
        expect(combined.isErr()).toBe(true);
        expect(combined.error).toBe(error);
    });
    it('should handle empty array', () => {
        const results = [];
        const combined = combineResults(results);
        expect(combined.isOk()).toBe(true);
        expect(combined.value).toEqual([]);
    });
    it('should stop at first error', () => {
        const error1 = new ValidationError('field1', 'error1');
        const error2 = new ValidationError('field2', 'error2');
        const results = [Ok(1), Err(error1), Err(error2)];
        const combined = combineResults(results);
        expect(combined.isErr()).toBe(true);
        expect(combined.error).toBe(error1); // First error
    });
});
describe('mapResults', () => {
    it('should map over array successfully', async () => {
        const numbers = [1, 2, 3];
        const result = await mapResults(numbers, async (n) => {
            return Ok(n * 2);
        });
        expect(result.isOk()).toBe(true);
        expect(result.value).toEqual([2, 4, 6]);
    });
    it('should return first error', async () => {
        const numbers = [1, 2, 3];
        const error = new ValidationError('test', 'error');
        const result = await mapResults(numbers, async (n) => {
            if (n === 2)
                return Err(error);
            return Ok(n * 2);
        });
        expect(result.isErr()).toBe(true);
        expect(result.error).toBe(error);
    });
    it('should handle empty array', async () => {
        const result = await mapResults([], async (n) => Ok(n));
        expect(result.isOk()).toBe(true);
        expect(result.value).toEqual([]);
    });
    it('should pass index to mapper function', async () => {
        const items = ['a', 'b', 'c'];
        const result = await mapResults(items, async (item, index) => {
            return Ok(`${item}${index}`);
        });
        expect(result.isOk()).toBe(true);
        expect(result.value).toEqual(['a0', 'b1', 'c2']);
    });
});
describe('tryAsync', () => {
    it('should wrap successful async function', async () => {
        const result = await tryAsync(async () => 42, (e) => new ValidationError('test', String(e)));
        expect(result.isOk()).toBe(true);
        expect(result.value).toBe(42);
    });
    it('should wrap rejected async function', async () => {
        const result = await tryAsync(async () => {
            throw new Error('Failed');
        }, (e) => new ValidationError('test', e instanceof Error ? e.message : String(e)));
        expect(result.isErr()).toBe(true);
        expect(result.error.message).toContain('Failed');
    });
    it('should handle JSON.parse errors', async () => {
        const result = await tryAsync(async () => JSON.parse('invalid json'), (e) => new ValidationError('json', e instanceof Error ? e.message : String(e)));
        expect(result.isErr()).toBe(true);
        expect(result.error).toBeInstanceOf(ValidationError);
    });
});
describe('trySync', () => {
    it('should wrap successful sync function', () => {
        const result = trySync(() => 42, (e) => new ValidationError('test', String(e)));
        expect(result.isOk()).toBe(true);
        expect(result.value).toBe(42);
    });
    it('should wrap throwing sync function', () => {
        const result = trySync(() => {
            throw new Error('Failed');
        }, (e) => new ValidationError('test', e instanceof Error ? e.message : String(e)));
        expect(result.isErr()).toBe(true);
        expect(result.error.message).toContain('Failed');
    });
    it('should handle JSON.parse errors', () => {
        const result = trySync(() => JSON.parse('invalid json'), (e) => new ValidationError('json', e instanceof Error ? e.message : String(e)));
        expect(result.isErr()).toBe(true);
        expect(result.error).toBeInstanceOf(ValidationError);
    });
    it('should handle division by zero', () => {
        const result = trySync(() => {
            const a = 1;
            const b = 0;
            if (b === 0)
                throw new Error('Division by zero');
            return a / b;
        }, (e) => new ValidationError('math', e instanceof Error ? e.message : String(e)));
        expect(result.isErr()).toBe(true);
        expect(result.error.message).toContain('Division by zero');
    });
});
//# sourceMappingURL=result-helpers.test.js.map