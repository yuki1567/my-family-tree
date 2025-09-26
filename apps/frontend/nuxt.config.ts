import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // 開発設定
  devtools: { enabled: true },

  // SPAモード
  ssr: false,

  // CSS設定
  css: ['~/assets/css/main.css'],

  modules: [
    '@pinia/nuxt',
    [
      '@nuxt/eslint',
      {
        config: {
          stylistic: true,
        },
      },
    ],
  ],

  vite: {
    resolve: {
      preserveSymlinks: true,
    },
  },

  compatibilityDate: '2025-08-15',
})
