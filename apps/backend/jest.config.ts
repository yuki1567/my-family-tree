const config = {
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
      preset: 'ts-jest',
      testEnvironment: 'node',
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.ts'],
      testTimeout: 5000,
      maxWorkers: '50%',
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1'
      }
    },
    {
      preset: 'ts-jest',
      testEnvironment: 'node',
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.test.ts'],
      testTimeout: 30000,
      maxWorkers: 1,
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/$1'
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      globalSetup: '<rootDir>/jest.global-setup.ts',
      globalTeardown: '<rootDir>/jest.global-teardown.ts',
    }
  ]
}

export default config