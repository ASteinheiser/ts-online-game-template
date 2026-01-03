import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'desktop',
    watch: false,
    reporters: 'verbose',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
    },
  },
});
