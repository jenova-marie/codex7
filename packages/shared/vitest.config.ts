/**
 * 🧪 Vitest Configuration - Shared Package
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 📁 Shared package specific settings
    name: '@codex7/shared',

    // 🌍 Global test settings
    globals: true,
    environment: 'node',

    // 📊 Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.js',
        'src/types/**',
        'src/index.ts',
        'src/**/index.ts',
        '**/__tests__/**',
        '**/__mocks__/**',
        '**/coverage/**',
      ],
      // 🎯 Coverage thresholds (relaxed for Phase 0 - will enforce in Phase 1)
      // thresholds: {
      //   lines: 80,
      //   functions: 80,
      //   branches: 80,
      //   statements: 80,
      // },
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
  },
});
