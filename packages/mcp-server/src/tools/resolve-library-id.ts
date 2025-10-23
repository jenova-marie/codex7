/**
 * 🔍 resolve-library-id Tool
 *
 * Context7-compatible tool for mapping library names to IDs.
 * STUB: Returns hardcoded placeholder data (Phase 0)
 */

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
 * **Phase 0 Implementation:**
 * - ✅ Returns stub data (hardcoded React example)
 * - ❌ Does not query storage
 * - ❌ Does not perform semantic matching
 */
export async function handleResolveLibraryId(args: { libraryName: string }) {
  const { libraryName } = args;

  logger.info({ libraryName }, '🔍 resolve-library-id called (STUB)');

  // TODO Phase 1:
  // 1. Query storage for matching libraries
  // 2. Perform semantic + exact matching
  // 3. Sort by relevance and trust score
  // 4. Return real results

  // STUB: Return placeholder data
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            matches: [
              {
                id: '/facebook/react',
                name: 'React',
                description: 'A JavaScript library for building user interfaces',
                trust_score: 10,
                repository_url: 'https://github.com/facebook/react',
                versions: ['v18.2.0', 'latest'],
              },
            ],
            _stub: true,
            _message: 'STUB DATA: This is placeholder for Phase 0 testing',
            _note: 'Phase 1 will return real search results from the database',
          },
          null,
          2
        ),
      },
    ],
  };
}
