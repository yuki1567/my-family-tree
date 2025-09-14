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
      testMatch: ['**/tests/unit/**/*.test.ts'],
      maxWorkers: '50%',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      preset: 'ts-jest',
      testEnvironment: 'node',
      displayName: 'integration',
      testMatch: ['**/tests/integration/**/*.test.ts'],
      maxWorkers: 1,
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFiles: ['<rootDir>/tests/setup/env.ts'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup/testSetup.ts'],
      globalSetup: '<rootDir>/tests/setup/globalSetup.ts',
      globalTeardown: '<rootDir>/tests/setup/globalTeardown.ts',
    },
  ],
}

export default config
