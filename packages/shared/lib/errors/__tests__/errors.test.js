/**
 * 🧪 Tests for Codex7 Error Classes
 */
import { describe, it, expect } from 'vitest';
import { Codex7Error, toErrResult, LibraryNotFoundError, DocumentNotFoundError, DatabaseQueryError, StorageConnectionError, ValidationError, MissingParameterError, InvalidFormatError, } from '../index.js';
describe('Codex7Error', () => {
    it('should create base error with correct properties', () => {
        class TestError extends Codex7Error {
            constructor() {
                super('Test message', 'TEST_ERROR', 400, { foo: 'bar' });
            }
        }
        const error = new TestError();
        expect(error.message).toBe('Test message');
        expect(error.code).toBe('TEST_ERROR');
        expect(error.statusCode).toBe(400);
        expect(error.context).toEqual({ foo: 'bar' });
        expect(error.name).toBe('TestError');
    });
    it('should serialize to JSON correctly', () => {
        const error = new LibraryNotFoundError('test-id');
        const json = error.toJSON();
        expect(json.name).toBe('LibraryNotFoundError');
        expect(json.message).toContain('test-id');
        expect(json.code).toBe('LIBRARY_NOT_FOUND');
        expect(json.statusCode).toBe(404);
        expect(json.stack).toBeTruthy();
    });
    it('should capture stack trace', () => {
        const error = new LibraryNotFoundError('test-id');
        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('LibraryNotFoundError');
    });
    it('should default to 500 status code', () => {
        class TestError extends Codex7Error {
            constructor() {
                super('Test message', 'TEST_ERROR');
            }
        }
        const error = new TestError();
        expect(error.statusCode).toBe(500);
    });
    it('should convert to Err Result', () => {
        const error = new LibraryNotFoundError('test-id');
        const result = toErrResult(error);
        expect(result.ok).toBe(false);
        if (result.ok === false) {
            expect(result.error).toBe(error);
        }
    });
});
describe('LibraryNotFoundError', () => {
    it('should include library ID in context', () => {
        const error = new LibraryNotFoundError('react-123');
        expect(error.message).toContain('react-123');
        expect(error.context).toEqual({ libraryId: 'react-123' });
        expect(error.statusCode).toBe(404);
        expect(error.code).toBe('LIBRARY_NOT_FOUND');
    });
});
describe('DocumentNotFoundError', () => {
    it('should include document ID in context', () => {
        const error = new DocumentNotFoundError('doc-456');
        expect(error.message).toContain('doc-456');
        expect(error.context).toEqual({ documentId: 'doc-456' });
        expect(error.statusCode).toBe(404);
    });
});
describe('DatabaseQueryError', () => {
    it('should include query and original error', () => {
        const originalError = new Error('Connection timeout');
        const query = 'SELECT * FROM libraries';
        const error = new DatabaseQueryError(query, originalError);
        expect(error.message).toContain('Connection timeout');
        expect(error.context).toEqual({
            query,
            originalError: 'Connection timeout',
        });
        expect(error.statusCode).toBe(500);
    });
});
describe('StorageConnectionError', () => {
    it('should include connection details', () => {
        const error = new StorageConnectionError('Connection refused');
        expect(error.message).toContain('Connection refused');
        expect(error.context).toEqual({ details: 'Connection refused' });
        expect(error.statusCode).toBe(503);
    });
});
describe('ValidationError', () => {
    it('should include field and reason in context', () => {
        const error = new ValidationError('email', 'Invalid format');
        expect(error.message).toContain('email');
        expect(error.message).toContain('Invalid format');
        expect(error.context).toEqual({ field: 'email', reason: 'Invalid format' });
        expect(error.statusCode).toBe(400);
    });
});
describe('MissingParameterError', () => {
    it('should include parameter name in context', () => {
        const error = new MissingParameterError('libraryId');
        expect(error.message).toContain('libraryId');
        expect(error.context).toEqual({ parameter: 'libraryId' });
        expect(error.statusCode).toBe(400);
    });
});
describe('InvalidFormatError', () => {
    it('should include field, expected, and received in context', () => {
        const error = new InvalidFormatError('url', 'https://...', 'not-a-url');
        expect(error.message).toContain('url');
        expect(error.message).toContain('https://...');
        expect(error.message).toContain('not-a-url');
        expect(error.context).toEqual({
            field: 'url',
            expected: 'https://...',
            received: 'not-a-url',
        });
        expect(error.statusCode).toBe(400);
    });
});
//# sourceMappingURL=errors.test.js.map