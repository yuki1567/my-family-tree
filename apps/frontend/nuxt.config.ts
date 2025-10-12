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

  vite: {
    resolve: {
      preserveSymlinks: true,
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:4084',
          changeOrigin: true,
        },
      },
    },
  },
})
