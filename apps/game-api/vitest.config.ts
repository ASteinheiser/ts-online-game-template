import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'game-api',
    watch: false,
    reporters: 'verbose',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
    },
  },
});
