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
 * 🔍 resolve-library-id Tool
 *
 * Context7-compatible tool for mapping library names to IDs.
 * STUB: Returns hardcoded placeholder data (Phase 0)
 */

import type { StorageAdapter } from '@codex7/shared';
import { logger } from '../utils/logger.js';

/**
 * Tool schema for resolve-library-id
 */
export const resolveLibraryIdTool = {
  name: 'resolve-library-id',
  description:
    'Map a library name to its Context7-compatible identifier. Returns matching libraries with trust scores and metadata.',
  inputSchema: {
    type: 'object',
    properties: {
      libraryName: {
        type: 'string',
        description: 'Library name to search for (e.g., "react", "next.js", "express")',
      },
    },
    required: ['libraryName'],
  },
};

/**
 * Tool handler for resolve-library-id
 *
 * Maps a library name (e.g., "react", "next.js") to Context7-compatible
 * library identifiers (e.g., "/facebook/react").
 *
 * Implementation:
 * 1. Search libraries by name (case-insensitive fuzzy match)
 * 2. Sort by trust score and relevance
 * 3. Return matching libraries with metadata
 */
export async function handleResolveLibraryId(
  args: { libraryName: string },
  storageAdapter: StorageAdapter
) {
  const { libraryName } = args;

  logger.info({ libraryName }, '🔍 resolve-library-id called');

  try {
    // Search for matching libraries using storage adapter
    const searchResult = await storageAdapter.searchLibraries(libraryName);

    if (!searchResult.ok) {
      logger.error({ error: searchResult.error }, '❌ Library search failed');
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Failed to search libraries',
                message: searchResult.error.message,
                matches: [],
              },
              null,
              2
            ),
          },
        ],
      };
    }

    const libraries = searchResult.value;
    logger.info({ count: libraries.length }, '✅ Found matching libraries');

    // Get versions for each library
    const matches = await Promise.all(
      libraries.map(async (lib) => {
        // Get versions for this library
        const versionsResult = await storageAdapter.listVersions(lib.id);
        const versions = versionsResult.ok ? versionsResult.value : [];

        return {
          id: lib.identifier,
          name: lib.name,
          description: lib.description,
          trust_score: lib.trustScore,
          repository_url: lib.repositoryUrl,
          homepage_url: lib.homepageUrl,
          versions: versions.map((v) => v.versionString),
        };
      })
    );

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              query: libraryName,
              matches,
              total: matches.length,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    logger.error({ error }, '❌ Unexpected error in resolve-library-id');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Internal error',
              message: error instanceof Error ? error.message : 'Unknown error',
              matches: [],
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
