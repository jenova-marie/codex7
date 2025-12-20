/**
 * Integration test setup
 * Configures test database connections for PostgreSQL and Qdrant
 */

import "dotenv/config";
import { vi } from "vitest";

// Set up test environment variables before any imports
export function setupTestEnv() {
  // Use test database - override the production URL
  process.env.CODEX7_PG_URL = "postgres://jenova:d3cad30n3@db.rso:5432/codex7_test";

  // Use the same Qdrant instance but with test collection
  // CODEX7_QDRANT_URL and CODEX7_QDRANT_API_KEY should come from .env

  // OpenAI key should be set in environment from .env
}

/**
 * Mock the topic extractor to avoid LLM calls in tests
 */
export async function mockTopicExtractor() {
  vi.mock("../../src/lib/topic-extractor.js", () => ({
    extractTopicsFromHeaders: vi.fn().mockReturnValue(["test-topic"]),
    extractTopicsWithLLM: vi.fn().mockResolvedValue(["mock-topic"]),
    extractTopics: vi.fn().mockResolvedValue(["mock-topic"]),
  }));
}

/**
 * Check if Qdrant is accessible
 */
export async function isQdrantAccessible(): Promise<boolean> {
  const qdrantUrl = process.env.CODEX7_QDRANT_URL;
  if (!qdrantUrl) return false;

  try {
    const response = await fetch(`${qdrantUrl}/collections`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Test collection name to avoid conflicts with production data
export const TEST_COLLECTION_NAME = "codex7_test_docs";

// Test library ID prefix
export const TEST_LIBRARY_PREFIX = "/test/";

/**
 * Clean up test data from database
 */
export async function cleanupTestData() {
  const { getDb, localLibraries, closeDb } = await import("../../src/db/index.js");
  const { sql } = await import("drizzle-orm");

  try {
    const db = getDb();

    // Delete all test libraries (those starting with /test/)
    await db.delete(localLibraries).where(
      sql`${localLibraries.id} LIKE ${TEST_LIBRARY_PREFIX + "%"}`
    );
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

/**
 * Clean up test vectors from Qdrant
 */
export async function cleanupTestVectors() {
  const { getQdrantClient, isQdrantConfigured } = await import("../../src/lib/local-vectors.js");

  if (!isQdrantConfigured()) {
    return;
  }

  try {
    const client = getQdrantClient();

    // Delete all points with test library IDs
    await client.delete("codex7_local_docs", {
      filter: {
        must: [
          {
            key: "library_id",
            match: {
              text: TEST_LIBRARY_PREFIX,
            },
          },
        ],
      },
    });
  } catch (error) {
    // Collection may not exist yet, that's fine
    console.error("Vector cleanup error:", error);
  }
}
