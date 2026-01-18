import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * NOTE: this is only used for dev purposes. Vite will build the
 * site into static files, so the PORT won't be relevant in prod
 */
const PORT = 4202;

export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main',
      externalizeDeps: true,
    },
  },
  preload: {
    build: {
      outDir: 'dist/preload',
      externalizeDeps: true,
    },
  },
  renderer: {
    plugins: [react(), tailwindcss()],
    server: {
      port: PORT,
    },
    build: {
      outDir: 'dist/renderer',
    },
  },
});
