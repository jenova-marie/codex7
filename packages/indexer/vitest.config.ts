/**
 * 🧪 Vitest Configuration - Indexer Service
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 📁 Indexer package specific settings
    name: '@codex7/indexer',
    globals: true,
    environment: 'node',

    // 📊 Coverage specific to indexer package
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        'src/index.ts',
        'src/**/index.ts',
        'src/scripts/**',
        '**/__tests__/**',
        '**/*.config.ts',
      ],
      // 🎯 Coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // ⏱️ Test timeouts
    testTimeout: 10000,
    hookTimeout: 10000,

    // 📝 Include test files
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // 🎭 Mock settings
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
  },
});
