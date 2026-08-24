import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { rename } from 'node:fs/promises'
import { resolve } from 'node:path'

/** Rename dist/index.html → dist/app.html before Workbox generates the precache manifest. */
/** @type {import('vite').Plugin} */
const renameIndexToApp = {
  name: 'rename-index-to-app',
  apply: 'build',
  async writeBundle(options) {
    const outDir = options.dir ?? 'dist'
    await rename(
      resolve(outDir, 'index.html'),
      resolve(outDir, 'app.html'),
    )
  },
}

/**
 * Builds URL-rewrite middleware that mirrors the production Vercel rewrites
 * (see vercel.json): `/` serves the marketing page, `/support` the support page,
 * and `/app` / `/app/*` the React app.
 * @param {string} appEntry - File the app routes resolve to: `/index.html` in dev,
 *   or the built `/app.html` for `vite preview` (index.html is renamed at build time).
 * @returns {import('vite').Connect.NextHandleFunction}
 */
const prodRewrites = (appEntry) => (req, _res, next) => {
  const [pathname] = (req.url ?? '/').split('?')
  if (pathname === '/') {
    req.url = '/index-marketing.html'
  } else if (pathname === '/support') {
    req.url = '/support.html'
  } else if (pathname === '/app' || pathname.startsWith('/app/')) {
    req.url = appEntry
  }
  next()
}

/** Dev server: mirror prod routing; `/app` resolves to the dev entry `index.html`. */
/** @type {import('vite').Plugin} */
const devProdRoutes = {
  name: 'dev-prod-routes',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(prodRewrites('/index.html'))
  },
}

/** Preview server: mirror prod routing over the built output; `/app` → `app.html`. */
/** @type {import('vite').Plugin} */
const previewProdRoutes = {
  name: 'preview-prod-routes',
  configurePreviewServer(server) {
    server.middlewares.use(prodRewrites('/app.html'))
  },
}

export default defineConfig({
  // PORT lets a launcher assign a free port; vite ignores the env var natively.
  server: { port: Number(process.env.PORT) || 5173 },
  plugins: [
    react(),
    devProdRoutes,
    previewProdRoutes,
    renameIndexToApp,
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icon.svg', 'icon-64x64.png'],
      manifest: {
        name: 'Gather',
        short_name: 'Gather',
        description: 'Gather — your lists, meals, and more.',
        theme_color: '#3D7A63',
        background_color: '#FAFAF7',
        display: 'standalone',
        scope: '/app',
        start_url: '/app',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,svg,png,woff2}', 'app.html'],
        navigateFallback: '/app.html',
        navigateFallbackDenylist: [/^\/$/, /^\/support(\.html)?$/, /^\/privacy(\.html)?$/, /^\/index-marketing(\.html)?$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'external-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
