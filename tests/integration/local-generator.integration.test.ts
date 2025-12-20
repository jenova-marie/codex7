import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { setupTestEnv, cleanupTestData, TEST_LIBRARY_PREFIX, isQdrantAccessible } from "./setup.js";

// Set up test environment before imports
setupTestEnv();

// Check if Qdrant is accessible for tests that need it
let qdrantAvailable = false;

import {
  indexProject,
  removeLibrary,
  listLibraries,
  type IndexConfig,
} from "../../src/lib/local-generator.js";
import { getDb, localLibraries, localSnippets, closeDb } from "../../src/db/index.js";
import { deleteLibraryVectors } from "../../src/lib/local-vectors.js";
import { eq } from "drizzle-orm";

describe("Local Generator Integration Tests", { sequential: true }, () => {
  let testProjectPath: string;
  const testLibraryId = `${TEST_LIBRARY_PREFIX}generator-test-${Date.now()}`;

  beforeAll(async () => {
    // Check if Qdrant is accessible
    qdrantAvailable = await isQdrantAccessible();
    if (!qdrantAvailable) {
      console.warn("Qdrant not accessible - some tests will be skipped");
    }

    // Create a temporary test project
    testProjectPath = path.join(os.tmpdir(), "codex7-test-project-" + Date.now());
    fs.mkdirSync(testProjectPath, { recursive: true });

    // Create package.json
    fs.writeFileSync(
      path.join(testProjectPath, "package.json"),
      JSON.stringify({
        name: "@test/generator-lib",
        version: "1.0.0",
        description: "A test library for integration testing",
        keywords: ["test", "integration"],
      })
    );

    // Create README.md
    fs.writeFileSync(
      path.join(testProjectPath, "README.md"),
      `# Test Library

This is a test library for integration testing.

## Installation

\`\`\`bash
npm install @test/generator-lib
\`\`\`

## Usage

\`\`\`typescript
import { doSomething } from '@test/generator-lib';

const result = doSomething();
console.log(result);
\`\`\`

## API Reference

### doSomething()

Does something useful.

**Returns:** \`string\` - A useful result

## Contributing

Pull requests are welcome!
`
    );

    // Create docs directory with files
    fs.mkdirSync(path.join(testProjectPath, "docs"), { recursive: true });

    fs.writeFileSync(
      path.join(testProjectPath, "docs", "getting-started.md"),
      `## Getting Started

This guide will help you get started with the library.

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start

\`\`\`typescript
import { init } from '@test/generator-lib';

init({ debug: true });
\`\`\`
`
    );

    fs.writeFileSync(
      path.join(testProjectPath, "docs", "advanced.md"),
      `## Advanced Usage

Learn about advanced features.

### Configuration

You can configure the library with these options:

\`\`\`typescript
const config = {
  timeout: 5000,
  retries: 3,
};
\`\`\`

### Error Handling

Always handle errors properly:

\`\`\`typescript
try {
  await riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
}
\`\`\`
`
    );

    // Create examples directory
    fs.mkdirSync(path.join(testProjectPath, "examples"), { recursive: true });

    fs.writeFileSync(
      path.join(testProjectPath, "examples", "basic.md"),
      `## Basic Example

A simple example showing basic usage.

\`\`\`typescript
import { basicFunction } from '@test/generator-lib';

const result = basicFunction('input');
console.log(result);
\`\`\`
`
    );

    // Create codex7.json config
    fs.writeFileSync(
      path.join(testProjectPath, "codex7.json"),
      JSON.stringify({
        projectTitle: "Test Generator Library",
        description: "Library for testing the generator",
        rules: ["Always use async/await", "Handle errors properly"],
        excludeFiles: ["CHANGELOG.md"],
      })
    );

    await cleanupTestData();
  });

  afterAll(async () => {
    // Clean up test project
    if (testProjectPath && fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }

    // Clean up database
    await cleanupTestData();
    await deleteLibraryVectors(testLibraryId);
    await closeDb();
  });

  beforeEach(async () => {
    // Clean up any existing test library
    const db = getDb();
    await db.delete(localLibraries).where(eq(localLibraries.id, testLibraryId));
    await deleteLibraryVectors(testLibraryId);
  });

  describe("indexProject", { sequential: true }, () => {
    it("should index a project and store in database", async () => {
      if (!qdrantAvailable) {
        console.log("Skipping: Qdrant not accessible");
        return;
      }

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      };

      const result = await indexProject(config);

      expect(result.libraryId).toBe(testLibraryId);
      expect(result.snippetCount).toBeGreaterThan(0);
      expect(result.totalTokens).toBeGreaterThan(0);
      expect(result.processedFiles.length).toBeGreaterThan(0);
    });

    it("should use project config file values", async () => {
      if (!qdrantAvailable) return;

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      };

      const result = await indexProject(config);

      // Verify indexProject returned the correct libraryId
      expect(result.libraryId).toBe(testLibraryId);

      // Verify config was applied
      const db = getDb();
      const results = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      // Should have exactly one result
      expect(results.length).toBe(1);
      const lib = results[0];

      // projectTitle from codex7.json should be used
      expect(lib.title).toBe("Test Generator Library");
      expect(lib.rules).toContain("Always use async/await");
      expect(lib.rules).toContain("Handle errors properly");
    });

    it("should extract code blocks from markdown", async () => {
      if (!qdrantAvailable) return;

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      };

      await indexProject(config);

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      // Find snippets with code blocks
      const withCodeBlocks = snippets.filter(
        (s) => s.codeBlocks && (s.codeBlocks as unknown[]).length > 0
      );

      expect(withCodeBlocks.length).toBeGreaterThan(0);
    });

    it("should process README, docs, and examples directories", async () => {
      if (!qdrantAvailable) return;

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      };

      const result = await indexProject(config);

      // Should process files from multiple directories
      expect(result.processedFiles).toContain("README.md");
      expect(result.processedFiles.some((f) => f.includes("docs/"))).toBe(true);
      expect(result.processedFiles.some((f) => f.includes("examples/"))).toBe(true);
    });

    it("should store vectors in Qdrant", async () => {
      if (!qdrantAvailable) return;

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      };

      await indexProject(config);

      // Verify vectors were stored
      const { getLibraryVectors } = await import("../../src/lib/local-vectors.js");
      const vectors = await getLibraryVectors(testLibraryId, 100);

      expect(vectors.length).toBeGreaterThan(0);
    });

    it("should replace existing library on re-index", async () => {
      if (!qdrantAvailable) return;

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      };

      // Index first time
      const result1 = await indexProject(config);

      // Index again
      const result2 = await indexProject(config);

      // Should have same number of snippets (not doubled)
      expect(result2.snippetCount).toBe(result1.snippetCount);

      // Check database has correct count
      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      expect(snippets.length).toBe(result2.snippetCount);
    });

    it("should use CLI overrides over config file", async () => {
      if (!qdrantAvailable) return;

      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
        title: "CLI Override Title",
        description: "CLI Override Description",
      };

      await indexProject(config);

      const db = getDb();
      const [lib] = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      expect(lib.title).toBe("CLI Override Title");
      expect(lib.description).toBe("CLI Override Description");
    });

    it("should handle verbose mode", async () => {
      const config: IndexConfig = {
        projectPath: testProjectPath,
        libraryId: testLibraryId,
        verbose: true,
      };

      // Should not throw
      await expect(indexProject(config)).resolves.not.toThrow();
    });
  });

  describe("removeLibrary", { sequential: true }, () => {
    it("should remove an existing library", async () => {
      // First index a library
      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      // Remove it
      const removed = await removeLibrary(testLibraryId);

      expect(removed).toBe(true);

      // Verify it's gone
      const db = getDb();
      const results = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, testLibraryId));

      expect(results).toHaveLength(0);
    });

    it("should return false for non-existent library", async () => {
      const removed = await removeLibrary("/non/existent/lib");

      expect(removed).toBe(false);
    });

    it("should also remove associated snippets", async () => {
      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      await removeLibrary(testLibraryId);

      const db = getDb();
      const snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, testLibraryId));

      expect(snippets).toHaveLength(0);
    });
  });

  describe("listLibraries", { sequential: true }, () => {
    it("should list all indexed libraries", async () => {
      // Index a test library
      await indexProject({
        projectPath: testProjectPath,
        libraryId: testLibraryId,
      });

      const libraries = await listLibraries();

      expect(libraries.length).toBeGreaterThan(0);

      const testLib = libraries.find((l) => l.id === testLibraryId);
      expect(testLib).toBeDefined();
      expect(testLib?.title).toBeDefined();
      expect(testLib?.snippetCount).toBeGreaterThan(0);
    });

    it("should return empty array when no libraries", async () => {
      // Clean up all test libraries
      await cleanupTestData();

      const libraries = await listLibraries();

      // May have other libraries, but should not throw
      expect(Array.isArray(libraries)).toBe(true);
    });
  });
});
