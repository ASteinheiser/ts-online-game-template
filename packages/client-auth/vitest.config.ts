import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'client-auth',
    watch: false,
    reporters: 'verbose',
    coverage: {
      provider: 'v8',
      reporter: ['text'],
    },
  },
});
