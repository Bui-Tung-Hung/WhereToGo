import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json';

/**
 * Vite configuration for the WhereToGo web app.
 *
 * `base` (and the PWA manifest's `start_url`/`scope`, which must match it)
 * is `/WhereToGo/` in production (GitHub Pages project site) and `/` in
 * development, so local dev and the Cloudflare tunnel work at the root.
 */
export default defineConfig(({ mode }) => {
  const base = mode === 'production' ? '/WhereToGo/' : '/';

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        manifest: {
          name: 'WhereToGo',
          short_name: 'WhereToGo',
          description: 'Kho địa điểm của riêng bạn',
          lang: 'vi',
          display: 'standalone',
          start_url: base,
          scope: base,
          background_color: '#FAFAF9',
          theme_color: '#FAFAF9',
          icons: [
            { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    optimizeDeps: {
      exclude: ['@ionic/core'],
    },
    server: {
      host: true,
      allowedHosts: ['.trycloudflare.com'],
    },
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./vitest.setup.ts'],
      globals: false,
    },
  };
});
