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
 * 📊 Job Queue Client
 *
 * Manages connection to Redis and provides queue operations.
 * Phase 0: STUB - Connection setup only, actual job processing in Phase 1.
 */

import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { logger } from '../utils/logger.js';
import type { IndexJobData, JobResult } from './job-types.js';

/**
 * Queue configuration
 */
export interface QueueConfig {
  redisUrl: string;
  queueName: string;
}

/**
 * Job queue client
 *
 * Manages connection to Redis and provides queue operations.
 * STUB: Connection setup only, actual job processing in Phase 1.
 */
export class JobQueueClient {
  private connection: Redis;
  private queue: Queue<IndexJobData, JobResult>;

  constructor(config: QueueConfig) {
    logger.info({ redisUrl: config.redisUrl, queueName: config.queueName }, '🚀 Initializing job queue client');

    // Initialize Redis connection
    this.connection = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
    });

    // Initialize BullMQ queue
    this.queue = new Queue<IndexJobData, JobResult>(config.queueName, {
      connection: this.connection,
    });

    logger.info('✅ Job queue client initialized');
  }

  /**
   * Add job to queue
   * STUB: Adds job but no worker processes it yet
   */
  async addJob(data: IndexJobData): Promise<string> {
    logger.info({ data }, '📝 Adding job to queue (STUB)');

    const job = await this.queue.add('index-document', data, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });

    logger.info({ jobId: job.id }, '✅ Job added to queue');
    return job.id!;
  }

  /**
   * Get job status
   * STUB: Returns job info
   */
  async getJobStatus(jobId: string): Promise<unknown> {
    logger.debug({ jobId }, '🔍 Getting job status (STUB)');

    const job = await this.queue.getJob(jobId);
    if (!job) {
      return null;
    }

    return {
      id: job.id,
      data: job.data,
      state: await job.getState(),
      progress: job.progress,
    };
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    logger.info('🛑 Closing job queue client...');

    await this.queue.close();
    await this.connection.quit();

    logger.info('✅ Job queue client closed');
  }
}
