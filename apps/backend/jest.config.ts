const config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'services/**/*.ts',
    'controllers/**/*.ts',
    'repositories/**/*.ts',
    'utils/**/*.ts',
    'validations/**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  projects: [
    {
      preset: 'ts-jest',
      testEnvironment: 'node',
      displayName: 'unit',
      testMatch: ['**/__tests__/unit/**/*.test.ts'],
      maxWorkers: '50%',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      preset: 'ts-jest',
      testEnvironment: 'node',
      displayName: 'integration',
      testMatch: ['**/__tests__/integration/**/*.test.ts'],
      maxWorkers: 1,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFiles: ['<rootDir>/jest.env.ts'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
      globalSetup: '<rootDir>/jest.global-setup.ts',
      globalTeardown: '<rootDir>/jest.global-teardown.ts',
    },
  ],
}

export default config
