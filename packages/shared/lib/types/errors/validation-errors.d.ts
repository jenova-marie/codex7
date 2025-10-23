/**
 * ✅ Validation-Related Errors
 *
 * Errors for input validation failures
 *
 * @module @codex7/shared/errors
 */
import { Codex7Error } from './base.js';
/**
 * Thrown when input validation fails
 */
export declare class ValidationError extends Codex7Error {
    constructor(field: string, reason: string);
}
/**
 * Thrown when a required parameter is missing
 */
export declare class MissingParameterError extends Codex7Error {
    constructor(parameter: string);
}
/**
 * Thrown when a parameter has an invalid format
 */
export declare class InvalidFormatError extends Codex7Error {
    constructor(field: string, expected: string, received: string);
}
/**
 * Thrown when a value is out of acceptable range
 */
export declare class OutOfRangeError extends Codex7Error {
    constructor(field: string, value: number, min?: number, max?: number);
}
/**
 * Thrown when a library identifier format is invalid
 */
export declare class InvalidLibraryIdError extends Codex7Error {
    constructor(identifier: string);
}
