/**
 * 🧪 Tests for IndexerWorker
 *
 * Phase 0: Basic test framework, no integration tests yet (require Redis).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { IndexerWorker } from '../worker.js';

describe('IndexerWorker', () => {
  let worker: IndexerWorker | null = null;

  afterEach(async () => {
    if (worker) {
      await worker.stop();
      worker = null;
    }
  });

  it('should create worker instance', () => {
    worker = new IndexerWorker({
      redisUrl: 'redis://localhost:6379',
      queueName: 'test-queue',
      concurrency: 1,
    });

    expect(worker).toBeDefined();
  });

  // NOTE: Full integration tests require Redis
  // Will be tested in docker-compose environment
});
