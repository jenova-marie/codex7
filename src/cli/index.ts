#!/usr/bin/env node

import "dotenv/config";
import { Command } from "commander";
import { indexProject, removeLibrary, listLibraries } from "../lib/local-generator.js";
import { closeDb, isDbConfigured } from "../db/index.js";
import { isQdrantConfigured } from "../lib/local-vectors.js";
import { isOpenAIConfigured } from "../lib/embeddings.js";

const program = new Command();

program
  .name("codex7")
  .description("Codex7 local knowledge management CLI")
  .version("1.0.0");

/**
 * Check required environment variables
 */
function checkEnvironment(): void {
  const missing: string[] = [];

  if (!isDbConfigured()) {
    missing.push("CODEX7_PG_URL");
  }
  if (!isQdrantConfigured()) {
    missing.push("CODEX7_QDRANT_URL");
  }
  if (!isOpenAIConfigured()) {
    missing.push("OPENAI_API_KEY");
  }

  if (missing.length > 0) {
    console.error("Missing required environment variables:");
    for (const v of missing) {
      console.error(`  - ${v}`);
    }
    console.error("\nExample configuration:");
    console.error("  export CODEX7_PG_URL=postgres://user:pass@db.rso:5432/codex7");
    console.error("  export CODEX7_QDRANT_URL=http://qdrant.rso:6333");
    console.error("  export OPENAI_API_KEY=sk-...");
    process.exit(1);
  }
}

/**
 * Index command - index a local project
 */
program
  .command("index <project-path>")
  .description("Index a local project for documentation retrieval")
  .option("--id <library-id>", "Override library ID (format: /org/project)")
  .option("--title <title>", "Override library title")
  .option("--description <desc>", "Override library description")
  .option("--keywords <keywords>", "Comma-separated keywords for search")
  .option("--verbose", "Show detailed output of files being processed")
  .action(async (projectPath: string, options) => {
    checkEnvironment();

    try {
      const keywords = options.keywords
        ? options.keywords.split(",").map((k: string) => k.trim())
        : undefined;

      const result = await indexProject({
        projectPath,
        libraryId: options.id,
        title: options.title,
        description: options.description,
        keywords,
        verbose: options.verbose,
      });

      console.log("\nIndexing complete!");
      console.log(`  Library ID: ${result.libraryId}`);
      console.log(`  Title: ${result.title}`);
      console.log(`  Snippets: ${result.snippetCount}`);
      console.log(`  Tokens: ${result.totalTokens}`);
      console.log(`  Files processed: ${result.processedFiles.length}`);

      if (result.warnings.length > 0) {
        console.log("\nWarnings:");
        for (const warning of result.warnings) {
          console.log(`  - ${warning}`);
        }
      }

      console.log("\nYou can now use this library with codex7 MCP server:");
      console.log(`  resolve-library-id: "${result.title}"`);
      console.log(`  get-library-docs: "${result.libraryId}"`);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });

/**
 * List command - list all indexed libraries
 */
program
  .command("list")
  .description("List all indexed local libraries")
  .action(async () => {
    checkEnvironment();

    try {
      const libraries = await listLibraries();

      if (libraries.length === 0) {
        console.log("No local libraries indexed yet.");
        console.log("Use 'codex7 index <project-path>' to add one.");
        return;
      }

      console.log("Indexed local libraries:\n");

      for (const lib of libraries) {
        console.log(`${lib.id}`);
        console.log(`  Title: ${lib.title}`);
        if (lib.description) {
          console.log(`  Description: ${lib.description.slice(0, 80)}...`);
        }
        console.log(`  Snippets: ${lib.snippetCount}`);
        if (lib.updatedAt) {
          console.log(`  Updated: ${lib.updatedAt.toISOString()}`);
        }
        console.log();
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });

/**
 * Remove command - remove a library from the index
 */
program
  .command("remove <library-id>")
  .description("Remove a library from the local index")
  .action(async (libraryId: string) => {
    checkEnvironment();

    try {
      // Ensure library ID starts with /
      if (!libraryId.startsWith("/")) {
        libraryId = "/" + libraryId;
      }

      const removed = await removeLibrary(libraryId);

      if (removed) {
        console.log(`Removed library: ${libraryId}`);
      } else {
        console.log(`Library not found: ${libraryId}`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });

/**
 * Sync command - re-index an existing library
 */
program
  .command("sync <library-id>")
  .description("Re-index an existing library (updates from source)")
  .option("--verbose", "Show detailed output of files being processed")
  .action(async (libraryId: string, options) => {
    checkEnvironment();

    try {
      // Ensure library ID starts with /
      if (!libraryId.startsWith("/")) {
        libraryId = "/" + libraryId;
      }

      // Get existing library to find source path
      const libraries = await listLibraries();
      const existing = libraries.find((l) => l.id === libraryId);

      if (!existing) {
        console.error(`Library not found: ${libraryId}`);
        console.error("Use 'codex7 list' to see available libraries.");
        process.exit(1);
      }

      // Re-index using the stored source path
      // Note: We need to get the full library record for source path
      const { getDb, localLibraries } = await import("../db/index.js");
      const { eq } = await import("drizzle-orm");
      const db = getDb();

      const [lib] = await db
        .select()
        .from(localLibraries)
        .where(eq(localLibraries.id, libraryId))
        .limit(1);

      if (!lib || !lib.sourcePath) {
        console.error(`Cannot sync: source path not found for ${libraryId}`);
        process.exit(1);
      }

      console.log(`Re-indexing from: ${lib.sourcePath}`);

      const result = await indexProject({
        projectPath: lib.sourcePath,
        libraryId: lib.id,
        title: lib.title,
        description: lib.description || undefined,
        keywords: lib.keywords || undefined,
        verbose: options.verbose,
      });

      console.log("\nSync complete!");
      console.log(`  Snippets: ${result.snippetCount}`);
      console.log(`  Tokens: ${result.totalTokens}`);
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : error}`);
      process.exit(1);
    } finally {
      await closeDb();
    }
  });

// Parse arguments and run
program.parse();
