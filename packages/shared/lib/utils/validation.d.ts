/**
 * ✅ Validation Utilities
 */
import { Result } from '@jenova-marie/ts-rust-result';
/**
 * Validate URL format
 *
 * @param url - URL to validate
 * @returns Result indicating validity
 */
export declare function validateUrl(url: string): Result<URL, Error>;
/**
 * Validate GitHub repository URL
 *
 * @param url - URL to validate
 * @returns Result with validation status
 */
export declare function validateGitHubUrl(url: string): Result<boolean, Error>;
/**
 * Validate semantic version string
 *
 * @param version - Version string to validate
 * @returns Result with validation status
 */
export declare function validateSemver(version: string): Result<boolean, Error>;
/**
 * Validate that a number is within a range
 *
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Result with validation status
 */
export declare function validateRange(value: number, min: number, max: number): Result<boolean, Error>;
/**
 * Validate that a string is not empty
 *
 * @param value - String to validate
 * @param fieldName - Field name for error message
 * @returns Result with validation status
 */
export declare function validateNonEmpty(value: string, fieldName?: string): Result<boolean, Error>;
/**
 * Validate email format (basic)
 *
 * @param email - Email to validate
 * @returns Result with validation status
 */
export declare function validateEmail(email: string): Result<boolean, Error>;
/**
 * Validate that an object has required fields
 *
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Result with validation status and missing fields
 */
export declare function validateRequiredFields<T extends Record<string, unknown>>(obj: T, requiredFields: string[]): Result<boolean, Error>;
