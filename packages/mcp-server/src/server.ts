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
 * 📡 Codex7 MCP Server
 *
 * Implements Model Context Protocol for Claude Desktop integration.
 * STUB: Registers tools but handlers return placeholder data (Phase 0).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import type { StorageAdapter } from '@codex7/shared';
import { logger } from './utils/logger.js';
import { registerTools } from './tools/index.js';

/**
 * MCP Server configuration
 */
export interface MCPServerConfig {
  /** Service name for identification */
  name: string;
  /** Service version */
  version: string;
  /** Storage adapter for database operations */
  storageAdapter: StorageAdapter;
}

/**
 * Codex7 MCP Server
 *
 * Provides Model Context Protocol tools for documentation search and retrieval.
 *
 * **Phase 0 Implementation:**
 * - ✅ Registers tools with proper schemas
 * - ✅ Returns stub data for all tools
 * - ❌ Does not connect to storage
 * - ❌ Does not perform real searches
 *
 * @example
 * ```typescript
 * const server = new Codex7MCPServer({
 *   name: 'codex7-mcp-server',
 *   version: '0.1.0'
 * });
 * await server.start();
 * ```
 */
export class Codex7MCPServer {
  private server: Server;
  private storageAdapter: StorageAdapter;

  constructor(config: MCPServerConfig) {
    this.storageAdapter = config.storageAdapter;

    // Initialize MCP SDK server
    this.server = new Server(
      {
        name: config.name,
        version: config.version,
      },
      {
        capabilities: {
          tools: {}, // We provide tools
        },
      }
    );

    logger.info({ name: config.name, version: config.version }, '📡 MCP Server created');
  }

  /**
   * Register all MCP tools
   *
   * Registers tools with real storage integration
   */
  registerTools(): void {
    logger.info('🔧 Registering MCP tools...');

    // Register tools from tools/ directory with storage adapter
    registerTools(this.server, this.storageAdapter);

    logger.info('✅ MCP tools registered');
  }

  /**
   * Start the MCP server with stdio transport
   *
   * Registers tools and connects to stdio for Claude Desktop communication.
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting MCP server...');

    // Register tools
    this.registerTools();

    // Setup stdio transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await this.server.connect(transport);

    logger.info('✅ MCP server running on stdio');
  }

  /**
   * Gracefully shutdown the server
   *
   * Closes connections and cleans up resources.
   */
  async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down MCP server...');

    await this.server.close();

    logger.info('✅ MCP server stopped');
  }
}
