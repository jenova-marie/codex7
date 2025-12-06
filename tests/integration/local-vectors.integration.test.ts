import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { setupTestEnv, TEST_LIBRARY_PREFIX } from "./setup.js";

// Set up test environment before imports
setupTestEnv();

import {
  getQdrantClient,
  isQdrantConfigured,
  ensureCollection,
  upsertVectors,
  searchVectors,
  getLibraryVectors,
  deleteLibraryVectors,
  type VectorPayload,
} from "../../src/lib/local-vectors.js";

describe("Local Vectors Integration Tests", { sequential: true }, () => {
  const testLibraryId = `${TEST_LIBRARY_PREFIX}vectors-test-${Date.now()}`;

  beforeAll(async () => {
    if (!isQdrantConfigured()) {
      console.warn("Qdrant not configured, skipping vector tests");
      return;
    }

    // Ensure collection exists
    await ensureCollection();
  });

  afterAll(async () => {
    if (isQdrantConfigured()) {
      await deleteLibraryVectors(testLibraryId);
    }
  });

  beforeEach(async () => {
    if (isQdrantConfigured()) {
      await deleteLibraryVectors(testLibraryId);
    }
  });

  describe("isQdrantConfigured", { sequential: true }, () => {
    it("should return true when CODEX7_QDRANT_URL is set", () => {
      expect(isQdrantConfigured()).toBe(true);
    });
  });

  describe("getQdrantClient", { sequential: true }, () => {
    it("should return a Qdrant client", () => {
      const client = getQdrantClient();
      expect(client).toBeDefined();
    });

    it("should return the same instance on multiple calls", () => {
      const client1 = getQdrantClient();
      const client2 = getQdrantClient();
      expect(client1).toBe(client2);
    });
  });

  describe("ensureCollection", { sequential: true }, () => {
    it("should create or verify collection exists", async () => {
      // Should not throw
      await expect(ensureCollection()).resolves.not.toThrow();
    });

    it("should be idempotent", async () => {
      // Call twice, should not throw
      await ensureCollection();
      await expect(ensureCollection()).resolves.not.toThrow();
    });
  });

  describe("upsertVectors", { sequential: true }, () => {
    it("should handle empty array", async () => {
      await expect(upsertVectors([])).resolves.not.toThrow();
    });

    it("should insert vectors with payloads", async () => {
      const points = [
        {
          id: `${testLibraryId}:0:test1`,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: `${testLibraryId}:0:test1`,
            library_id: testLibraryId,
            title: "Test Snippet 1",
            source_file: "test.md",
            source_type: "docs",
            content_preview: "This is test content 1",
          } as VectorPayload,
        },
        {
          id: `${testLibraryId}:1:test2`,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: `${testLibraryId}:1:test2`,
            library_id: testLibraryId,
            title: "Test Snippet 2",
            source_file: "test2.md",
            source_type: "examples",
            content_preview: "This is test content 2",
          } as VectorPayload,
        },
      ];

      await expect(upsertVectors(points)).resolves.not.toThrow();

      // Verify by retrieving
      const results = await getLibraryVectors(testLibraryId, 10);
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should update existing vectors on upsert", async () => {
      const pointId = `${testLibraryId}:0:upsert-test`;

      // Insert initial
      await upsertVectors([
        {
          id: pointId,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: pointId,
            library_id: testLibraryId,
            title: "Original Title",
            source_file: "test.md",
            source_type: "docs",
            content_preview: "Original content",
          } as VectorPayload,
        },
      ]);

      // Upsert with updated payload
      await upsertVectors([
        {
          id: pointId,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: pointId,
            library_id: testLibraryId,
            title: "Updated Title",
            source_file: "test.md",
            source_type: "docs",
            content_preview: "Updated content",
          } as VectorPayload,
        },
      ]);

      const results = await getLibraryVectors(testLibraryId, 10);
      const updated = results.find((r) => r.payload.snippet_id === pointId);

      expect(updated).toBeDefined();
      expect(updated?.payload.title).toBe("Updated Title");
    });
  });

  describe("searchVectors", { sequential: true }, () => {
    beforeEach(async () => {
      // Insert test vectors for searching
      const points = [
        {
          id: `${testLibraryId}:0:search1`,
          vector: generateTestVector(1536, 0.1),
          payload: {
            snippet_id: `${testLibraryId}:0:search1`,
            library_id: testLibraryId,
            title: "Getting Started Guide",
            source_file: "getting-started.md",
            source_type: "docs",
            content_preview: "How to install and configure the library",
          } as VectorPayload,
        },
        {
          id: `${testLibraryId}:1:search2`,
          vector: generateTestVector(1536, 0.2),
          payload: {
            snippet_id: `${testLibraryId}:1:search2`,
            library_id: testLibraryId,
            title: "API Reference",
            source_file: "api.md",
            source_type: "api",
            content_preview: "Complete API documentation",
          } as VectorPayload,
        },
        {
          id: `${testLibraryId}:2:search3`,
          vector: generateTestVector(1536, 0.3),
          payload: {
            snippet_id: `${testLibraryId}:2:search3`,
            library_id: testLibraryId,
            title: "Code Examples",
            source_file: "examples.md",
            source_type: "examples",
            content_preview: "Working code examples",
          } as VectorPayload,
        },
      ];

      await upsertVectors(points);
    });

    it("should return results for a query vector", async () => {
      const queryVector = generateTestVector(1536, 0.15);

      const results = await searchVectors(queryVector, testLibraryId, 10);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty("payload");
      expect(results[0]).toHaveProperty("score");
    });

    it("should filter by library ID", async () => {
      const queryVector = generateTestVector(1536, 0.15);

      const results = await searchVectors(queryVector, testLibraryId, 10);

      // All results should be from our test library
      for (const result of results) {
        expect(result.payload.library_id).toBe(testLibraryId);
      }
    });

    it("should respect limit parameter", async () => {
      const queryVector = generateTestVector(1536, 0.15);

      const results = await searchVectors(queryVector, testLibraryId, 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it("should return results sorted by score (descending)", async () => {
      const queryVector = generateTestVector(1536, 0.15);

      const results = await searchVectors(queryVector, testLibraryId, 10);

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].score).toBeGreaterThanOrEqual(results[i].score);
      }
    });
  });

  describe("getLibraryVectors", { sequential: true }, () => {
    beforeEach(async () => {
      await upsertVectors([
        {
          id: `${testLibraryId}:0:get1`,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: `${testLibraryId}:0:get1`,
            library_id: testLibraryId,
            title: "Snippet A",
            source_file: "a.md",
            source_type: "docs",
            content_preview: "Content A",
          } as VectorPayload,
        },
        {
          id: `${testLibraryId}:1:get2`,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: `${testLibraryId}:1:get2`,
            library_id: testLibraryId,
            title: "Snippet B",
            source_file: "b.md",
            source_type: "docs",
            content_preview: "Content B",
          } as VectorPayload,
        },
      ]);
    });

    it("should return all vectors for a library", async () => {
      const results = await getLibraryVectors(testLibraryId, 100);

      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it("should respect limit parameter", async () => {
      const results = await getLibraryVectors(testLibraryId, 1);

      expect(results.length).toBeLessThanOrEqual(1);
    });

    it("should return empty array for non-existent library", async () => {
      const results = await getLibraryVectors("/non/existent", 10);

      expect(results).toHaveLength(0);
    });
  });

  describe("deleteLibraryVectors", { sequential: true }, () => {
    it("should delete all vectors for a library", async () => {
      const deleteTestLibrary = `${TEST_LIBRARY_PREFIX}delete-test`;

      // Insert vectors
      await upsertVectors([
        {
          id: `${deleteTestLibrary}:0:del1`,
          vector: generateTestVector(1536),
          payload: {
            snippet_id: `${deleteTestLibrary}:0:del1`,
            library_id: deleteTestLibrary,
            title: "To Delete",
            source_file: "del.md",
            source_type: "docs",
            content_preview: "Will be deleted",
          } as VectorPayload,
        },
      ]);

      // Verify exists
      let results = await getLibraryVectors(deleteTestLibrary, 10);
      expect(results.length).toBeGreaterThan(0);

      // Delete
      await deleteLibraryVectors(deleteTestLibrary);

      // Verify deleted
      results = await getLibraryVectors(deleteTestLibrary, 10);
      expect(results).toHaveLength(0);
    });

    it("should not throw for non-existent library", async () => {
      await expect(deleteLibraryVectors("/non/existent/lib")).resolves.not.toThrow();
    });
  });
});

/**
 * Generate a test vector with optional seed for reproducibility
 */
function generateTestVector(dimensions: number, seed: number = Math.random()): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i++) {
    // Generate deterministic values based on seed and index
    vector.push(Math.sin(seed * (i + 1)) * 0.5 + 0.5);
  }
  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return vector.map((v) => v / magnitude);
}
