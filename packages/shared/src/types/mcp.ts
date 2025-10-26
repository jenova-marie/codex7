/**
 * Codex7 - Shared Types, Models, and Utilities
 *
 * Copyright (C) 2025 Jenova Marie and Codex7 Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * 🔌 MCP (Model Context Protocol) type definitions
 */

/**
 * MCP tool: resolve-library-id
 */
export interface ResolveLibraryIdParams {
  /** Library name to search for */
  libraryName: string;
}

export interface ResolveLibraryIdResult {
  /** Matched library ID */
  libraryId: string;

  /** Library name */
  name: string;

  /** Library description */
  description?: string;

  /** Trust score */
  trustScore: number;

  /** Available versions */
  versions: string[];

  /** Match confidence (0-1) */
  confidence: number;
}

/**
 * MCP tool: get-library-docs
 */
export interface GetLibraryDocsParams {
  /** Context7-compatible library ID (e.g., '/vercel/next.js') */
  context7CompatibleLibraryID: string;

  /** Optional topic to focus on */
  topic?: string;

  /** Maximum tokens to return */
  tokens?: number;
}

export interface GetLibraryDocsResult {
  /** Formatted documentation content */
  content: string;

  /** Metadata about the response */
  metadata: {
    /** Library identifier */
    library: string;

    /** Version */
    version: string;

    /** Number of document chunks returned */
    chunksReturned: number;

    /** Total tokens in response */
    totalTokens: number;

    /** Whether results were reranked */
    reranked: boolean;
  };
}

/**
 * MCP tool: search-documentation (extension)
 */
export interface SearchDocumentationParams {
  /** Free-form search query */
  query: string;

  /** Optional library filter */
  library?: string;

  /** Optional version filter */
  version?: string;

  /** Maximum results */
  limit?: number;
}

export interface SearchDocumentationResult {
  /** Search results */
  results: Array<{
    /** Document title */
    title: string;

    /** Document content */
    content: string;

    /** Source URL */
    url?: string;

    /** Library name */
    library: string;

    /** Version */
    version: string;

    /** Relevance score */
    score: number;
  }>;

  /** Total matches found */
  total: number;
}

/**
 * MCP tool: get-library-versions (extension)
 */
export interface GetLibraryVersionsParams {
  /** Library identifier */
  library: string;
}

export interface GetLibraryVersionsResult {
  /** Library name */
  library: string;

  /** Available versions */
  versions: Array<{
    /** Version string */
    version: string;

    /** Release date */
    releaseDate?: string;

    /** Whether this is the latest */
    isLatest: boolean;

    /** Git commit SHA */
    commitSha?: string;
  }>;
}
