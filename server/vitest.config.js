import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.js'],
    environment: 'node',
    fileParallelism: false,
    maxConcurrency: 1,
    testTimeout: 15000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});

