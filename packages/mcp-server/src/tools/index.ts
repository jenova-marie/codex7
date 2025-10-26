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
 * 🔧 Tool Registration Framework
 *
 * Registers all MCP tools with the server instance.
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema, CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { resolveLibraryIdTool, handleResolveLibraryId } from './resolve-library-id.js';
import { getLibraryDocsTool, handleGetLibraryDocs } from './get-library-docs.js';
import { searchDocsTool, handleSearchDocs } from './search-docs.js';
import { getVersionsTool, handleGetVersions } from './get-versions.js';
import { logger } from '../utils/logger.js';

/**
 * Register all MCP tools with the server
 *
 * Registers both context7-compatible tools and Codex7 extensions.
 *
 * @param server - MCP server instance
 */
export function registerTools(server: Server): void {
  logger.debug('🔧 Registering tools...');

  // Register tools/list handler - returns all tool schemas
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        resolveLibraryIdTool,
        getLibraryDocsTool,
        searchDocsTool,
        getVersionsTool,
      ],
    };
  });

  // Register tools/call handler - routes to appropriate tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const toolName = request.params.name;
    const args = request.params.arguments as Record<string, unknown>;

    logger.debug({ toolName, args }, '🔧 Tool called');

    switch (toolName) {
      case 'resolve-library-id':
        return await handleResolveLibraryId(args as { libraryName: string });

      case 'get-library-docs':
        return await handleGetLibraryDocs(
          args as {
            context7CompatibleLibraryID: string;
            topic?: string;
            tokens?: number;
          }
        );

      case 'search-documentation':
        return await handleSearchDocs(
          args as {
            query: string;
            filters?: Record<string, unknown>;
            limit?: number;
          }
        );

      case 'get-library-versions':
        return await handleGetVersions(args as { library_id: string });

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  });

  logger.info(
    {
      count: 4,
      tools: [
        'resolve-library-id',
        'get-library-docs',
        'search-documentation',
        'get-library-versions',
      ],
    },
    '✅ All tools registered'
  );
}
