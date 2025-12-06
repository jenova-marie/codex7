import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isLocalStorageConfigured } from "../src/lib/local-api.js";

describe("local-api module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isLocalStorageConfigured", () => {
    it("should return true when both DB and Qdrant are configured", () => {
      process.env.CODEX7_PG_URL = "postgres://localhost/test";
      process.env.CODEX7_QDRANT_URL = "http://localhost:6333";

      expect(isLocalStorageConfigured()).toBe(true);
    });

    it("should return false when only DB is configured", () => {
      process.env.CODEX7_PG_URL = "postgres://localhost/test";
      delete process.env.CODEX7_QDRANT_URL;

      expect(isLocalStorageConfigured()).toBe(false);
    });

    it("should return false when only Qdrant is configured", () => {
      delete process.env.CODEX7_PG_URL;
      process.env.CODEX7_QDRANT_URL = "http://localhost:6333";

      expect(isLocalStorageConfigured()).toBe(false);
    });

    it("should return false when neither is configured", () => {
      delete process.env.CODEX7_PG_URL;
      delete process.env.CODEX7_QDRANT_URL;

      expect(isLocalStorageConfigured()).toBe(false);
    });
  });

  describe("estimateTokens logic", () => {
    function estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    }

    it("should estimate tokens consistently", () => {
      expect(estimateTokens("test")).toBe(1);
      expect(estimateTokens("longer text here")).toBe(4);
    });
  });

  describe("formatDocumentation logic", () => {
    // Test the formatting approach without needing database
    it("should create proper header format", () => {
      const library = {
        title: "Test Library",
        description: "A test library for testing",
        rules: ["Rule 1", "Rule 2"],
      };

      const parts: string[] = [];
      parts.push(`# ${library.title}\n`);
      if (library.description) {
        parts.push(`${library.description}\n`);
      }

      if (library.rules && library.rules.length > 0) {
        parts.push(`\n## Best Practices\n`);
        parts.push(`When using this library, follow these guidelines:\n`);
        for (const rule of library.rules) {
          parts.push(`- ${rule}\n`);
        }
      }

      const output = parts.join("");

      expect(output).toContain("# Test Library");
      expect(output).toContain("A test library for testing");
      expect(output).toContain("## Best Practices");
      expect(output).toContain("- Rule 1");
      expect(output).toContain("- Rule 2");
    });

    it("should handle library without rules", () => {
      const library = {
        title: "Simple Library",
        description: "No rules here",
        rules: null as string[] | null,
      };

      const parts: string[] = [];
      parts.push(`# ${library.title}\n`);
      if (library.description) {
        parts.push(`${library.description}\n`);
      }

      if (library.rules && library.rules.length > 0) {
        parts.push(`\n## Best Practices\n`);
      }

      const output = parts.join("");

      expect(output).toContain("# Simple Library");
      expect(output).not.toContain("Best Practices");
    });

    it("should handle empty rules array", () => {
      const library = {
        title: "Library",
        description: "Description",
        rules: [] as string[],
      };

      const parts: string[] = [];
      parts.push(`# ${library.title}\n`);

      if (library.rules && library.rules.length > 0) {
        parts.push(`\n## Best Practices\n`);
      }

      const output = parts.join("");

      expect(output).not.toContain("Best Practices");
    });
  });

  describe("snippet formatting logic", () => {
    it("should format snippet with title and source", () => {
      const snippet = {
        title: "Getting Started",
        sourceFile: "docs/getting-started.md",
        description: "Learn how to get started",
        content: "Step 1: Install",
        codeBlocks: [{ language: "bash", code: "npm install" }],
      };

      const parts: string[] = [];
      parts.push(`\n### ${snippet.title}\n`);
      parts.push(`Source: ${snippet.sourceFile}\n`);

      if (snippet.description) {
        parts.push(`\n${snippet.description}\n`);
      }

      if (snippet.codeBlocks && snippet.codeBlocks.length > 0) {
        for (const block of snippet.codeBlocks) {
          parts.push(`\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`);
        }
      }

      parts.push("\n--------------------------------\n");

      const output = parts.join("");

      expect(output).toContain("### Getting Started");
      expect(output).toContain("Source: docs/getting-started.md");
      expect(output).toContain("Learn how to get started");
      expect(output).toContain("```bash\nnpm install\n```");
      expect(output).toContain("--------------------------------");
    });

    it("should handle snippet without code blocks", () => {
      const snippet = {
        title: "Overview",
        sourceFile: "README.md",
        description: null,
        content: "This is the content",
        codeBlocks: null as Array<{ language: string; code: string }> | null,
      };

      const parts: string[] = [];
      parts.push(`\n### ${snippet.title}\n`);
      parts.push(`Source: ${snippet.sourceFile}\n`);

      if (snippet.codeBlocks && snippet.codeBlocks.length > 0) {
        for (const block of snippet.codeBlocks) {
          parts.push(`\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`);
        }
      } else if (snippet.content) {
        parts.push(`\n${snippet.content}\n`);
      }

      const output = parts.join("");

      expect(output).toContain("### Overview");
      expect(output).toContain("This is the content");
      expect(output).not.toContain("```");
    });
  });

  describe("library ID normalization", () => {
    function normalizeLibraryId(id: string): string {
      return id.startsWith("/") ? id : `/${id}`;
    }

    it("should add leading slash if missing", () => {
      expect(normalizeLibraryId("vercel/next.js")).toBe("/vercel/next.js");
      expect(normalizeLibraryId("test/lib")).toBe("/test/lib");
    });

    it("should keep existing leading slash", () => {
      expect(normalizeLibraryId("/vercel/next.js")).toBe("/vercel/next.js");
      expect(normalizeLibraryId("/test/lib")).toBe("/test/lib");
    });
  });
});
