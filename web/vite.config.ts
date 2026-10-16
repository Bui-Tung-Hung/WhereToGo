import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import packageJson from './package.json';

/** Precache limit per file (Workbox default, made explicit): a larger file is silently skipped. */
const MAX_PRECACHE_FILE_BYTES = 2 * 1024 * 1024;

/** Vendor groups split into their own chunks so no single precached file exceeds the limit. */
const VENDOR_CHUNKS: ReadonlyArray<{ name: string; paths: readonly string[] }> = [
  {
    name: 'ionic',
    paths: ['/node_modules/@ionic/', '/node_modules/@stencil/', '/node_modules/ionicons/'],
  },
  {
    name: 'react',
    paths: [
      '/node_modules/react/',
      '/node_modules/react-dom/',
      '/node_modules/react-router/',
      '/node_modules/react-router-dom/',
      '/node_modules/@remix-run/',
      '/node_modules/scheduler/',
    ],
  },
  { name: 'supabase', paths: ['/node_modules/@supabase/'] },
  { name: 'query', paths: ['/node_modules/@tanstack/', '/node_modules/idb-keyval/'] },
  {
    name: 'forms',
    paths: ['/node_modules/zod/', '/node_modules/react-hook-form/', '/node_modules/@hookform/'],
  },
];

/** Rollup `manualChunks`: the vendor group of a module, or `undefined` for the default chunking. */
function vendorChunk(id: string): string | undefined {
  const path = id.replaceAll('\\', '/');
  return VENDOR_CHUNKS.find((group) => group.paths.some((prefix) => path.includes(prefix)))?.name;
}

/**
 * Vite configuration for the WhereToGo web app.
 *
 * `base` (and the PWA manifest's `start_url`/`scope`, which must match it)
 * is `/WhereToGo/` in production (GitHub Pages project site) and `/` in
 * development, so local dev and the Cloudflare tunnel work at the root.
 *
 * The build splits vendor libraries into separate chunks (`VENDOR_CHUNKS`) and sets the
 * precache size limit explicitly, so the app keeps opening offline (P27 PLAN-UI-1.md);
 * `npm run check:size` fails CI if any precached file grows past the limit.
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
          maximumFileSizeToCacheInBytes: MAX_PRECACHE_FILE_BYTES,
          navigateFallback: 'index.html',
          cleanupOutdatedCaches: true,
        },
      }),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: vendorChunk,
        },
      },
    },
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
