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
  const { TestDbManager } = await import('../helpers/dbManagerHelpers.js')

  for (let i = 1; i <= maxRetries; i++) {
    try {
      TestDbManager.getTestDbConnection()
      await TestDbManager.closeTestDbConnection()
      return
    } catch (error) {
      if (i === maxRetries) {
        console.error('最終エラー:', error)
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
