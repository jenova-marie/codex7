/**
 * 🧪 Vitest Configuration (Root)
 *
 * Base configuration for all packages in the monorepo
 */

import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
  test: {
    // 🌍 Global test settings
    globals: true,
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],

    // 📊 Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/coverage/**',
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

    // 🔄 Watch mode exclusions
    watchExclude: ['**/node_modules/**', '**/dist/**'],

    // 📝 Include test files
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],

    // 🎭 Mock settings
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,

    // 🔍 Type checking
    typecheck: {
      enabled: false, // Enable per package if needed
    },
  },

  // 🔗 Path resolution
  resolve: {
    alias: {
      '@codex7/shared': resolve(__dirname, './packages/shared/src'),
    },
  },
});
