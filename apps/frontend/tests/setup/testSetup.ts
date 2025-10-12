import { vi } from 'vitest'

// Vue Test UtilsとVitestのグローバル設定

// コンソール警告の制御（必要に応じて）
const originalWarn = console.warn
console.warn = (...args: unknown[]) => {
  // 必要な警告のみを表示するフィルタリング
  if (
    typeof args[0] === 'string' &&
    !args[0].includes('[Vue warn]') // Vueの開発時警告を非表示にする場合
  ) {
    originalWarn(...args)
  }
}

// Nuxt関連のモック設定（必要に応じて）
vi.mock('#app', () => ({
  useRouter: () => ({
    push: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  useRoute: () => ({
    params: {},
    query: {},
    hash: '',
    path: '/',
    fullPath: '/',
    name: '',
    meta: {},
  }),
  navigateTo: vi.fn(),
}))
