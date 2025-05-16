import { defineConfig } from 'vite';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'index',
      formats: ['es'],
      fileName: (format) => `index.${format}.js`,
    },
    sourcemap: true,
    rollupOptions: {
      plugins: [
        typescript({
          target: 'esnext',
          rootDir: resolve(__dirname, 'src'),
          declarationDir: resolve(__dirname, 'dist'),
          exclude: resolve(__dirname, 'node_modules/**'),
        }),
        dts({
          entryRoot: resolve(__dirname, 'src'),
          outDir: resolve(__dirname, 'dist'),
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
