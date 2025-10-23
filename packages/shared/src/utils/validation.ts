/**
 * ✅ Validation Utilities
 */

import { Result, ok, err } from '@jenova-marie/ts-rust-result';
import { PATTERNS } from '../constants.js';

/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns Result indicating validity
 */
export function validateUrl(url: string): Result<URL, Error> {
  try {
    const parsed = new URL(url);
    return ok(parsed);
  } catch (error) {
    return err(new Error(`Invalid URL: ${url}`));
  }
}

/**
 * Validate GitHub repository URL
 *
 * @param url - URL to validate
 * @returns Result with validation status
 */
export function validateGitHubUrl(url: string): Result<boolean, Error> {
  const urlResult = validateUrl(url);
  if (urlResult.ok === false) {
    return urlResult as Result<boolean, Error>;
  }

  const parsed = urlResult.value;
  if (parsed.hostname !== 'github.com') {
    return err(new Error('URL must be from github.com'));
  }

  if (!PATTERNS.GITHUB_REPO.test(url)) {
    return err(new Error('Invalid GitHub repository URL format'));
  }

  return ok(true);
}

/**
 * Validate semantic version string
 *
 * @param version - Version string to validate
 * @returns Result with validation status
 */
export function validateSemver(version: string): Result<boolean, Error> {
  if (!PATTERNS.SEMVER.test(version)) {
    return err(new Error(`Invalid semantic version: ${version}`));
  }

  return ok(true);
}

/**
 * Validate that a number is within a range
 *
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Result with validation status
 */
export function validateRange(
  value: number,
  min: number,
  max: number
): Result<boolean, Error> {
  if (value < min || value > max) {
    return err(new Error(`Value ${value} is outside range [${min}, ${max}]`));
  }

  return ok(true);
}

/**
 * Validate that a string is not empty
 *
 * @param value - String to validate
 * @param fieldName - Field name for error message
 * @returns Result with validation status
 */
export function validateNonEmpty(value: string, fieldName: string = 'Value'): Result<boolean, Error> {
  if (!value || value.trim().length === 0) {
    return err(new Error(`${fieldName} cannot be empty`));
  }

  return ok(true);
}

/**
 * Validate email format (basic)
 *
 * @param email - Email to validate
 * @returns Result with validation status
 */
export function validateEmail(email: string): Result<boolean, Error> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return err(new Error('Invalid email format'));
  }

  return ok(true);
}

/**
 * Validate that an object has required fields
 *
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Result with validation status and missing fields
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  obj: T,
  requiredFields: string[]
): Result<boolean, Error> {
  const missing = requiredFields.filter((field) => !(field in obj) || obj[field] === undefined);

  if (missing.length > 0) {
    return err(new Error(`Missing required fields: ${missing.join(', ')}`));
  }

  return ok(true);
}
