import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  collectCoverageFrom: [
    'services/**/*.ts',
    'controllers/**/*.ts',
    'repositories/**/*.ts',
    'utils/**/*.ts',
    'validations/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  projects: [
    {
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.ts'],
      testTimeout: 5000,        // 単体テスト：短め
      maxWorkers: '50%',        // 単体テスト：並列実行
      // データベース関連設定なし
    },
    {
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.test.ts'],
      testTimeout: 30000,       // 統合テスト：長め
      maxWorkers: 1,            // 統合テスト：直列実行
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      globalSetup: '<rootDir>/jest.global-setup.ts',
      globalTeardown: '<rootDir>/jest.global-teardown.ts',
    }
  ]
}

export default config