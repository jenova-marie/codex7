/**
 * Unit tests for the Context7 API client
 * Tests searchLibraries and fetchLibraryDocumentation functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchLibraries, fetchLibraryDocumentation } from "../src/lib/api.js";

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the encryption module
vi.mock("../src/lib/encryption.js", () => ({
  generateHeaders: vi.fn().mockReturnValue({
    "Content-Type": "application/json",
    "X-Client-IP": "127.0.0.1",
  }),
}));

describe("api module", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("searchLibraries", () => {
    it("should return search results on success", async () => {
      const mockResults = {
        results: [
          { id: "/vercel/next.js", title: "Next.js", description: "React framework" },
          { id: "/facebook/react", title: "React", description: "UI library" },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults),
      });

      const response = await searchLibraries("react");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(response.results).toHaveLength(2);
      expect(response.results[0].id).toBe("/vercel/next.js");
    });

    it("should include query parameter in URL", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });

      await searchLibraries("testing library");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("query=testing+library"),
        }),
        expect.any(Object)
      );
    });

    it("should handle 429 rate limit error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const response = await searchLibraries("test");

      expect(response.results).toHaveLength(0);
      expect(response.error).toContain("Rate limited");
    });

    it("should handle 401 unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const response = await searchLibraries("test", undefined, "invalid-key");

      expect(response.results).toHaveLength(0);
      expect(response.error).toContain("Unauthorized");
      expect(response.error).toContain("invalid-key");
    });

    it("should handle generic HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const response = await searchLibraries("test");

      expect(response.results).toHaveLength(0);
      expect(response.error).toContain("500");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const response = await searchLibraries("test");

      expect(response.results).toHaveLength(0);
      expect(response.error).toContain("Error searching libraries");
    });

    it("should pass clientIp and apiKey to generateHeaders", async () => {
      const { generateHeaders } = await import("../src/lib/encryption.js");

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      });

      await searchLibraries("test", "192.168.1.1", "ctx7sk-test-key");

      expect(generateHeaders).toHaveBeenCalledWith("192.168.1.1", "ctx7sk-test-key");
    });
  });

  describe("fetchLibraryDocumentation", () => {
    it("should return documentation text on success", async () => {
      const mockDocs = "# Library Documentation\n\nThis is the documentation.";

      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(mockDocs),
      });

      const result = await fetchLibraryDocumentation("/vercel/next.js");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockDocs);
    });

    it("should strip leading slash from libraryId", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("docs"),
      });

      await fetchLibraryDocumentation("/vercel/next.js");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("vercel/next.js"),
        }),
        expect.any(Object)
      );
      // Should not have double slashes
      const url = mockFetch.mock.calls[0][0];
      expect(url.href).not.toContain("//vercel");
    });

    it("should include tokens parameter when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("docs"),
      });

      await fetchLibraryDocumentation("vercel/next.js", { tokens: 5000 });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("tokens=5000"),
        }),
        expect.any(Object)
      );
    });

    it("should include topic parameter when provided", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("docs"),
      });

      await fetchLibraryDocumentation("vercel/next.js", { topic: "routing" });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("topic=routing"),
        }),
        expect.any(Object)
      );
    });

    it("should always include type=txt parameter", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("docs"),
      });

      await fetchLibraryDocumentation("vercel/next.js");

      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          href: expect.stringContaining("type=txt"),
        }),
        expect.any(Object)
      );
    });

    it("should handle 429 rate limit error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const result = await fetchLibraryDocumentation("vercel/next.js");

      expect(result).toContain("Rate limited");
    });

    it("should handle 404 not found error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await fetchLibraryDocumentation("nonexistent/lib");

      expect(result).toContain("does not exist");
    });

    it("should handle 401 unauthorized error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const result = await fetchLibraryDocumentation("vercel/next.js", {}, undefined, "bad-key");

      expect(result).toContain("Unauthorized");
    });

    it("should handle generic HTTP errors", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 503,
      });

      const result = await fetchLibraryDocumentation("vercel/next.js");

      expect(result).toContain("503");
    });

    it("should handle network errors", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"));

      const result = await fetchLibraryDocumentation("vercel/next.js");

      expect(result).toContain("Error fetching library documentation");
    });

    it("should return null for 'No content available' response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("No content available"),
      });

      const result = await fetchLibraryDocumentation("vercel/next.js");

      expect(result).toBeNull();
    });

    it("should return null for 'No context data available' response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("No context data available"),
      });

      const result = await fetchLibraryDocumentation("vercel/next.js");

      expect(result).toBeNull();
    });

    it("should return null for empty response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve(""),
      });

      const result = await fetchLibraryDocumentation("vercel/next.js");

      expect(result).toBeNull();
    });

    it("should pass both tokens and topic options", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        text: () => Promise.resolve("docs"),
      });

      await fetchLibraryDocumentation("vercel/next.js", {
        tokens: 10000,
        topic: "data fetching",
      });

      const url = mockFetch.mock.calls[0][0];
      expect(url.href).toContain("tokens=10000");
      expect(url.href).toContain("topic=data+fetching");
    });
  });
});
