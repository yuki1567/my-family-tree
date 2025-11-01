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
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/require-v-for-key': 'error',
      'vue/no-v-html': 'error',
      'vue/no-unused-components': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
    },
  },
])
