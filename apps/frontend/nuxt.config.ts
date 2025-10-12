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

  // SPAモード
  ssr: false,

  // 開発設定
  devtools: { enabled: true },

  // CSS設定
  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-08-15',

  // TypeScript設定
  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },

  // ビルド最適化
  build: {
    transpile: [],
  },

  // Vite設定
  vite: {
    resolve: {
      preserveSymlinks: true,
    },
    server: {
      // Docker環境でのHMR最適化
      watch: {
        usePolling: true,
        interval: 1000,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:4084',
          changeOrigin: true,
        },
      },
    },
    build: {
      // バンドル最適化
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'pinia'],
          },
        },
      },
    },
  },

  // 実験的機能
  experimental: {
    payloadExtraction: false,
    renderJsonPayloads: true,
  },
})
