import react from '@vitejs/plugin-react';
import { defineConfig, lazyPlugins } from 'vite-plus';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: lazyPlugins(() => [
    react({ compiler: true }),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'icons/apple-touch-icon.png',
      ],
      workbox: {
        navigateFallbackDenylist: [/^\/api/],
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Gastos',
        short_name: 'Gastos',
        description: 'Finance tracker PWA',
        theme_color: '#FFFFFF',
        background_color: '#FFFFFF',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/icons-48x48.png',
            sizes: '48x48',
            type: 'image/png',
          },
          {
            src: 'icons/icons-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: 'icons/icons-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: 'icons/icons-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: 'icons/icons-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: 'icons/icons-152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: 'icons/icons-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icons-256x256.png',
            sizes: '256x256',
            type: 'image/png',
          },
          {
            src: 'icons/icons-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: 'icons/icons-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ]),
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
