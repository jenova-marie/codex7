/**
 * 📚 get-library-docs Tool
 *
 * Context7-compatible tool for fetching library documentation.
 * STUB: Returns placeholder documentation (Phase 0)
 */

import { logger } from '../utils/logger.js';

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
 * **Phase 0 Implementation:**
 * - ✅ Returns stub documentation
 * - ❌ Does not parse library ID
 * - ❌ Does not generate embeddings
 * - ❌ Does not perform vector similarity search
 * - ❌ Does not format real documentation
 */
export async function handleGetLibraryDocs(args: {
  context7CompatibleLibraryID: string;
  topic?: string;
  tokens?: number;
}) {
  const { context7CompatibleLibraryID, topic, tokens = 5000 } = args;

  logger.info(
    {
      libraryID: context7CompatibleLibraryID,
      topic,
      tokens,
    },
    '📚 get-library-docs called (STUB)'
  );

  // TODO Phase 1:
  // 1. Parse library ID (org, project, version)
  // 2. Generate query embedding (with optional topic)
  // 3. Perform vector similarity search
  // 4. Retrieve top N relevant documentation chunks
  // 5. Format for LLM consumption
  // 6. Respect token limit

  // STUB: Return placeholder documentation
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            content: `# ${context7CompatibleLibraryID} Documentation (PLACEHOLDER)

This is stub documentation for ${context7CompatibleLibraryID}.

${topic ? `## Topic: ${topic}\n\nFocused documentation about ${topic} would appear here.\n` : ''}

## Overview
In Phase 1, this will return actual documentation retrieved from the vector database
using semantic search.

## Features
- Semantic search for relevant documentation chunks
- Topic-based filtering
- Token limit enforcement
- Multiple documentation sources (README, guides, API reference)

## Next Steps
This is just placeholder data to test the MCP protocol integration.
Real implementation coming in Phase 1! 🚀

---
_STUB DATA for Phase 0 testing_`,
            metadata: {
              library: context7CompatibleLibraryID,
              version: 'latest',
              topic: topic || 'general',
              chunks_returned: 1,
              total_tokens: 150,
              max_tokens: tokens,
              _stub: true,
            },
            _note: 'Phase 1 will return real documentation from vector search',
          },
          null,
          2
        ),
      },
    ],
  };
}
