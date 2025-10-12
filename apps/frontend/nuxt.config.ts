import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    [
      '@nuxt/eslint',
      {
        config: {
          stylistic: false,
        },
      },
    ],
  ],

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
          target: 'http://localhost:4084',
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
