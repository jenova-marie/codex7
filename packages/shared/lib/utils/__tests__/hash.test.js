/**
 * 🧪 Tests for Hashing Utilities
 */
import { describe, it, expect } from 'vitest';
import { sha256, shortHash, hashWithSalt, generateId } from '../hash.js';
describe('sha256', () => {
    it('should generate consistent hashes', () => {
        const content = 'Hello, World!';
        const hash1 = sha256(content);
        const hash2 = sha256(content);
        expect(hash1).toBe(hash2);
    });
    it('should generate different hashes for different content', () => {
        const hash1 = sha256('Content A');
        const hash2 = sha256('Content B');
        expect(hash1).not.toBe(hash2);
    });
    it('should return hexadecimal string', () => {
        const hash = sha256('test');
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
    it('should handle empty strings', () => {
        const hash = sha256('');
        expect(hash).toBeTruthy();
        expect(hash.length).toBe(64);
    });
    it('should handle unicode characters', () => {
        const hash = sha256('Hello 世界 🌍');
        expect(hash).toBeTruthy();
        expect(hash.length).toBe(64);
    });
});
describe('shortHash', () => {
    it('should generate 16-character hashes', () => {
        const hash = shortHash('test content');
        expect(hash.length).toBe(16);
    });
    it('should generate consistent short hashes', () => {
        const content = 'test';
        const hash1 = shortHash(content);
        const hash2 = shortHash(content);
        expect(hash1).toBe(hash2);
    });
    it('should be prefix of full SHA-256 hash', () => {
        const content = 'test content';
        const full = sha256(content);
        const short = shortHash(content);
        expect(full.startsWith(short)).toBe(true);
    });
    it('should return hexadecimal string', () => {
        const hash = shortHash('test');
        expect(hash).toMatch(/^[a-f0-9]{16}$/);
    });
});
describe('hashWithSalt', () => {
    it('should generate consistent hashes with same salt', () => {
        const value = 'password123';
        const salt = 'random-salt';
        const hash1 = hashWithSalt(value, salt);
        const hash2 = hashWithSalt(value, salt);
        expect(hash1).toBe(hash2);
    });
    it('should generate different hashes with different salts', () => {
        const value = 'password123';
        const hash1 = hashWithSalt(value, 'salt1');
        const hash2 = hashWithSalt(value, 'salt2');
        expect(hash1).not.toBe(hash2);
    });
    it('should generate different hashes for different values', () => {
        const salt = 'same-salt';
        const hash1 = hashWithSalt('value1', salt);
        const hash2 = hashWithSalt('value2', salt);
        expect(hash1).not.toBe(hash2);
    });
    it('should return hexadecimal string', () => {
        const hash = hashWithSalt('test', 'salt');
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
    it('should handle empty salt', () => {
        const hash = hashWithSalt('value', '');
        expect(hash).toBeTruthy();
        expect(hash.length).toBe(64);
    });
});
describe('generateId', () => {
    it('should generate IDs of specified length', () => {
        const id = generateId(16);
        expect(id.length).toBe(16);
    });
    it('should generate unique IDs', () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
    });
    it('should use default length of 16', () => {
        const id = generateId();
        expect(id.length).toBe(16);
    });
    it('should return hexadecimal string', () => {
        const id = generateId(32);
        expect(id).toMatch(/^[a-f0-9]{32}$/);
    });
    it('should handle custom lengths', () => {
        const id8 = generateId(8);
        const id32 = generateId(32);
        const id64 = generateId(64);
        expect(id8.length).toBe(8);
        expect(id32.length).toBe(32);
        expect(id64.length).toBe(64);
    });
    it('should generate cryptographically random IDs', () => {
        // Generate multiple IDs and ensure they're all unique
        const ids = new Set();
        const count = 100;
        for (let i = 0; i < count; i++) {
            ids.add(generateId());
        }
        expect(ids.size).toBe(count);
    });
});
//# sourceMappingURL=hash.test.js.map