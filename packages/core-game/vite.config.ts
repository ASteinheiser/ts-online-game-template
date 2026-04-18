import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => `index.js`,
    },
    sourcemap: true,
    rolldownOptions: {
      external: ['@colyseus/schema', 'zod'],
      plugins: [
        dts({
          entryRoot: resolve(__dirname, 'src'),
          exclude: [
            resolve(__dirname, 'test/**'),
            resolve(__dirname, 'vite.config.ts'),
            resolve(__dirname, 'vitest.config.ts'),
          ],
        }),
      ],
    },
  },
});
