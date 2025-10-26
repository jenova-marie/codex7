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
 * **Phase 0 Implementation:**
 * - ✅ Returns empty stub results
 * - ❌ Does not perform semantic search
 * - ❌ Does not apply filters
 * - ❌ Does not rank results
 */
export async function handleSearchDocs(args: {
  query: string;
  filters?: Record<string, unknown>;
  limit?: number;
}) {
  const { query, filters, limit = 10 } = args;

  logger.info(
    {
      query,
      filters,
      limit,
    },
    '🔍 search-documentation called (STUB)'
  );

  // TODO Phase 1:
  // 1. Generate query embedding
  // 2. Perform semantic search across all libraries
  // 3. Apply filters (library, version, docType)
  // 4. Rank and limit results
  // 5. Format for display

  // STUB: Return empty results with explanation
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            results: [],
            total: 0,
            query,
            filters: filters || {},
            limit,
            _stub: true,
            _message:
              'STUB: Search not implemented yet (Phase 1). This tool will enable cross-library documentation search.',
            _note: 'Phase 1 will return actual search results from vector database',
          },
          null,
          2
        ),
      },
    ],
  };
}
