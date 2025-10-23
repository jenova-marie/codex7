/**
 * 🧪 Tests for Validation Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateUrl,
  validateGitHubUrl,
  validateSemver,
  validateRange,
  validateNonEmpty,
  validateEmail,
  validateRequiredFields,
} from '../validation.js';

describe('validateUrl', () => {
  it('should validate correct URLs', () => {
    const result = validateUrl('https://example.com');

    expect(result.isOk()).toBe(true);
    const url = result.unwrap();
    expect(url.hostname).toBe('example.com');
  });

  it('should validate URLs with paths', () => {
    const result = validateUrl('https://example.com/path/to/resource');

    expect(result.isOk()).toBe(true);
    expect(result.unwrap().pathname).toBe('/path/to/resource');
  });

  it('should reject invalid URLs', () => {
    const result = validateUrl('not-a-url');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('Invalid URL');
  });

  it('should reject empty strings', () => {
    const result = validateUrl('');

    expect(result.isErr()).toBe(true);
  });
});

describe('validateGitHubUrl', () => {
  it('should validate GitHub URLs', () => {
    const result = validateGitHubUrl('https://github.com/vercel/next.js');

    expect(result.isOk()).toBe(true);
  });

  it('should reject non-GitHub URLs', () => {
    const result = validateGitHubUrl('https://gitlab.com/org/project');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('github.com');
  });

  it('should reject malformed GitHub URLs', () => {
    const result = validateGitHubUrl('https://github.com/invalid');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('Invalid GitHub repository URL format');
  });
});

describe('validateSemver', () => {
  it('should validate correct semantic versions', () => {
    expect(validateSemver('1.0.0').isOk()).toBe(true);
    expect(validateSemver('v1.0.0').isOk()).toBe(true);
    expect(validateSemver('1.2.3-alpha').isOk()).toBe(true);
    expect(validateSemver('2.0.0-beta.1').isOk()).toBe(true);
  });

  it('should reject invalid semantic versions', () => {
    expect(validateSemver('1.0').isErr()).toBe(true);
    expect(validateSemver('v1').isErr()).toBe(true);
    expect(validateSemver('latest').isErr()).toBe(true);
    expect(validateSemver('').isErr()).toBe(true);
  });
});

describe('validateRange', () => {
  it('should validate values within range', () => {
    expect(validateRange(5, 0, 10).isOk()).toBe(true);
    expect(validateRange(0, 0, 10).isOk()).toBe(true);
    expect(validateRange(10, 0, 10).isOk()).toBe(true);
  });

  it('should reject values outside range', () => {
    const result = validateRange(15, 0, 10);

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('outside range');
  });

  it('should reject values below minimum', () => {
    const result = validateRange(-5, 0, 10);

    expect(result.isErr()).toBe(true);
  });
});

describe('validateNonEmpty', () => {
  it('should validate non-empty strings', () => {
    expect(validateNonEmpty('hello').isOk()).toBe(true);
    expect(validateNonEmpty('a').isOk()).toBe(true);
  });

  it('should reject empty strings', () => {
    const result = validateNonEmpty('');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('cannot be empty');
  });

  it('should reject whitespace-only strings', () => {
    const result = validateNonEmpty('   ');

    expect(result.isErr()).toBe(true);
  });

  it('should use custom field name in error message', () => {
    const result = validateNonEmpty('', 'Username');

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('Username');
  });
});

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('user@example.com').isOk()).toBe(true);
    expect(validateEmail('test.user@example.co.uk').isOk()).toBe(true);
    expect(validateEmail('user+tag@example.com').isOk()).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid').isErr()).toBe(true);
    expect(validateEmail('@example.com').isErr()).toBe(true);
    expect(validateEmail('user@').isErr()).toBe(true);
    expect(validateEmail('user @example.com').isErr()).toBe(true);
    expect(validateEmail('').isErr()).toBe(true);
  });
});

describe('validateRequiredFields', () => {
  it('should validate objects with all required fields', () => {
    const obj = {
      name: 'Test',
      email: 'test@example.com',
      age: 25,
    };

    const result = validateRequiredFields(obj, ['name', 'email', 'age']);

    expect(result.isOk()).toBe(true);
  });

  it('should reject objects missing required fields', () => {
    const obj = {
      name: 'Test',
    };

    const result = validateRequiredFields(obj, ['name', 'email', 'age']);

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('email');
    expect(result.unwrapErr().message).toContain('age');
  });

  it('should reject objects with undefined required fields', () => {
    const obj = {
      name: 'Test',
      email: undefined,
    };

    const result = validateRequiredFields(obj, ['name', 'email']);

    expect(result.isErr()).toBe(true);
    expect(result.unwrapErr().message).toContain('email');
  });

  it('should accept objects with extra fields', () => {
    const obj = {
      name: 'Test',
      email: 'test@example.com',
      extra: 'value',
    };

    const result = validateRequiredFields(obj, ['name', 'email']);

    expect(result.isOk()).toBe(true);
  });
});
