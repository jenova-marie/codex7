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
 * ⚙️ Indexing Job Worker
 *
 * Consumes jobs from queue and processes them.
 * Phase 0: STUB - Processes jobs but all steps are stubs.
 */

import { Worker, type Job } from 'bullmq';
import Redis from 'ioredis';
import { logger } from './utils/logger.js';
import { processJob } from './pipeline/index.js';
import type { IndexJobData, JobResult } from './queue/job-types.js';

/**
 * Worker configuration
 */
export interface WorkerConfig {
  redisUrl: string;
  queueName: string;
  concurrency?: number;
}

/**
 * Indexing job worker
 *
 * Consumes jobs from queue and processes them.
 * STUB: Processes jobs but all steps are stubs.
 */
export class IndexerWorker {
  private connection: Redis;
  private worker: Worker<IndexJobData, JobResult>;

  constructor(config: WorkerConfig) {
    logger.info({ config }, '⚙️ Initializing indexer worker');

    // Initialize Redis connection
    this.connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
    });

    // Initialize BullMQ worker
    this.worker = new Worker<IndexJobData, JobResult>(
      config.queueName,
      async (job: Job<IndexJobData, JobResult>) => {
        return this.handleJob(job);
      },
      {
        connection: this.connection,
        concurrency: config.concurrency || 1,
      }
    );

    // Event handlers
    this.worker.on('completed', (job) => {
      logger.info(
        {
          jobId: job.id,
          result: job.returnvalue,
        },
        '✅ Job completed'
      );
    });

    this.worker.on('failed', (job, err) => {
      logger.error(
        {
          jobId: job?.id,
          error: err.message,
          stack: err.stack,
        },
        '❌ Job failed'
      );
    });

    logger.info('✅ Indexer worker initialized');
  }

  /**
   * Handle individual job
   *
   * STUB: Logs job but processing is all stubs
   */
  private async handleJob(job: Job<IndexJobData, JobResult>): Promise<JobResult> {
    logger.info(
      {
        jobId: job.id,
        data: job.data,
      },
      '🔄 Processing job (STUB)'
    );

    try {
      // Process job through pipeline (all stubs)
      const result = await processJob(job.data);

      logger.info(
        {
          jobId: job.id,
          result,
        },
        '✅ Job processed (STUB)'
      );

      return result;
    } catch (error) {
      logger.error(
        {
          jobId: job.id,
          error: error instanceof Error ? error.message : String(error),
        },
        '❌ Job processing failed'
      );

      return {
        success: false,
        documentsIndexed: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Start the worker
   */
  async start(): Promise<void> {
    logger.info('🚀 Starting indexer worker...');
    // Worker automatically starts when created
    logger.info('✅ Indexer worker running, waiting for jobs...');
  }

  /**
   * Stop the worker
   */
  async stop(): Promise<void> {
    logger.info('🛑 Stopping indexer worker...');

    await this.worker.close();
    await this.connection.quit();

    logger.info('✅ Indexer worker stopped');
  }
}
