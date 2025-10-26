/**
 * Codex7 - REST API Server
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

import { createApp } from './app.js';
import { APIServer } from './server.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for REST API
 */
async function main() {
  logger.info('Starting Codex7 REST API...');

  // Configuration from environment
  const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    corsOrigins: (process.env.CORS_ORIGINS || '*').split(','),
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false'
  };

  // Create Express app
  const app = createApp(config);

  // Create server
  const server = new APIServer(app, config.port);

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down...');
    await server.shutdown();
    process.exit(0);
  });

  // Start server
  try {
    await server.start();
  } catch (error) {
    logger.error({ error });
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error({ error });
    process.exit(1);
  });
}

// Export for testing and programmatic usage
export { createApp, type APIConfig } from './app.js';
export { APIServer } from './server.js';
