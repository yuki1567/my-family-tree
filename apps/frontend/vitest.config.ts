import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup/testSetup.ts'],
    include: ['tests/**/*.{test,spec}.{js,ts,vue}'],
  },
  resolve: {
    dedupe: ['vue', '@vue/runtime-core', '@vue/runtime-dom', '@vue/reactivity'],
    alias: {
      '@': resolve(__dirname, '.'),
    },
  },
})
