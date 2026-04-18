import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    ssr: 'src/index.ts',
    target: 'node22',
    sourcemap: true,
  },
});
