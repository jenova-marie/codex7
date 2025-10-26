/**
 * Codex7 - Documentation Indexing Service
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
 * 🚀 Codex7 Indexer Service Entry Point
 *
 * Main entry point for the indexer service.
 * Starts the worker and handles graceful shutdown.
 * Phase 0: STUB - Worker runs but processing is all stubs.
 */

import { IndexerWorker } from './worker.js';
import { logger } from './utils/logger.js';

/**
 * Main entry point for indexer service
 *
 * Starts the worker and handles graceful shutdown.
 */
async function main() {
  logger.info('🚀 Starting Codex7 Indexer Service...');

  // Configuration from environment
  const config = {
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    queueName: process.env.QUEUE_NAME || 'codex7-indexing',
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '1', 10),
  };

  logger.info({ config }, '⚙️ Worker configuration');

  // Create worker
  const worker = new IndexerWorker(config);

  // Graceful shutdown handlers
  process.on('SIGINT', async () => {
    logger.info('🛑 Received SIGINT, shutting down...');
    await worker.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('🛑 Received SIGTERM, shutting down...');
    await worker.stop();
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error({ error: error.message, stack: error.stack }, '❌ Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, '❌ Unhandled rejection');
    process.exit(1);
  });

  // Start worker
  try {
    await worker.start();
  } catch (error) {
    logger.error({ error }, '❌ Failed to start worker');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    logger.error({ error }, '❌ Fatal error');
    process.exit(1);
  });
}

// Export worker and client for programmatic use
export { IndexerWorker, type WorkerConfig } from './worker.js';
export { JobQueueClient, type QueueConfig } from './queue/client.js';
export * from './queue/job-types.js';
