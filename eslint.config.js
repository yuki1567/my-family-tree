import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import typescriptParser from '@typescript-eslint/parser'
import prettier from 'eslint-plugin-prettier'

// 共通の基本設定をエクスポート
export const baseIgnores = [
  'node_modules',
  'dist',
  'coverage',
  'public',
  '.vscode',
  '.git',
  '**/node_modules/**',
  '**/dist/**',
  '**/coverage/**',
  '**/public/**',
  '**/.vscode/**',
  '**/.git/**',
]

export const baseConfig = [
  {
    ignores: baseIgnores,
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
      globals: {
        browser: true,
        node: true,
        console: true,
        process: true,
        setTimeout: 'readonly',
        fetch: 'readonly',
        NodeJS: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      prettier,
    },
    rules: {
      'no-console': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prettier/prettier': 'error',
    },
  },
  {
    files: ['scripts/**/*.{js,ts,sh}'],
    rules: {
      'no-console': 'off',
    },
  },
]

export default baseConfig
