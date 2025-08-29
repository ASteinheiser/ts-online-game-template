import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

/**
 * NOTE: this is only used for dev purposes. Vite will build the
 * site into static files, so the PORT won't be relevant in prod
 */
const PORT = 4200;

export default defineConfig({
  base: './',
  server: {
    port: PORT,
  },
  preview: {
    port: PORT,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // ensure there are no dev caching issues
      devOptions: { enabled: false },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Marketing Site',
        short_name: 'Marketing Site',
        theme_color: '#6118ad',
        background_color: '#09090b',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png',
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
});
