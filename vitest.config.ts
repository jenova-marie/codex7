import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Integration tests may take longer
    testTimeout: 60000,
    hookTimeout: 60000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/cli/**"],
    },
    // Run tests sequentially to avoid database conflicts
    sequence: {
      shuffle: false,
    },
    // Run test files sequentially (important for integration tests with shared DB)
    fileParallelism: false,
  },
});
