#!/usr/bin/env node
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
 * 📡 Codex7 MCP Server - Entry Point
 *
 * Starts the MCP server and handles graceful shutdown.
 *
 * Usage:
 *   codex7-mcp              # Start server (reads from wonder-logger.yaml)
 *   NODE_ENV=production codex7-mcp  # Production mode
 *
 * @module @codex7/mcp-server
 */

import { Codex7MCPServer } from './server.js';
import { logger } from './utils/logger.js';
import { PostgresAdapter, type PostgresConfig } from '@codex7/storage-postgres';

// Export public API
export { Codex7MCPServer, type MCPServerConfig } from './server.js';
export { registerTools } from './tools/index.js';

/**
 * Main entry point for MCP server
 *
 * Starts the server and handles graceful shutdown.
 */
async function main(): Promise<void> {
  logger.info('🚀 Starting Codex7 MCP Server...');

  // Create storage adapter
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const dbConfig: PostgresConfig = {
    connectionString: databaseUrl,
    host: '', // Not needed when using connectionString
    port: 0,  // Not needed when using connectionString
    database: '',
    user: '',
    password: '',
  };
  const storageAdapter = new PostgresAdapter(dbConfig);

  const server = new Codex7MCPServer({
    name: 'codex7-mcp-server',
    version: '0.1.0-alpha',
    storageAdapter,
  });

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('🛑 Received SIGINT, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('🛑 Received SIGTERM, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error(
      {
        err: error,
        stack: error.stack,
      },
      '❌ Uncaught exception'
    );
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, '❌ Unhandled rejection');
    process.exit(1);
  });

  // Start server
  try {
    await server.start();
  } catch (error) {
    logger.error({ err: error }, '❌ Failed to start server');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error({ err: error }, '❌ Fatal error');
    process.exit(1);
  });
}
