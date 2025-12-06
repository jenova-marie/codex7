import { describe, it, expect } from "vitest";
import { formatSearchResult, formatSearchResults } from "../src/lib/utils.js";
import { SearchResult, SearchResponse } from "../src/lib/types.js";

describe("formatSearchResult", () => {
  it("should format a basic search result with required fields", () => {
    const result: SearchResult = {
      id: "/vercel/next.js",
      title: "Next.js",
      description: "The React Framework for Production",
      branch: "main",
      lastUpdateDate: "2024-01-15",
      state: "finalized",
      totalTokens: 50000,
      totalSnippets: 100,
      totalPages: 50,
      trustScore: 9.5,
    };

    const formatted = formatSearchResult(result);

    expect(formatted).toContain("Title: Next.js");
    expect(formatted).toContain("Codex7-compatible library ID: /vercel/next.js");
    expect(formatted).toContain("Description: The React Framework for Production");
    expect(formatted).toContain("Code Snippets: 100");
    expect(formatted).toContain("Trust Score: 9.5");
  });

  it("should omit code snippets when value is -1", () => {
    const result: SearchResult = {
      id: "/test/lib",
      title: "Test Lib",
      description: "A test library",
      branch: "main",
      lastUpdateDate: "2024-01-15",
      state: "finalized",
      totalTokens: 1000,
      totalSnippets: -1,
      totalPages: 10,
      trustScore: 8,
    };

    const formatted = formatSearchResult(result);

    expect(formatted).not.toContain("Code Snippets");
    expect(formatted).toContain("Trust Score: 8");
  });

  it("should omit trust score when value is -1", () => {
    const result: SearchResult = {
      id: "/test/lib",
      title: "Test Lib",
      description: "A test library",
      branch: "main",
      lastUpdateDate: "2024-01-15",
      state: "finalized",
      totalTokens: 1000,
      totalSnippets: 50,
      totalPages: 10,
      trustScore: -1,
    };

    const formatted = formatSearchResult(result);

    expect(formatted).toContain("Code Snippets: 50");
    expect(formatted).not.toContain("Trust Score");
  });

  it("should include versions when present", () => {
    const result: SearchResult = {
      id: "/test/lib",
      title: "Test Lib",
      description: "A test library",
      branch: "main",
      lastUpdateDate: "2024-01-15",
      state: "finalized",
      totalTokens: 1000,
      totalSnippets: 50,
      totalPages: 10,
      trustScore: 8,
      versions: ["/test/lib/v1.0.0", "/test/lib/v2.0.0"],
    };

    const formatted = formatSearchResult(result);

    expect(formatted).toContain("Versions: /test/lib/v1.0.0, /test/lib/v2.0.0");
  });

  it("should omit versions when array is empty", () => {
    const result: SearchResult = {
      id: "/test/lib",
      title: "Test Lib",
      description: "A test library",
      branch: "main",
      lastUpdateDate: "2024-01-15",
      state: "finalized",
      totalTokens: 1000,
      totalSnippets: 50,
      totalPages: 10,
      trustScore: 8,
      versions: [],
    };

    const formatted = formatSearchResult(result);

    expect(formatted).not.toContain("Versions");
  });
});

describe("formatSearchResults", () => {
  it("should return message when no results", () => {
    const response: SearchResponse = { results: [] };

    const formatted = formatSearchResults(response);

    expect(formatted).toBe("No documentation libraries found matching your query.");
  });

  it("should return message when results is undefined", () => {
    const response: SearchResponse = { results: undefined as unknown as SearchResult[] };

    const formatted = formatSearchResults(response);

    expect(formatted).toBe("No documentation libraries found matching your query.");
  });

  it("should format multiple results with separator", () => {
    const response: SearchResponse = {
      results: [
        {
          id: "/vercel/next.js",
          title: "Next.js",
          description: "React framework",
          branch: "main",
          lastUpdateDate: "2024-01-15",
          state: "finalized",
          totalTokens: 50000,
          totalSnippets: 100,
          totalPages: 50,
          trustScore: 9,
        },
        {
          id: "/facebook/react",
          title: "React",
          description: "UI library",
          branch: "main",
          lastUpdateDate: "2024-01-15",
          state: "finalized",
          totalTokens: 40000,
          totalSnippets: 80,
          totalPages: 40,
          trustScore: 10,
        },
      ],
    };

    const formatted = formatSearchResults(response);

    expect(formatted).toContain("Next.js");
    expect(formatted).toContain("React");
    expect(formatted).toContain("----------");
  });

  it("should include error message in response", () => {
    const response: SearchResponse = {
      results: [],
      error: "Rate limit exceeded",
    };

    const formatted = formatSearchResults(response);

    expect(formatted).toBe("No documentation libraries found matching your query.");
  });
});
