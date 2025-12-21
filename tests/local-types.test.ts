/**
 * Unit tests for local-types module
 * Tests the LOCAL_STORAGE path utilities
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LOCAL_STORAGE } from "../src/lib/local-types.js";

describe("local-types module", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("LOCAL_STORAGE", () => {
    describe("baseDir", () => {
      it("should use HOME environment variable", () => {
        process.env.HOME = "/home/testuser";
        process.env.USERPROFILE = undefined;

        const result = LOCAL_STORAGE.baseDir();

        expect(result).toBe("/home/testuser/.codex7");
      });

      it("should fallback to USERPROFILE on Windows", () => {
        process.env.HOME = undefined;
        process.env.USERPROFILE = "C:\\Users\\testuser";

        const result = LOCAL_STORAGE.baseDir();

        expect(result).toBe("C:\\Users\\testuser/.codex7");
      });

      it("should fallback to ~ when no env vars set", () => {
        process.env.HOME = undefined;
        process.env.USERPROFILE = undefined;

        const result = LOCAL_STORAGE.baseDir();

        expect(result).toBe("~/.codex7");
      });

      it("should prefer HOME over USERPROFILE", () => {
        process.env.HOME = "/home/preferred";
        process.env.USERPROFILE = "C:\\Users\\fallback";

        const result = LOCAL_STORAGE.baseDir();

        expect(result).toBe("/home/preferred/.codex7");
      });
    });

    describe("indexPath", () => {
      it("should return path to index.json", () => {
        process.env.HOME = "/home/testuser";

        const result = LOCAL_STORAGE.indexPath();

        expect(result).toBe("/home/testuser/.codex7/index.json");
      });

      it("should be based on baseDir", () => {
        process.env.HOME = "/custom/path";

        const result = LOCAL_STORAGE.indexPath();

        expect(result).toContain(LOCAL_STORAGE.baseDir());
        expect(result.endsWith("/index.json")).toBe(true);
      });
    });

    describe("docsDir", () => {
      it("should return path to docs directory", () => {
        process.env.HOME = "/home/testuser";

        const result = LOCAL_STORAGE.docsDir();

        expect(result).toBe("/home/testuser/.codex7/docs");
      });

      it("should be based on baseDir", () => {
        process.env.HOME = "/custom/path";

        const result = LOCAL_STORAGE.docsDir();

        expect(result).toContain(LOCAL_STORAGE.baseDir());
        expect(result.endsWith("/docs")).toBe(true);
      });
    });

    describe("libraryDocsPath", () => {
      it("should return path to library docs.md", () => {
        process.env.HOME = "/home/testuser";

        const result = LOCAL_STORAGE.libraryDocsPath("/vercel/next.js");

        expect(result).toBe("/home/testuser/.codex7/docs/vercel/next.js/docs.md");
      });

      it("should strip leading slash from libraryId", () => {
        process.env.HOME = "/home/testuser";

        const withSlash = LOCAL_STORAGE.libraryDocsPath("/org/project");
        const withoutSlash = LOCAL_STORAGE.libraryDocsPath("org/project");

        expect(withSlash).toBe(withoutSlash);
        expect(withSlash).not.toContain("//");
      });

      it("should handle library IDs without leading slash", () => {
        process.env.HOME = "/home/testuser";

        const result = LOCAL_STORAGE.libraryDocsPath("facebook/react");

        expect(result).toBe("/home/testuser/.codex7/docs/facebook/react/docs.md");
      });

      it("should handle nested library IDs", () => {
        process.env.HOME = "/home/testuser";

        const result = LOCAL_STORAGE.libraryDocsPath("/org/nested/project");

        expect(result).toBe("/home/testuser/.codex7/docs/org/nested/project/docs.md");
      });

      it("should be based on docsDir", () => {
        process.env.HOME = "/custom/path";

        const result = LOCAL_STORAGE.libraryDocsPath("test/lib");

        expect(result).toContain(LOCAL_STORAGE.docsDir());
        expect(result.endsWith("/docs.md")).toBe(true);
      });
    });
  });
});
