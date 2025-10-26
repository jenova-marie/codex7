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
 * 📋 get-library-versions Tool (Codex7 Extension)
 *
 * Extended tool for listing available library versions.
 * STUB: Returns placeholder version list (Phase 0)
 */

import type { StorageAdapter } from '@codex7/shared';
import { Version } from '@codex7/shared';
import { logger } from '../utils/logger.js';

/**
 * Parse library ID to extract org and project
 */
function parseLibraryId(libraryId: string): { org: string; project: string } {
  const parts = libraryId.split('/').filter((p) => p.length > 0);
  if (parts.length < 2) {
    throw new Error(`Invalid library ID: ${libraryId}`);
  }
  return { org: parts[0]!, project: parts[1]! };
}

/**
 * Tool schema for get-library-versions
 */
export const getVersionsTool = {
  name: 'get-library-versions',
  description:
    'List all indexed versions for a specific library. Useful for accessing version-specific documentation.',
  inputSchema: {
    type: 'object',
    properties: {
      library_id: {
        type: 'string',
        description: 'Library identifier in format "/org/project" (e.g., "/facebook/react")',
      },
    },
    required: ['library_id'],
  },
};

/**
 * Tool handler for get-library-versions
 *
 * Lists all indexed versions for a specific library.
 * This is a Codex7 extension beyond Context7's API.
 *
 * Implementation:
 * 1. Parse library ID
 * 2. Find library in storage
 * 3. Retrieve all versions with metadata
 */
export async function handleGetVersions(
  args: { library_id: string },
  storageAdapter: StorageAdapter
) {
  const { library_id } = args;

  logger.info({ library_id }, '📋 get-library-versions called');

  try {
    // Parse library ID
    const { org, project } = parseLibraryId(library_id);

    // Search for the library
    const librariesResult = await storageAdapter.searchLibraries(project);
    if (!librariesResult.ok || librariesResult.value.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Library not found',
                library_id,
                message: `No library found matching ${org}/${project}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Find matching library
    const library = librariesResult.value.find((lib) => lib.org === org && lib.project === project);
    if (!library) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Library not found',
                library_id,
                message: `No library found for ${org}/${project}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Get all versions
    const versionsResult = await storageAdapter.listVersions(library.id);
    if (!versionsResult.ok) {
      throw new Error(`Failed to get versions: ${versionsResult.error.message}`);
    }

    const versions = versionsResult.value;
    logger.info({ count: versions.length }, '✅ Found versions');

    // Format version information
    const formattedVersions = versions.map((v: Version) => ({
      version: v.versionString,
      indexed_at: new Date(v.indexed).toISOString(),
      documentation_chunks: v.documentCount,
      is_latest: v.isLatest,
      is_deprecated: v.isDeprecated,
      release_date: v.releaseDate ? new Date(v.releaseDate).toISOString() : null,
      git_commit_sha: v.gitCommitSha,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              library: library.name,
              library_id,
              versions: formattedVersions,
              total: formattedVersions.length,
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    logger.error({ error }, '❌ Error in get-library-versions');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Internal error',
              message: error instanceof Error ? error.message : 'Unknown error',
              library_id,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
