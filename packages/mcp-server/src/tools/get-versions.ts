/**
 * 📋 get-library-versions Tool (Codex7 Extension)
 *
 * Extended tool for listing available library versions.
 * STUB: Returns placeholder version list (Phase 0)
 */

import { logger } from '../utils/logger.js';

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
 * **Phase 0 Implementation:**
 * - ✅ Returns stub version list
 * - ❌ Does not query storage
 * - ❌ Does not fetch actual versions
 */
export async function handleGetVersions(args: { library_id: string }) {
  const { library_id } = args;

  logger.info({ library_id }, '📋 get-library-versions called (STUB)');

  // TODO Phase 1:
  // 1. Parse library ID
  // 2. Query storage for all indexed versions
  // 3. Sort versions (semver order)
  // 4. Return with metadata

  // STUB: Return placeholder version list
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            library: library_id,
            versions: [
              {
                version: 'v18.2.0',
                indexed_at: '2024-01-15T10:30:00Z',
                documentation_chunks: 125,
              },
              {
                version: 'v18.1.0',
                indexed_at: '2023-12-01T14:20:00Z',
                documentation_chunks: 118,
              },
              {
                version: 'latest',
                indexed_at: '2024-01-20T09:15:00Z',
                documentation_chunks: 130,
              },
            ],
            total: 3,
            _stub: true,
            _message: 'STUB: Version list is placeholder (Phase 1)',
            _note: 'Phase 1 will return actual versions from database',
          },
          null,
          2
        ),
      },
    ],
  };
}
