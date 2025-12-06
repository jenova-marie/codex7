import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { setupTestEnv, cleanupTestData, TEST_LIBRARY_PREFIX } from "./setup.js";

// Set up test environment before imports
setupTestEnv();

import {
  getDb,
  closeDb,
  isDbConfigured,
  localLibraries,
  localSnippets,
  type NewLocalLibrary,
  type NewLocalSnippet,
} from "../../src/db/index.js";
import { eq } from "drizzle-orm";

describe("Database Integration Tests", { sequential: true }, () => {
  beforeAll(async () => {
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await closeDb();
  });

  describe("isDbConfigured", () => {
    it("should return true when CODEX7_PG_URL is set", () => {
      expect(isDbConfigured()).toBe(true);
    });
  });

  describe("getDb", () => {
    it("should return a database connection", () => {
      const db = getDb();
      expect(db).toBeDefined();
    });

    it("should return the same instance on multiple calls", () => {
      const db1 = getDb();
      const db2 = getDb();
      expect(db1).toBe(db2);
    });
  });

  describe("localLibraries table", { sequential: true }, () => {
    const testLibraryId = `${TEST_LIBRARY_PREFIX}integration-test-lib`;

    beforeEach(async () => {
      const db = getDb();
      // Clean up any existing test library
      try {
        await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));
      } catch {
        // Table may not exist on first run
      }
    });

    it("should insert a new library", async () => {
      const db = getDb();

      const newLibrary: NewLocalLibrary = {
        id: testLibraryId,
        title: "Test Library",
        description: "A library for integration testing",
        branch: "main",
        sourcePath: "/tmp/test-project",
        packageName: "@test/library",
        version: "1.0.0",
        keywords: ["test", "integration"],
        rules: ["Rule 1", "Rule 2"],
        totalTokens: 1000,
        totalSnippets: 10,
        totalPages: 5,
        trustScore: 10.0,
      };

      await db.insert(localLibraries).values(newLibrary);

      const [result] = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      expect(result).toBeDefined();
      expect(result.id).toBe(testLibraryId);
      expect(result.title).toBe("Test Library");
      expect(result.description).toBe("A library for integration testing");
      expect(result.keywords).toEqual(["test", "integration"]);
      expect(result.rules).toEqual(["Rule 1", "Rule 2"]);
      expect(result.trustScore).toBe(10.0);
    });

    it("should update an existing library", async () => {
      const db = getDb();

      // Insert first
      await db.insert(localLibraries).values({
        id: testLibraryId,
        title: "Original Title",
        sourcePath: "/tmp/test",
      });

      // Update
      await db
        .update(localLibraries)
        .set({ title: "Updated Title", totalSnippets: 50 })
        .where(eq(localLibraries.id, testLibraryId));

      const [result] = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      expect(result.title).toBe("Updated Title");
      expect(result.totalSnippets).toBe(50);
    });

    it("should delete a library", async () => {
      const db = getDb();

      await db.insert(localLibraries).values({
        id: testLibraryId,
        title: "To Be Deleted",
        sourcePath: "/tmp/test",
      });

      await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));

      const results = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      expect(results).toHaveLength(0);
    });
  });

  describe("localSnippets table", { sequential: true }, () => {
    const testLibraryId = `${TEST_LIBRARY_PREFIX}snippets-test-lib`;
    const testSnippetId = `${testLibraryId}:0:abc123`;

    beforeEach(async () => {
      const db = getDb();
      // Clean up
      await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));

      // Create parent library
      await db.insert(localLibraries).values({
        id: testLibraryId,
        title: "Snippets Test Library",
        sourcePath: "/tmp/test",
      });
    });

    it("should insert a new snippet", async () => {
      const db = getDb();

      const newSnippet: NewLocalSnippet = {
        id: testSnippetId,
        libraryId: testLibraryId,
        title: "Getting Started",
        sourceFile: "README.md",
        sourceType: "readme",
        description: "How to get started with the library",
        content: "# Getting Started\n\nInstall with npm...",
        codeBlocks: [
          { language: "bash", code: "npm install @test/library" },
        ],
        tokens: 50,
      };

      await db.insert(localSnippets).values(newSnippet);

      const [result] = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.id, testSnippetId));

      expect(result).toBeDefined();
      expect(result.title).toBe("Getting Started");
      expect(result.sourceType).toBe("readme");
      expect(result.codeBlocks).toEqual([
        { language: "bash", code: "npm install @test/library" },
      ]);
    });

    it("should cascade delete snippets when library is deleted", async () => {
      const db = getDb();

      // Insert snippet
      await db.insert(localSnippets).values({
        id: testSnippetId,
        libraryId: testLibraryId,
        title: "Test Snippet",
        sourceFile: "test.md",
        sourceType: "docs",
        content: "Test content",
      });

      // Delete library
      await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));

      // Check snippet was deleted
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      expect(snippets).toHaveLength(0);
    });

    it("should query snippets by library ID", async () => {
      const db = getDb();

      // Insert multiple snippets
      await db.insert(localSnippets).values([
        {
          id: `${testLibraryId}:0:aaa`,
          libraryId: testLibraryId,
          title: "Snippet 1",
          sourceFile: "a.md",
          sourceType: "docs",
          content: "Content 1",
        },
        {
          id: `${testLibraryId}:1:bbb`,
          libraryId: testLibraryId,
          title: "Snippet 2",
          sourceFile: "b.md",
          sourceType: "docs",
          content: "Content 2",
        },
        {
          id: `${testLibraryId}:2:ccc`,
          libraryId: testLibraryId,
          title: "Snippet 3",
          sourceFile: "c.md",
          sourceType: "examples",
          content: "Content 3",
        },
      ]);

      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      expect(snippets).toHaveLength(3);
    });
  });
});
