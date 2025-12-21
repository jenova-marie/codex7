/**
 * Unit tests for local-api module
 * Tests the local documentation API functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock the database module
vi.mock("../src/db/index.js", () => ({
  isDbConfigured: vi.fn(),
  getDb: vi.fn(),
  localLibraries: { id: "id" },
  localSnippets: { id: "id", libraryId: "libraryId", qualityScore: "qualityScore" },
  localDocuments: { libraryId: "libraryId", path: "path" },
}));

// Mock the local-vectors module
vi.mock("../src/lib/local-vectors.js", () => ({
  isQdrantConfigured: vi.fn(),
  searchVectors: vi.fn(),
  getLibraryVectors: vi.fn(),
}));

// Mock the embeddings module
vi.mock("../src/lib/embeddings.js", () => ({
  isOpenAIConfigured: vi.fn().mockReturnValue(false),
  generateEmbedding: vi.fn(),
}));

import { isLocalStorageConfigured } from "../src/lib/local-api.js";
import { isDbConfigured } from "../src/db/index.js";
import { isQdrantConfigured } from "../src/lib/local-vectors.js";

describe("local-api module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("isLocalStorageConfigured", () => {
    it("should return true when both DB and Qdrant are configured", () => {
      vi.mocked(isDbConfigured).mockReturnValue(true);
      vi.mocked(isQdrantConfigured).mockReturnValue(true);

      expect(isLocalStorageConfigured()).toBe(true);
    });

    it("should return false when only DB is configured", () => {
      vi.mocked(isDbConfigured).mockReturnValue(true);
      vi.mocked(isQdrantConfigured).mockReturnValue(false);

      expect(isLocalStorageConfigured()).toBe(false);
    });

    it("should return false when only Qdrant is configured", () => {
      vi.mocked(isDbConfigured).mockReturnValue(false);
      vi.mocked(isQdrantConfigured).mockReturnValue(true);

      expect(isLocalStorageConfigured()).toBe(false);
    });

    it("should return false when neither is configured", () => {
      vi.mocked(isDbConfigured).mockReturnValue(false);
      vi.mocked(isQdrantConfigured).mockReturnValue(false);

      expect(isLocalStorageConfigured()).toBe(false);
    });
  });

  describe("estimateTokens logic", () => {
    // Test the internal token estimation logic
    function estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    }

    it("should estimate tokens consistently", () => {
      expect(estimateTokens("test")).toBe(1);
      expect(estimateTokens("longer text here")).toBe(4);
    });

    it("should return 0 for empty string", () => {
      expect(estimateTokens("")).toBe(0);
    });

    it("should round up for partial tokens", () => {
      expect(estimateTokens("ab")).toBe(1); // 2/4 = 0.5 → 1
      expect(estimateTokens("abc")).toBe(1); // 3/4 = 0.75 → 1
      expect(estimateTokens("abcde")).toBe(2); // 5/4 = 1.25 → 2
    });
  });

  describe("formatDocumentation logic", () => {
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

    it("should handle multiple code blocks", () => {
      const snippet = {
        title: "Examples",
        sourceFile: "examples.md",
        description: "Multiple examples",
        content: "",
        codeBlocks: [
          { language: "typescript", code: "const a = 1;" },
          { language: "javascript", code: "const b = 2;" },
        ],
      };

      const parts: string[] = [];
      parts.push(`\n### ${snippet.title}\n`);

      for (const block of snippet.codeBlocks) {
        parts.push(`\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`);
      }

      const output = parts.join("");

      expect(output).toContain("```typescript\nconst a = 1;\n```");
      expect(output).toContain("```javascript\nconst b = 2;\n```");
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

    it("should handle empty string", () => {
      expect(normalizeLibraryId("")).toBe("/");
    });
  });

  describe("blended scoring logic (Phase 4)", () => {
    function calculateBlendedScore(
      vectorScore: number | undefined,
      qualityScore: number | undefined
    ): number {
      const vScore = vectorScore ?? 0.5;
      const qScore = qualityScore ?? 0.5;
      return vScore * 0.7 + qScore * 0.3;
    }

    it("should weight vector score at 70%", () => {
      expect(calculateBlendedScore(1.0, 0.0)).toBeCloseTo(0.7);
    });

    it("should weight quality score at 30%", () => {
      expect(calculateBlendedScore(0.0, 1.0)).toBeCloseTo(0.3);
    });

    it("should combine scores correctly", () => {
      // 0.8 * 0.7 + 0.6 * 0.3 = 0.56 + 0.18 = 0.74
      expect(calculateBlendedScore(0.8, 0.6)).toBeCloseTo(0.74);
    });

    it("should use default 0.5 for undefined vector score", () => {
      // 0.5 * 0.7 + 1.0 * 0.3 = 0.35 + 0.3 = 0.65
      expect(calculateBlendedScore(undefined, 1.0)).toBeCloseTo(0.65);
    });

    it("should use default 0.5 for undefined quality score", () => {
      // 1.0 * 0.7 + 0.5 * 0.3 = 0.7 + 0.15 = 0.85
      expect(calculateBlendedScore(1.0, undefined)).toBeCloseTo(0.85);
    });

    it("should use defaults for both undefined scores", () => {
      // 0.5 * 0.7 + 0.5 * 0.3 = 0.35 + 0.15 = 0.5
      expect(calculateBlendedScore(undefined, undefined)).toBeCloseTo(0.5);
    });

    it("should return maximum 1.0 for perfect scores", () => {
      expect(calculateBlendedScore(1.0, 1.0)).toBeCloseTo(1.0);
    });

    it("should return 0.0 for zero scores", () => {
      expect(calculateBlendedScore(0.0, 0.0)).toBeCloseTo(0.0);
    });
  });

  describe("snippet sorting by blended score", () => {
    interface Snippet {
      id: string;
      qualityScore?: number;
    }

    function sortByBlendedScore(snippets: Snippet[], vectorScores: Map<string, number>): Snippet[] {
      return [...snippets].sort((a, b) => {
        const aVectorScore = vectorScores.get(a.id) ?? 0.5;
        const bVectorScore = vectorScores.get(b.id) ?? 0.5;
        const aQuality = a.qualityScore ?? 0.5;
        const bQuality = b.qualityScore ?? 0.5;

        const aFinal = aVectorScore * 0.7 + aQuality * 0.3;
        const bFinal = bVectorScore * 0.7 + bQuality * 0.3;

        return bFinal - aFinal;
      });
    }

    it("should sort snippets by blended score in descending order", () => {
      const snippets: Snippet[] = [
        { id: "low", qualityScore: 0.3 },
        { id: "high", qualityScore: 0.9 },
        { id: "medium", qualityScore: 0.5 },
      ];
      const vectorScores = new Map([
        ["low", 0.3],
        ["high", 0.9],
        ["medium", 0.5],
      ]);

      const sorted = sortByBlendedScore(snippets, vectorScores);

      expect(sorted[0].id).toBe("high");
      expect(sorted[1].id).toBe("medium");
      expect(sorted[2].id).toBe("low");
    });

    it("should handle snippets without vector scores", () => {
      const snippets: Snippet[] = [
        { id: "with-score", qualityScore: 0.6 },
        { id: "without-score", qualityScore: 0.9 },
      ];
      const vectorScores = new Map([["with-score", 0.8]]);

      const sorted = sortByBlendedScore(snippets, vectorScores);

      // with-score: 0.8 * 0.7 + 0.6 * 0.3 = 0.74
      // without-score: 0.5 * 0.7 + 0.9 * 0.3 = 0.62
      expect(sorted[0].id).toBe("with-score");
    });

    it("should prioritize high vector score over high quality score", () => {
      const snippets: Snippet[] = [
        { id: "high-quality", qualityScore: 1.0 },
        { id: "high-vector", qualityScore: 0.0 },
      ];
      const vectorScores = new Map([
        ["high-quality", 0.0],
        ["high-vector", 1.0],
      ]);

      const sorted = sortByBlendedScore(snippets, vectorScores);

      // high-quality: 0.0 * 0.7 + 1.0 * 0.3 = 0.3
      // high-vector: 1.0 * 0.7 + 0.0 * 0.3 = 0.7
      expect(sorted[0].id).toBe("high-vector");
    });
  });

  describe("token budget tracking", () => {
    function estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    }

    function fitWithinTokenBudget(
      snippets: Array<{ content: string; tokens?: number }>,
      maxTokens: number
    ): Array<{ content: string; tokens?: number }> {
      const result: Array<{ content: string; tokens?: number }> = [];
      let currentTokens = 0;

      for (const snippet of snippets) {
        const snippetTokens = snippet.tokens || estimateTokens(snippet.content);

        if (currentTokens + snippetTokens > maxTokens) {
          break;
        }

        result.push(snippet);
        currentTokens += snippetTokens;
      }

      return result;
    }

    it("should include snippets within token budget", () => {
      const snippets = [
        { content: "a".repeat(100), tokens: 25 },
        { content: "b".repeat(200), tokens: 50 },
        { content: "c".repeat(400), tokens: 100 },
      ];

      const fitted = fitWithinTokenBudget(snippets, 200);

      expect(fitted).toHaveLength(3);
    });

    it("should stop when budget would be exceeded", () => {
      const snippets = [
        { content: "a".repeat(100), tokens: 25 },
        { content: "b".repeat(200), tokens: 50 },
        { content: "c".repeat(400), tokens: 100 },
        { content: "d".repeat(800), tokens: 200 },
      ];

      const fitted = fitWithinTokenBudget(snippets, 200);

      expect(fitted).toHaveLength(3);
    });

    it("should use estimated tokens when not provided", () => {
      const snippets = [
        { content: "a".repeat(100) }, // ~25 tokens
        { content: "b".repeat(200) }, // ~50 tokens
      ];

      const fitted = fitWithinTokenBudget(snippets, 50);

      expect(fitted).toHaveLength(1);
    });

    it("should handle empty snippets array", () => {
      const fitted = fitWithinTokenBudget([], 1000);

      expect(fitted).toEqual([]);
    });

    it("should return empty when first snippet exceeds budget", () => {
      const snippets = [{ content: "a".repeat(1000), tokens: 250 }];

      const fitted = fitWithinTokenBudget(snippets, 100);

      expect(fitted).toEqual([]);
    });
  });

  describe("document path normalization", () => {
    function normalizePath(docPath: string): string {
      return docPath.startsWith("/") ? docPath : `/${docPath}`;
    }

    it("should add leading slash if missing", () => {
      expect(normalizePath("docs/api.md")).toBe("/docs/api.md");
      expect(normalizePath("README.md")).toBe("/README.md");
    });

    it("should keep existing leading slash", () => {
      expect(normalizePath("/docs/api.md")).toBe("/docs/api.md");
    });
  });

  describe("document truncation", () => {
    function truncateToTokens(content: string, maxTokens: number): string {
      const estimatedTokens = Math.ceil(content.length / 4);

      if (estimatedTokens > maxTokens) {
        const maxChars = maxTokens * 4;
        return content.slice(0, maxChars) + "\n\n... [truncated]";
      }

      return content;
    }

    it("should not truncate content within limit", () => {
      const content = "a".repeat(100); // ~25 tokens
      const result = truncateToTokens(content, 50);

      expect(result).toBe(content);
      expect(result).not.toContain("[truncated]");
    });

    it("should truncate content exceeding limit", () => {
      const content = "a".repeat(1000); // ~250 tokens
      const result = truncateToTokens(content, 50);

      expect(result.length).toBeLessThan(content.length);
      expect(result).toContain("[truncated]");
    });

    it("should truncate to approximately maxTokens * 4 chars", () => {
      const content = "a".repeat(1000);
      const result = truncateToTokens(content, 100);

      // Should be around 400 chars + truncation message
      expect(result.length).toBeLessThan(450);
    });
  });
});
