import { defineConfig } from 'vite';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    outDir: 'dist',
    ssr: 'src/index.ts',
    target: 'node22',
    sourcemap: true,
    rollupOptions: {
      output: { format: 'esm' },
      external: [
        ...builtinModules,
        ...builtinModules.map((m) => `node:${m}`),
        '@colyseus/bun-websockets',
        '@pm2/io',
      ],
    },
  },
  ssr: {
    noExternal: true,
  },
});
