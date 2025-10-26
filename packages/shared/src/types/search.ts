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
 * 🔍 Search-related type definitions
 */

/**
 * Search query options
 */
export interface SearchOptions {
  /** Search query text */
  query: string;

  /** Filter by library identifier */
  library?: string;

  /** Filter by version */
  version?: string;

  /** Filter by source type */
  sourceType?: string;

  /** Filter by language */
  language?: string;

  /** Maximum number of results */
  limit?: number;

  /** Result offset for pagination */
  offset?: number;

  /** Minimum relevance score (0-1) */
  minScore?: number;

  /** Filter by tags */
  tags?: string[];

  /** Whether to include code snippets only */
  codeOnly?: boolean;
}

/**
 * Search result with relevance scoring
 */
export interface SearchResult {
  /** Document that matched */
  document: {
    id: string;
    title: string;
    content: string;
    url?: string;
    metadata: Record<string, unknown>;
  };

  /** Library information */
  library: {
    name: string;
    identifier: string;
    version: string;
  };

  /** Relevance score (0-1) */
  score: number;

  /** Highlighted content (if available) */
  highlights?: string[];
}

/**
 * Paginated search response
 */
export interface SearchResponse {
  /** Search results */
  results: SearchResult[];

  /** Total number of matching documents */
  total: number;

  /** Current offset */
  offset: number;

  /** Results per page */
  limit: number;

  /** Query metadata */
  metadata: {
    /** Query processing time (ms) */
    processingTime: number;

    /** Whether results were reranked by LLM */
    reranked: boolean;

    /** Search strategy used */
    strategy: 'vector' | 'fulltext' | 'hybrid';
  };
}

/**
 * Vector similarity search parameters
 */
export interface VectorSearchParams {
  /** Query vector embedding */
  embedding: number[];

  /** Number of results to return */
  k: number;

  /** Optional filters */
  filter?: {
    library?: string;
    version?: string;
    sourceType?: string;
    metadata?: Record<string, unknown>;
  };

  /** Similarity threshold (0-1) */
  threshold?: number;
}
