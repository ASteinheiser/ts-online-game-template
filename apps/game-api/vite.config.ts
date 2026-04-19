import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    outDir: 'dist',
    ssr: 'src/index.ts',
    target: 'node22',
    sourcemap: true,
    rolldownOptions: {
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        '@pm2/io',
        'bufferutil',
        'utf-8-validate',
      ],
    },
  },
  ssr: {
    noExternal: true,
  },
});
