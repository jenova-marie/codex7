/**
 * 🧪 Vitest Configuration for PostgreSQL Storage Adapter
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      WONDER_LOGGER_CONFIG: 'wonder-logger.test.yaml',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        '**/*.test.ts',
        '**/*.config.ts',
        '**/scripts/**',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    server: {
      deps: {
        inline: ['bson-objectid'],
      },
    },
  },
});
