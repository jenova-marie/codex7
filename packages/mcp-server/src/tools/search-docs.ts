/**
 * Codex7 - MCP Server Implementation
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
 * 🔍 search-documentation Tool (Codex7 Extension)
 *
 * Extended tool for cross-library documentation search.
 * STUB: Returns placeholder search results (Phase 0)
 */

import type { StorageAdapter } from '@codex7/shared';
import { logger } from '../utils/logger.js';

/**
 * Tool schema for search-documentation
 */
export const searchDocsTool = {
  name: 'search-documentation',
  description:
    'Search across all indexed documentation. Supports filtering by library, version, and document type.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for documentation content',
      },
      filters: {
        type: 'object',
        description: 'Optional filters for narrowing results',
        properties: {
          library: {
            type: 'string',
            description: 'Filter by library identifier (e.g., "/facebook/react")',
          },
          version: {
            type: 'string',
            description: 'Filter by specific version',
          },
          docType: {
            type: 'string',
            description: 'Filter by document type (readme, guide, api-reference)',
          },
        },
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results to return (default: 10)',
        default: 10,
      },
    },
    required: ['query'],
  },
};

/**
 * Tool handler for search-documentation
 *
 * Searches across all indexed libraries for relevant documentation.
 * This is a Codex7 extension beyond Context7's API.
 *
 * Implementation:
 * 1. Use hybrid search across all documentation
 * 2. Apply optional filters (library, version, docType)
 * 3. Rank and limit results
 * 4. Format for display
 */
export async function handleSearchDocs(
  args: {
    query: string;
    filters?: Record<string, unknown>;
    limit?: number;
  },
  storageAdapter: StorageAdapter
) {
  const { query, filters, limit = 10 } = args;

  logger.info(
    {
      query,
      filters,
      limit,
    },
    '🔍 search-documentation called'
  );

  try {
    // Perform hybrid search
    const searchResult = await storageAdapter.hybridSearch({
      query,
      limit,
      library: filters?.library as string | undefined,
      version: filters?.version as string | undefined,
      sourceType: filters?.sourceType as string | undefined,
    });

    if (!searchResult.ok) {
      throw new Error(`Search failed: ${searchResult.error.message}`);
    }

    const searchResults = searchResult.value;
    logger.info({ count: searchResults.length }, '✅ Search completed');

    // Format results for display
    const results = searchResults.map((result) => {
      const doc = result.document;
      return {
        title: doc.title,
        content: doc.content.substring(0, 500) + (doc.content.length > 500 ? '...' : ''), // Truncate long content
        library: result.library,
        score: result.score,
        source_url: doc.url,
        metadata: doc.metadata,
      };
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query,
              results,
              total: results.length,
              filters: filters || {},
              limit,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    logger.error({ error }, '❌ Error in search-documentation');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Internal error',
              message: error instanceof Error ? error.message : 'Unknown error',
              query,
              results: [],
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
