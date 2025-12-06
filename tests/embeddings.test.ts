import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isOpenAIConfigured,
  prepareTextForEmbedding,
  createEmbeddingText,
} from "../src/lib/embeddings.js";

describe("isOpenAIConfigured", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should return true when OPENAI_API_KEY is set", () => {
    process.env.OPENAI_API_KEY = "sk-test-key";

    expect(isOpenAIConfigured()).toBe(true);
  });

  it("should return false when OPENAI_API_KEY is not set", () => {
    delete process.env.OPENAI_API_KEY;

    expect(isOpenAIConfigured()).toBe(false);
  });

  it("should return false when OPENAI_API_KEY is empty string", () => {
    process.env.OPENAI_API_KEY = "";

    expect(isOpenAIConfigured()).toBe(false);
  });
});

describe("prepareTextForEmbedding", () => {
  it("should return text unchanged when under limit", () => {
    const text = "Short text";

    const result = prepareTextForEmbedding(text);

    expect(result).toBe("Short text");
  });

  it("should truncate text when over default limit", () => {
    const longText = "a".repeat(35000);

    const result = prepareTextForEmbedding(longText);

    expect(result.length).toBe(30003); // 30000 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("should truncate text when over custom limit", () => {
    const text = "This is a longer text that should be truncated";

    const result = prepareTextForEmbedding(text, 20);

    expect(result.length).toBe(23); // 20 + "..."
    expect(result).toBe("This is a longer tex...");
  });

  it("should not truncate text exactly at limit", () => {
    const text = "a".repeat(100);

    const result = prepareTextForEmbedding(text, 100);

    expect(result).toBe(text);
    expect(result.length).toBe(100);
  });
});

describe("createEmbeddingText", () => {
  it("should combine title, description, and content", () => {
    const result = createEmbeddingText(
      "Getting Started",
      "Learn how to get started with the library",
      "Step 1: Install the package\nStep 2: Import it"
    );

    expect(result).toContain("Getting Started");
    expect(result).toContain("Learn how to get started with the library");
    expect(result).toContain("Step 1: Install the package");
    expect(result).toContain("\n\n"); // Parts should be separated by double newlines
  });

  it("should handle null description", () => {
    const result = createEmbeddingText(
      "API Reference",
      null,
      "function doSomething() {}"
    );

    expect(result).toContain("API Reference");
    expect(result).toContain("function doSomething() {}");
    expect(result).not.toContain("null");
  });

  it("should handle empty description", () => {
    const result = createEmbeddingText("Title", "", "Content here");

    // Empty string is falsy, so it should be omitted
    expect(result).toBe("Title\n\nContent here");
  });

  it("should truncate combined text if too long", () => {
    const longContent = "x".repeat(35000);

    const result = createEmbeddingText("Title", "Description", longContent);

    expect(result.length).toBe(30003); // 30000 + "..."
    expect(result.endsWith("...")).toBe(true);
  });

  it("should preserve order: title, description, content", () => {
    const result = createEmbeddingText("AAA", "BBB", "CCC");

    const aIndex = result.indexOf("AAA");
    const bIndex = result.indexOf("BBB");
    const cIndex = result.indexOf("CCC");

    expect(aIndex).toBeLessThan(bIndex);
    expect(bIndex).toBeLessThan(cIndex);
  });
});
