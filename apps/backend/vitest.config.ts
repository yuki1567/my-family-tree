import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, defineProject } from 'vitest/config'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const aliasConfig = {
  '@': path.resolve(__dirname, './'),
  '@shared': path.resolve(__dirname, '../shared'),
}

export default defineConfig({
  resolve: {
    alias: aliasConfig,
  },
  test: {
    environment: 'node',
    projects: [
      defineProject({
        resolve: {
          alias: aliasConfig,
        },
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
        },
      }),
      defineProject({
        resolve: {
          alias: aliasConfig,
        },
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          setupFiles: ['tests/setup/testSetup.ts'],
          globalSetup: ['tests/setup/globalSetup.ts'],
          hookTimeout: 120_000,
          testTimeout: 30_000,
          sequence: {
            concurrent: false,
          },
          poolOptions: {
            threads: {
              singleThread: true,
            },
          },
        },
      }),
    ],
  },
})
