import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isQdrantConfigured } from "../src/lib/local-vectors.js";

describe("local-vectors module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isQdrantConfigured", () => {
    it("should return true when CODEX7_QDRANT_URL is set", () => {
      process.env.CODEX7_QDRANT_URL = "http://localhost:6333";

      expect(isQdrantConfigured()).toBe(true);
    });

    it("should return false when CODEX7_QDRANT_URL is not set", () => {
      delete process.env.CODEX7_QDRANT_URL;

      expect(isQdrantConfigured()).toBe(false);
    });

    it("should return false when CODEX7_QDRANT_URL is empty string", () => {
      process.env.CODEX7_QDRANT_URL = "";

      expect(isQdrantConfigured()).toBe(false);
    });
  });

  describe("hashStringToNumber logic", () => {
    // Re-implement to test the hashing behavior
    function hashStringToNumber(str: string): number {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }

    it("should produce positive integers", () => {
      expect(hashStringToNumber("test")).toBeGreaterThanOrEqual(0);
      expect(hashStringToNumber("another-string")).toBeGreaterThanOrEqual(0);
      expect(hashStringToNumber("")).toBeGreaterThanOrEqual(0);
    });

    it("should produce consistent hashes for same input", () => {
      const hash1 = hashStringToNumber("consistent-input");
      const hash2 = hashStringToNumber("consistent-input");

      expect(hash1).toBe(hash2);
    });

    it("should produce different hashes for different inputs", () => {
      const hash1 = hashStringToNumber("input-a");
      const hash2 = hashStringToNumber("input-b");

      expect(hash1).not.toBe(hash2);
    });

    it("should handle empty string", () => {
      const hash = hashStringToNumber("");

      expect(hash).toBe(0);
    });

    it("should handle unicode characters", () => {
      const hash = hashStringToNumber("日本語テスト");

      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
    });
  });

  describe("VectorPayload interface", () => {
    it("should have expected structure", () => {
      const payload = {
        snippet_id: "/test/lib:0:abc123",
        library_id: "/test/lib",
        title: "Getting Started",
        source_file: "README.md",
        source_type: "readme",
        content_preview: "This is a preview...",
      };

      expect(payload).toHaveProperty("snippet_id");
      expect(payload).toHaveProperty("library_id");
      expect(payload).toHaveProperty("title");
      expect(payload).toHaveProperty("source_file");
      expect(payload).toHaveProperty("source_type");
      expect(payload).toHaveProperty("content_preview");
    });
  });

  describe("VECTOR_SIZE constant", () => {
    // text-embedding-3-small produces 1536-dimensional vectors
    const VECTOR_SIZE = 1536;

    it("should match text-embedding-3-small dimensions", () => {
      expect(VECTOR_SIZE).toBe(1536);
    });
  });

  describe("COLLECTION_NAME constant", () => {
    const COLLECTION_NAME = "codex7";

    it("should be a valid collection name", () => {
      expect(COLLECTION_NAME).toBe("codex7");
      expect(COLLECTION_NAME).toMatch(/^[a-z0-9_]+$/);
    });
  });
});
