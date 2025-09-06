import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // 開発設定
  devtools: { enabled: true },

  // SPAモード
  ssr: false,

  // CSS設定（素のCSS使用、フレームワーク禁止）
  css: ['~/assets/css/main.css'],

  // Pinia状態管理
  modules: ['@pinia/nuxt'],

  compatibilityDate: '2025-08-15',
})
