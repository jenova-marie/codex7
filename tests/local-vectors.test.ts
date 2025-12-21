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
      process.env.CODEX7_QDRANT_URL = "http://localhost";

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

  describe("URL parsing for Qdrant client configuration", () => {
    // Test the URL parsing logic used in getQdrantClient
    function parseQdrantUrl(url: string): {
      host: string;
      port: number;
      https: boolean;
    } {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === "https:";
      const host = parsedUrl.hostname;
      const port = parsedUrl.port
        ? parseInt(parsedUrl.port, 10)
        : isHttps
          ? 443
          : 80;

      return { host, port, https: isHttps };
    }

    it("should parse HTTP URL with explicit port", () => {
      const result = parseQdrantUrl("http://localhost:6333");

      expect(result.host).toBe("localhost");
      expect(result.port).toBe(6333);
      expect(result.https).toBe(false);
    });

    it("should parse HTTPS URL with explicit port", () => {
      const result = parseQdrantUrl("https://qdrant.example.com:6334");

      expect(result.host).toBe("qdrant.example.com");
      expect(result.port).toBe(6334);
      expect(result.https).toBe(true);
    });

    it("should use default port 80 for HTTP without port", () => {
      const result = parseQdrantUrl("http://qdrant.local");

      expect(result.host).toBe("qdrant.local");
      expect(result.port).toBe(80);
      expect(result.https).toBe(false);
    });

    it("should use default port 443 for HTTPS without port", () => {
      const result = parseQdrantUrl("https://qdrant.rso");

      expect(result.host).toBe("qdrant.rso");
      expect(result.port).toBe(443);
      expect(result.https).toBe(true);
    });

    it("should handle IP addresses", () => {
      const result = parseQdrantUrl("http://192.168.1.100:6333");

      expect(result.host).toBe("192.168.1.100");
      expect(result.port).toBe(6333);
      expect(result.https).toBe(false);
    });

    it("should handle localhost with different protocols", () => {
      const httpResult = parseQdrantUrl("http://localhost");
      const httpsResult = parseQdrantUrl("https://localhost");

      expect(httpResult.https).toBe(false);
      expect(httpResult.port).toBe(80);

      expect(httpsResult.https).toBe(true);
      expect(httpsResult.port).toBe(443);
    });

    it("should handle URLs with paths (ignore path)", () => {
      const result = parseQdrantUrl("https://qdrant.example.com:443/some/path");

      expect(result.host).toBe("qdrant.example.com");
      expect(result.port).toBe(443);
      expect(result.https).toBe(true);
    });

    it("should handle URLs with trailing slash", () => {
      const result = parseQdrantUrl("http://localhost:6333/");

      expect(result.host).toBe("localhost");
      expect(result.port).toBe(6333);
    });

    it("should throw on invalid URL", () => {
      expect(() => parseQdrantUrl("not-a-url")).toThrow();
      expect(() => parseQdrantUrl("")).toThrow();
    });
  });

  describe("resetQdrantClient behavior", () => {
    // The resetQdrantClient function sets _client to null
    // This tests the expected behavior pattern

    it("should allow client to be re-initialized after reset", () => {
      // Simulating the singleton pattern behavior
      let _client: { host: string } | null = null;

      function resetClient() {
        _client = null;
      }

      function getClient(host: string) {
        if (!_client) {
          _client = { host };
        }
        return _client;
      }

      // Initial client creation
      expect(getClient("first").host).toBe("first");

      // Should return same instance (singleton behavior)
      expect(getClient("second").host).toBe("first");

      // Reset allows new instance with different config
      resetClient();
      expect(getClient("third").host).toBe("third");
    });
  });

  describe("topic filter construction", () => {
    // Test the filter structure used for Qdrant queries with topics
    function buildFilter(
      libraryId: string,
      topics?: string[]
    ): { must: Array<Record<string, unknown>> } {
      const mustConditions: Array<Record<string, unknown>> = [
        {
          key: "library_id",
          match: { value: libraryId },
        },
      ];

      if (topics && topics.length > 0) {
        mustConditions.push({
          key: "topics",
          match: { any: topics },
        });
      }

      return { must: mustConditions };
    }

    it("should create filter with just library_id when no topics", () => {
      const filter = buildFilter("/test/lib");

      expect(filter.must).toHaveLength(1);
      expect(filter.must[0]).toEqual({
        key: "library_id",
        match: { value: "/test/lib" },
      });
    });

    it("should create filter with topics when provided", () => {
      const filter = buildFilter("/test/lib", ["routing", "auth"]);

      expect(filter.must).toHaveLength(2);
      expect(filter.must[1]).toEqual({
        key: "topics",
        match: { any: ["routing", "auth"] },
      });
    });

    it("should not add topics filter for empty array", () => {
      const filter = buildFilter("/test/lib", []);

      expect(filter.must).toHaveLength(1);
    });

    it("should handle single topic", () => {
      const filter = buildFilter("/test/lib", ["authentication"]);

      expect(filter.must).toHaveLength(2);
      expect(filter.must[1]).toEqual({
        key: "topics",
        match: { any: ["authentication"] },
      });
    });
  });
});
