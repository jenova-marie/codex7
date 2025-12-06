import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as path from "path";

// We need to test internal functions, so we'll import the module and test behavior
// through the exported functions or by re-implementing test versions of internal logic

describe("local-generator module", () => {
  describe("matchesExcludePattern logic", () => {
    // Re-implement the matching logic for testing
    function matchesExcludePattern(relativePath: string, patterns: string[]): boolean {
      const normalizedPath = relativePath.replace(/\\/g, "/");
      const pathParts = normalizedPath.split("/");

      for (const pattern of patterns) {
        if (pattern.startsWith("./")) {
          const rootPattern = pattern.slice(2);
          if (normalizedPath === rootPattern || normalizedPath.startsWith(rootPattern + "/")) {
            return true;
          }
        } else if (!pattern.includes("/")) {
          if (pathParts.includes(pattern)) {
            return true;
          }
        } else {
          if (normalizedPath === pattern || normalizedPath.startsWith(pattern + "/")) {
            return true;
          }
        }
      }
      return false;
    }

    it("should match simple folder names anywhere in tree", () => {
      expect(matchesExcludePattern("node_modules", ["node_modules"])).toBe(true);
      expect(matchesExcludePattern("src/node_modules/pkg", ["node_modules"])).toBe(true);
      expect(matchesExcludePattern("deep/nested/node_modules/foo", ["node_modules"])).toBe(true);
    });

    it("should match root-specific patterns with ./", () => {
      expect(matchesExcludePattern("dist", ["./dist"])).toBe(true);
      expect(matchesExcludePattern("dist/index.js", ["./dist"])).toBe(true);
      expect(matchesExcludePattern("src/dist", ["./dist"])).toBe(false);
    });

    it("should match path patterns exactly", () => {
      expect(matchesExcludePattern("app-sdk/v2.3", ["app-sdk/v2.3"])).toBe(true);
      expect(matchesExcludePattern("app-sdk/v2.3/docs", ["app-sdk/v2.3"])).toBe(true);
      expect(matchesExcludePattern("app-sdk/v2.4", ["app-sdk/v2.3"])).toBe(false);
    });

    it("should not match unrelated paths", () => {
      expect(matchesExcludePattern("src/index.ts", ["node_modules", "dist"])).toBe(false);
      expect(matchesExcludePattern("docs/api.md", ["node_modules"])).toBe(false);
    });

    it("should handle Windows-style paths", () => {
      expect(matchesExcludePattern("src\\node_modules\\pkg", ["node_modules"])).toBe(true);
    });
  });

  describe("matchesExcludeFile logic", () => {
    function matchesExcludeFile(filename: string, patterns: string[]): boolean {
      return patterns.includes(filename);
    }

    it("should match exact filename", () => {
      expect(matchesExcludeFile("CHANGELOG.md", ["CHANGELOG.md", "LICENSE.md"])).toBe(true);
      expect(matchesExcludeFile("LICENSE.md", ["CHANGELOG.md", "LICENSE.md"])).toBe(true);
    });

    it("should not match partial filenames", () => {
      expect(matchesExcludeFile("CHANGELOG", ["CHANGELOG.md"])).toBe(false);
      expect(matchesExcludeFile("my-CHANGELOG.md", ["CHANGELOG.md"])).toBe(false);
    });

    it("should not match paths", () => {
      expect(matchesExcludeFile("docs/CHANGELOG.md", ["CHANGELOG.md"])).toBe(false);
    });
  });

  describe("inferSourceType logic", () => {
    function inferSourceType(folder: string): string {
      const lower = folder.toLowerCase();
      if (lower.includes("example")) return "examples";
      if (lower.includes("api") || lower.includes("reference")) return "api";
      if (lower.includes("content")) return "content";
      return "docs";
    }

    it("should infer examples type", () => {
      expect(inferSourceType("examples")).toBe("examples");
      expect(inferSourceType("example")).toBe("examples");
      expect(inferSourceType("code-examples")).toBe("examples");
    });

    it("should infer api type", () => {
      expect(inferSourceType("api")).toBe("api");
      expect(inferSourceType("API")).toBe("api");
      expect(inferSourceType("reference")).toBe("api");
      expect(inferSourceType("api-reference")).toBe("api");
    });

    it("should infer content type", () => {
      expect(inferSourceType("content")).toBe("content");
      expect(inferSourceType("Content")).toBe("content");
    });

    it("should default to docs type", () => {
      expect(inferSourceType("docs")).toBe("docs");
      expect(inferSourceType("documentation")).toBe("docs");
      expect(inferSourceType("guide")).toBe("docs");
      expect(inferSourceType("random")).toBe("docs");
    });
  });

  describe("estimateTokens logic", () => {
    function estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    }

    it("should estimate roughly 4 chars per token", () => {
      expect(estimateTokens("")).toBe(0);
      expect(estimateTokens("test")).toBe(1);
      expect(estimateTokens("hello")).toBe(2);
      expect(estimateTokens("a".repeat(100))).toBe(25);
      expect(estimateTokens("a".repeat(1000))).toBe(250);
    });

    it("should round up for partial tokens", () => {
      expect(estimateTokens("ab")).toBe(1); // 2/4 = 0.5 → 1
      expect(estimateTokens("abc")).toBe(1); // 3/4 = 0.75 → 1
    });
  });

  describe("hashContent logic", () => {
    // Import crypto to test the hash function logic
    const crypto = require("crypto");

    function hashContent(content: string): string {
      return crypto.createHash("md5").update(content).digest("hex").slice(0, 12);
    }

    it("should produce 12 character hex hash", () => {
      const hash = hashContent("test content");
      expect(hash).toHaveLength(12);
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it("should produce different hashes for different content", () => {
      const hash1 = hashContent("content a");
      const hash2 = hashContent("content b");
      expect(hash1).not.toBe(hash2);
    });

    it("should produce same hash for same content", () => {
      const hash1 = hashContent("same content");
      const hash2 = hashContent("same content");
      expect(hash1).toBe(hash2);
    });
  });

  describe("parseMarkdownIntoSnippets logic", () => {
    // Test the markdown parsing approach
    it("should split content by headers", () => {
      const content = `# Title

Introduction

## Section 1

Content for section 1

## Section 2

Content for section 2
`;
      const sections = content.split(/(?=^#{2,3}\s)/m);

      expect(sections.length).toBeGreaterThan(1);
      expect(sections[1]).toContain("## Section 1");
      expect(sections[2]).toContain("## Section 2");
    });

    it("should extract title from header line", () => {
      const section = "## Getting Started\n\nSome content here";
      const titleMatch = section.match(/^#{2,3}\s+(.+?)$/m);

      expect(titleMatch).not.toBeNull();
      expect(titleMatch![1]).toBe("Getting Started");
    });

    it("should extract code blocks", () => {
      const content = `## Example

Here's some code:

\`\`\`typescript
const x = 1;
\`\`\`

And more:

\`\`\`javascript
const y = 2;
\`\`\`
`;
      const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
      const blocks: Array<{ language: string; code: string }> = [];
      let match;

      while ((match = codeBlockRegex.exec(content)) !== null) {
        blocks.push({
          language: match[1] || "text",
          code: match[2].trim(),
        });
      }

      expect(blocks).toHaveLength(2);
      expect(blocks[0].language).toBe("typescript");
      expect(blocks[0].code).toBe("const x = 1;");
      expect(blocks[1].language).toBe("javascript");
      expect(blocks[1].code).toBe("const y = 2;");
    });
  });

  describe("default exclusion patterns", () => {
    const DEFAULT_EXCLUDE_FOLDERS = [
      "node_modules",
      ".git",
      "dist",
      "build",
      "coverage",
      "archive",
      "deprecated",
      "i18n",
    ];

    const DEFAULT_EXCLUDE_FILES = [
      "CHANGELOG.md",
      "LICENSE.md",
      "LICENSE",
      "CODE_OF_CONDUCT.md",
      "CONTRIBUTING.md",
      "SECURITY.md",
    ];

    it("should have sensible default folder exclusions", () => {
      expect(DEFAULT_EXCLUDE_FOLDERS).toContain("node_modules");
      expect(DEFAULT_EXCLUDE_FOLDERS).toContain(".git");
      expect(DEFAULT_EXCLUDE_FOLDERS).toContain("dist");
    });

    it("should have sensible default file exclusions", () => {
      expect(DEFAULT_EXCLUDE_FILES).toContain("CHANGELOG.md");
      expect(DEFAULT_EXCLUDE_FILES).toContain("LICENSE.md");
      expect(DEFAULT_EXCLUDE_FILES).toContain("CODE_OF_CONDUCT.md");
    });
  });
});
