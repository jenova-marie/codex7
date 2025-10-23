/**
 * 🔐 Hashing Utilities
 */
import { createHash } from 'node:crypto';
/**
 * Generate SHA-256 hash of content
 *
 * Used for content deduplication
 *
 * @param content - Content to hash
 * @returns Hexadecimal hash string
 */
export function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}
/**
 * Generate a shorter hash (first 16 characters of SHA-256)
 *
 * @param content - Content to hash
 * @returns Shortened hexadecimal hash string
 */
export function shortHash(content) {
    return sha256(content).slice(0, 16);
}
/**
 * Hash a password or API key with salt
 *
 * @param value - Value to hash
 * @param salt - Salt string
 * @returns Hashed value
 */
export function hashWithSalt(value, salt) {
    return createHash('sha256')
        .update(value + salt)
        .digest('hex');
}
/**
 * Generate a random ID
 *
 * @param length - Length of the ID (default: 16)
 * @returns Random hex string
 */
export function generateId(length = 16) {
    return createHash('sha256')
        .update(Math.random().toString() + Date.now().toString())
        .digest('hex')
        .slice(0, length);
}
//# sourceMappingURL=hash.js.map