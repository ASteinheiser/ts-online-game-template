import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      name: 'game-api',
      watch: false,
      reporters: 'verbose',
      coverage: {
        provider: 'v8',
        reporter: ['text'],
      },
    },
  })
);
