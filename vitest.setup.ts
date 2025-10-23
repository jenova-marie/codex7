/**
 * 🧪 Vitest Global Setup
 *
 * Runs before all test suites
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// 🌍 Global test setup
beforeAll(() => {
  // Setup code that runs once before all tests
  // e.g., Start test database, initialize mocks
});

afterAll(() => {
  // Cleanup code that runs once after all tests
  // e.g., Stop test database, clear mocks
});

// 🔄 Per-test setup
beforeEach(() => {
  // Setup that runs before each test
  // e.g., Reset database state, clear caches
});

afterEach(() => {
  // Cleanup that runs after each test
  // e.g., Clear test data, restore mocks
});

// 🎯 Global test utilities
export const testHelpers = {
  /**
   * Create a mock library ID
   */
  mockLibraryId: (org = 'test-org', project = 'test-project', version?: string) => {
    const base = `/${org}/${project}`;
    return version ? `${base}/${version}` : base;
  },

  /**
   * Create a mock embedding vector
   */
  mockEmbedding: (dimensions = 1536) => {
    return Array.from({ length: dimensions }, () => Math.random());
  },

  /**
   * Wait for async operations
   */
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};
