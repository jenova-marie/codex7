/**
 * 🔐 Hashing Utilities
 */
/**
 * Generate SHA-256 hash of content
 *
 * Used for content deduplication
 *
 * @param content - Content to hash
 * @returns Hexadecimal hash string
 */
export declare function sha256(content: string): string;
/**
 * Generate a shorter hash (first 16 characters of SHA-256)
 *
 * @param content - Content to hash
 * @returns Shortened hexadecimal hash string
 */
export declare function shortHash(content: string): string;
/**
 * Hash a password or API key with salt
 *
 * @param value - Value to hash
 * @param salt - Salt string
 * @returns Hashed value
 */
export declare function hashWithSalt(value: string, salt: string): string;
/**
 * Generate a random ID
 *
 * @param length - Length of the ID (default: 16)
 * @returns Random hex string
 */
export declare function generateId(length?: number): string;
