/**
 * 🧪 Vitest Configuration - Shared Package
 */

import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.js';

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      // 📁 Shared package specific settings
      name: '@codex7/shared',

      // 📊 Coverage specific to shared package
      coverage: {
        include: ['src/**/*.ts'],
        exclude: [
          'src/types/**',
          'src/index.ts',
          'src/**/index.ts',
        ],
      },
    },
  })
);
