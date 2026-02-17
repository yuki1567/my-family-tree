import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],

  ssr: false,

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-08-15',

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },

  build: {
    transpile: [],
  },

  vite: {
    resolve: {
      alias: {
        '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
        '@backend': fileURLToPath(new URL('../backend', import.meta.url)),
      },
      preserveSymlinks: true,
    },
    server: {
      watch: {
        usePolling: true,
        interval: 1000,
        ignored: [
          '**/node_modules/**',
          '**/.nuxt/**',
          '**/.output/**',
          '**/dist/**',
          '**/coverage/**',
        ],
      },
      proxy: {
        '/api': {
          target: 'http://localhost:4000',
          changeOrigin: true,
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'pinia'],
          },
        },
      },
    },
  },

  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
  },
})
