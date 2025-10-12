// @nuxt/eslintで自動生成される設定を使用
import withNuxt from './.nuxt/eslint.config.mjs'

// .nuxtディレクトリの除外は手動設定が必要
export default withNuxt([
  {
    ignores: ['.nuxt/**', '.output/**'],
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/no-multiple-template-root': 'off',
    },
  },
])
