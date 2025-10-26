/**
 * 🧪 Tests for Codex7 Error Types
 *
 * Phase 0: Basic error type and Result integration tests
 */

import { describe, it, expect } from 'vitest';
import { CodexError, ok, err, CodexResult } from '../index.js';

describe('CodexError Type', () => {
  it('should create error with required fields', () => {
    const error: CodexError = {
      message: 'Test error message',
      code: 'TEST_ERROR',
    };

    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('TEST_ERROR');
  });

  it('should create error with cause', () => {
    const cause = new Error('Original error');
    const error: CodexError = {
      message: 'Wrapped error',
      code: 'WRAPPED_ERROR',
      cause,
    };

    expect(error.message).toBe('Wrapped error');
    expect(error.code).toBe('WRAPPED_ERROR');
    expect(error.cause).toBe(cause);
  });

  it('should create error without code', () => {
    const error: CodexError = {
      message: 'Simple error',
    };

    expect(error.message).toBe('Simple error');
    expect(error.code).toBeUndefined();
  });
});

describe('Result Integration', () => {
  it('should create Ok Result', () => {
    const result: CodexResult<string> = ok('success');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('success');
    }
  });

  it('should create Err Result', () => {
    const error: CodexError = {
      message: 'Test error',
      code: 'TEST_ERROR',
    };
    const result: CodexResult<string> = err(error);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Test error');
      expect(result.error.code).toBe('TEST_ERROR');
    }
  });

  it('should handle chained Results', () => {
    const getUser = (): CodexResult<string> => {
      return ok('John Doe');
    };

    const result = getUser();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('John Doe');
    }
  });

  it('should handle error propagation', () => {
    const failedOperation = (): CodexResult<number> => {
      return err({
        message: 'Operation failed',
        code: 'OP_FAILED',
      });
    };

    const result = failedOperation();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe('Operation failed');
      expect(result.error.code).toBe('OP_FAILED');
    }
  });
});
