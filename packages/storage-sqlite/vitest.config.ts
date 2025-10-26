/**
 * 🧪 Vitest Configuration for SQLite Storage Adapter
 */

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true, // Don't fail when no tests found (Phase 0 stub)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'lib/',
        '**/*.test.ts',
        '**/*.config.ts',
      ],
    },
  },
});
