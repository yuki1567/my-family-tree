import { promisify } from 'util'

import { exec } from 'child_process'

import { getBackendDir } from '../helpers/pathHelpers.js'

const execAsync = promisify(exec)
const backendDir = getBackendDir()

export default async function globalSetup() {
  try {
    await waitForDatabaseConnection()
    await ensureMigrations()
  } catch (error) {
    console.error('テストセットアップに失敗しました:', error)
    process.exit(1)
  }
}

async function waitForDatabaseConnection(): Promise<void> {
  const maxRetries = 30
  const retryInterval = 1000
  const { TestDrizzleManager } = await import('../helpers/drizzleHelpers.js')

  for (let i = 1; i <= maxRetries; i++) {
    try {
      TestDrizzleManager.getTestDbConnection()
      await TestDrizzleManager.closeTestDbConnection()
      return
    } catch {
      if (i === maxRetries) {
        throw new Error(
          `DB接続失敗: ${maxRetries}回リトライしましたが接続できませんでした`
        )
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval))
    }
  }
}

async function ensureMigrations(): Promise<void> {
  await execAsync('npm run test:db:migrate', {
    cwd: backendDir,
  })
}
