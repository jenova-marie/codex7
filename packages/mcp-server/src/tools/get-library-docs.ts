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
 * 📚 get-library-docs Tool
 *
 * Context7-compatible tool for fetching library documentation.
 * STUB: Returns placeholder documentation (Phase 0)
 */

import type { StorageAdapter } from '@codex7/shared';
import { Version } from '@codex7/shared';
import { logger } from '../utils/logger.js';

/**
 * Parse Context7-compatible library ID
 * Format: /org/project or /org/project/version
 */
function parseLibraryId(libraryId: string): {
  org: string;
  project: string;
  version?: string;
} {
  const parts = libraryId.split('/').filter((p) => p.length > 0);

  if (parts.length < 2) {
    throw new Error(`Invalid library ID format: ${libraryId}. Expected /org/project or /org/project/version`);
  }

  return {
    org: parts[0]!,
    project: parts[1]!,
    version: parts[2],
  };
}

/**
 * Tool schema for get-library-docs
 */
export const getLibraryDocsTool = {
  name: 'get-library-docs',
  description:
    'Fetch documentation for a specific library. Supports optional topic filtering and token limits for focused results.',
  inputSchema: {
    type: 'object',
    properties: {
      context7CompatibleLibraryID: {
        type: 'string',
        description:
          'Library ID in format "/org/project" or "/org/project/version" (e.g., "/facebook/react" or "/vercel/next.js/v14.0.0")',
      },
      topic: {
        type: 'string',
        description:
          'Optional topic to focus documentation on (e.g., "hooks", "routing", "authentication")',
      },
      tokens: {
        type: 'number',
        description:
          'Maximum tokens of documentation to return (default: 5000). Higher values provide more context.',
        default: 5000,
      },
    },
    required: ['context7CompatibleLibraryID'],
  },
};

/**
 * Tool handler for get-library-docs
 *
 * Fetches documentation for a specific library, optionally focused on a topic.
 *
 * Implementation:
 * 1. Parse library ID (org, project, version)
 * 2. Retrieve library and version from storage
 * 3. Use hybrid search for relevant documentation
 * 4. Format for LLM consumption with token limits
 */
export async function handleGetLibraryDocs(
  args: {
    context7CompatibleLibraryID: string;
    topic?: string;
    tokens?: number;
  },
  storageAdapter: StorageAdapter
) {
  const { context7CompatibleLibraryID, topic, tokens = 5000 } = args;

  logger.info(
    {
      libraryID: context7CompatibleLibraryID,
      topic,
      tokens,
    },
    '📚 get-library-docs called'
  );

  try {
    // Parse library ID
    const { org, project, version: requestedVersion } = parseLibraryId(context7CompatibleLibraryID);
    logger.debug({ org, project, version: requestedVersion }, 'Parsed library ID');

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
                library_id: context7CompatibleLibraryID,
                message: `No library found matching ${org}/${project}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Find matching library by org/project
    const library = librariesResult.value.find((lib) => lib.org === org && lib.project === project);
    if (!library) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Library not found',
                library_id: context7CompatibleLibraryID,
                message: `No library found for ${org}/${project}`,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Get version (use requested version or latest)
    const versionsResult = await storageAdapter.listVersions(library.id);
    if (!versionsResult.ok) {
      throw new Error(`Failed to get versions: ${versionsResult.error.message}`);
    }

    const versions = versionsResult.value;
    let targetVersion = versions.find((v: Version) => v.isLatest);

    if (requestedVersion) {
      const specificVersion = versions.find((v: Version) => v.versionString === requestedVersion);
      if (specificVersion) {
        targetVersion = specificVersion;
      }
    }

    if (!targetVersion) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'No version found',
                library_id: context7CompatibleLibraryID,
                requested_version: requestedVersion || 'latest',
                available_versions: versions.map((v) => v.versionString),
              },
              null,
              2
            ),
          },
        ],
      };
    }

    // Search for documentation using hybrid search
    const searchQuery = topic || library.name;
    const searchResult = await storageAdapter.hybridSearch({
      query: searchQuery,
      limit: Math.min(Math.floor(tokens / 300), 20), // Rough estimate: 300 chars ~= 100 tokens
      version: targetVersion.id,
    });

    if (!searchResult.ok) {
      throw new Error(`Search failed: ${searchResult.error.message}`);
    }

    const results = searchResult.value;
    logger.info({ count: results.length }, '✅ Found documentation chunks');

    // Format documentation for LLM
    const formattedDocs = results
      .map((result, index) => {
        const doc = result.document;
        const hierarchyPath = result.library ? ` / ${result.library.name}` : '';
        return `## ${index + 1}. ${doc.title}${hierarchyPath}

${doc.content}

---
Source: ${doc.url || 'N/A'}
Score: ${result.score.toFixed(3)}
`;
      })
      .join('\n\n');

    // Calculate approximate token count (rough estimate: 1 token ~= 4 characters)
    const approxTokens = Math.ceil(formattedDocs.length / 4);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              library: library.name,
              library_id: context7CompatibleLibraryID,
              version: targetVersion.versionString,
              topic: topic || 'general',
              content: formattedDocs,
              metadata: {
                chunks_returned: results.length,
                approx_tokens: approxTokens,
                max_tokens: tokens,
                repository_url: library.repositoryUrl,
                homepage_url: library.homepageUrl,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  } catch (error) {
    logger.error({ error }, '❌ Error in get-library-docs');
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              error: 'Internal error',
              message: error instanceof Error ? error.message : 'Unknown error',
              library_id: context7CompatibleLibraryID,
            },
            null,
            2
          ),
        },
      ],
    };
  }
}
