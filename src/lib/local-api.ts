/**
 * Local documentation API
 * Provides search and retrieval for locally indexed libraries
 */

import { eq, like, or, sql } from "drizzle-orm";
import { getDb, localLibraries, localSnippets, isDbConfigured } from "../db/index.js";
import {
  searchVectors,
  getLibraryVectors,
  isQdrantConfigured,
} from "./local-vectors.js";
import { generateEmbedding, isOpenAIConfigured } from "./embeddings.js";
import { SearchResult, SearchResponse } from "./types.js";

/**
 * Check if local storage is fully configured
 */
export function isLocalStorageConfigured(): boolean {
  return isDbConfigured() && isQdrantConfigured();
}

/**
 * Search local libraries by name/keywords
 * Returns results in the same format as the remote API
 */
export async function searchLocalLibraries(query: string): Promise<SearchResponse> {
  if (!isDbConfigured()) {
    return { results: [] };
  }

  try {
    const db = getDb();
    const searchTerm = `%${query.toLowerCase()}%`;

    // Search by title, package name, description, and keywords
    const libraries = await db
      .select()
      .from(localLibraries)
      .where(
        or(
          sql`LOWER(${localLibraries.title}) LIKE ${searchTerm}`,
          sql`LOWER(${localLibraries.packageName}) LIKE ${searchTerm}`,
          sql`LOWER(${localLibraries.description}) LIKE ${searchTerm}`,
          sql`${searchTerm} = ANY(${localLibraries.keywords})`
        )
      )
      .limit(10);

    const results: SearchResult[] = libraries.map((lib) => ({
      id: lib.id,
      title: lib.title,
      description: lib.description || "",
      branch: lib.branch || "main",
      lastUpdateDate: lib.updatedAt?.toISOString() || new Date().toISOString(),
      state: "finalized" as const,
      totalTokens: lib.totalTokens || 0,
      totalSnippets: lib.totalSnippets || 0,
      totalPages: lib.totalPages || 0,
      trustScore: lib.trustScore || 10,
      tool: "get-local-docs" as const,
      source: "local" as const,
    }));

    return { results };
  } catch (error) {
    console.error(`Local library search failed: ${error}`);
    return { results: [] };
  }
}

/**
 * Check if a library exists locally
 */
export async function isLocalLibrary(libraryId: string): Promise<boolean> {
  if (!isDbConfigured()) {
    return false;
  }

  try {
    const db = getDb();
    const cleanId = libraryId.startsWith("/") ? libraryId : `/${libraryId}`;

    const [lib] = await db
      .select({ id: localLibraries.id })
      .from(localLibraries)
      .where(eq(localLibraries.id, cleanId))
      .limit(1);

    return !!lib;
  } catch (error) {
    console.error(`Failed to check local library: ${error}`);
    return false;
  }
}

/**
 * Fetch documentation for a local library
 * Uses semantic search with topic if provided, otherwise returns top snippets
 */
export async function fetchLocalDocumentation(
  libraryId: string,
  options: {
    tokens?: number;
    topic?: string;
  } = {}
): Promise<string | null> {
  if (!isLocalStorageConfigured()) {
    return null;
  }

  try {
    const db = getDb();
    const cleanId = libraryId.startsWith("/") ? libraryId : `/${libraryId}`;
    const maxTokens = options.tokens || 5000;

    // Get library metadata
    const [lib] = await db
      .select()
      .from(localLibraries)
      .where(eq(localLibraries.id, cleanId))
      .limit(1);

    if (!lib) {
      return null;
    }

    let snippetIds: string[] = [];

    // If topic provided and OpenAI is configured, use semantic search
    if (options.topic && isOpenAIConfigured()) {
      try {
        const queryVector = await generateEmbedding(options.topic);
        const vectorResults = await searchVectors(queryVector, cleanId, 30);

        snippetIds = vectorResults.map((r) => r.payload.snippet_id);
      } catch (error) {
        console.error(`Semantic search failed, falling back: ${error}`);
      }
    }

    // If no semantic results, get all snippets for the library
    if (snippetIds.length === 0) {
      const vectorResults = await getLibraryVectors(cleanId, 50);
      snippetIds = vectorResults.map((r) => r.payload.snippet_id);
    }

    // Fetch snippets from database
    let snippets;
    if (snippetIds.length > 0) {
      snippets = await db
        .select()
        .from(localSnippets)
        .where(
          sql`${localSnippets.id} IN ${snippetIds}`
        );

      // Sort by the order from vector search
      const idOrder = new Map(snippetIds.map((id, idx) => [id, idx]));
      snippets.sort((a, b) => (idOrder.get(a.id) ?? 999) - (idOrder.get(b.id) ?? 999));
    } else {
      // Fallback: get snippets directly from database
      snippets = await db
        .select()
        .from(localSnippets)
        .where(eq(localSnippets.libraryId, cleanId))
        .limit(30);
    }

    if (snippets.length === 0) {
      return null;
    }

    // Format output similar to Context7
    const output = formatDocumentation(lib, snippets, maxTokens);

    return output;
  } catch (error) {
    console.error(`Failed to fetch local documentation: ${error}`);
    return null;
  }
}

/**
 * Format snippets into Context7-style documentation output
 */
function formatDocumentation(
  library: typeof localLibraries.$inferSelect,
  snippets: Array<typeof localSnippets.$inferSelect>,
  maxTokens: number
): string {
  const parts: string[] = [];

  // Header with library info
  parts.push(`# ${library.title}\n`);
  if (library.description) {
    parts.push(`${library.description}\n`);
  }

  // Add rules/best practices if present
  if (library.rules && library.rules.length > 0) {
    parts.push(`\n## Best Practices\n`);
    parts.push(`When using this library, follow these guidelines:\n`);
    for (const rule of library.rules) {
      parts.push(`- ${rule}\n`);
    }
  }

  let currentTokens = estimateTokens(parts.join("\n"));

  // Add snippets until we hit token limit
  for (const snippet of snippets) {
    const snippetTokens = snippet.tokens || estimateTokens(snippet.content);

    if (currentTokens + snippetTokens > maxTokens) {
      break;
    }

    parts.push(`\n### ${snippet.title}\n`);
    parts.push(`Source: ${snippet.sourceFile}\n`);

    if (snippet.description) {
      parts.push(`\n${snippet.description}\n`);
    }

    // Add code blocks
    const codeBlocks = snippet.codeBlocks as Array<{ language: string; code: string }> | null;
    if (codeBlocks && codeBlocks.length > 0) {
      for (const block of codeBlocks) {
        parts.push(`\n\`\`\`${block.language}\n${block.code}\n\`\`\`\n`);
      }
    } else if (snippet.content) {
      // If no code blocks extracted, show content directly
      parts.push(`\n${snippet.content}\n`);
    }

    parts.push("\n--------------------------------\n");

    currentTokens += snippetTokens;
  }

  return parts.join("");
}

/**
 * Estimate token count
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
