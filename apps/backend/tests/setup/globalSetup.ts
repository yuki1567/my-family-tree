import { promisify } from 'util'

import { exec } from 'child_process'

import { getBackendDir } from '../helpers/pathHelpers.js'

const execAsync = promisify(exec)
const backendDir = getBackendDir()

export default async function globalSetup() {
  try {
    await ensurePrismaClient()
    await waitForDatabaseConnection()
    await ensureMigrations()
  } catch (error) {
    console.error(error)
  }
}

async function ensurePrismaClient(): Promise<void> {
  await execAsync('npx prisma generate --schema=./database/schema.prisma', {
    cwd: backendDir,
  })

  await new Promise((resolve) => setTimeout(resolve, 1000))
}

async function waitForDatabaseConnection(): Promise<void> {
  const maxRetries = 30
  const retryInterval = 1000
  const { TestPrismaManager } = await import('../helpers/prismaHelpers.js')

  for (let i = 1; i <= maxRetries; i++) {
    try {
      const prisma = TestPrismaManager.getTestDbConnection()
      await prisma.$connect()
      await prisma.$disconnect()
      console.log('waitForDatabaseConnection 実行成功')
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
  console.log('ensureMigrations 実行成功')
}
