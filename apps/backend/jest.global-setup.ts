import { exec } from 'child_process'
import { promisify } from 'util'

import { envConfig } from './config/env'

const execAsync = promisify(exec)

export default async function globalSetup() {
  console.log('🧪 統合テスト環境を初期化中...')

  try {
    await ensurePrismaClient()
    await waitForDatabaseConnection()
    await ensureMigrations()
    console.log('✅ 統合テスト環境のセットアップが完了しました')
  } catch (error) {
    console.error('❌ 統合テスト環境のセットアップに失敗:', error)
    console.error(
      '💡 テスト用DBが起動していることを確認してください: docker-compose --profile test up test-db -d'
    )
    console.error(`💡 使用予定のDB URL: ${envConfig.TEST_DATABASE_URL}`)
    throw error
  }
}

async function ensurePrismaClient(): Promise<void> {
  try {
    console.log('🔧 Prismaクライアントを生成中...')
    await execAsync('npx prisma generate --schema=./database/schema.prisma')
    console.log('✅ Prismaクライアントの生成が完了しました')
  } catch (error) {
    console.error('❌ Prismaクライアント生成に失敗:', error)
    throw error
  }
}

async function ensureMigrations(): Promise<void> {
  try {
    // マイグレーション状態を確認（exit code 1は未適用マイグレーションありの正常状態）
    console.log('🔍 マイグレーション状態を確認中...')
    const { stdout } = await execAsync(
      `DATABASE_URL="${envConfig.TEST_DATABASE_URL}" npx prisma migrate status --schema=./database/schema.prisma`
    )

    if (stdout.includes('Database schema is up to date!')) {
      console.log('✅ マイグレーションは最新です')
      return
    }

    console.log('✅ マイグレーション状態を確認完了')
  } catch (error: unknown) {
    const execError = error as { code?: number; stdout?: string }
    // exit code 1は未適用マイグレーションがある場合の正常な応答
    if (execError.code === 1 && execError.stdout) {
      if (
        execError.stdout.includes(
          'Following migration have not yet been applied:'
        ) ||
        execError.stdout.includes('The database schema is not in sync')
      ) {
        console.log('🔧 未適用のマイグレーションを実行中...')
        await execAsync(
          `DATABASE_URL="${envConfig.TEST_DATABASE_URL}" npx prisma migrate deploy --schema=./database/schema.prisma`
        )
        console.log('✅ マイグレーションの適用が完了しました')
        return
      }
    }
    console.error('❌ マイグレーション確認・実行に失敗:', error)
    throw error
  }
}

async function waitForDatabaseConnection(
  maxRetries = 30,
  retryInterval = 1000
): Promise<void> {
  // Prismaクライアント生成後に動的にインポート
  const { PrismaClient } = await import('@prisma/client')
  const prisma = new PrismaClient({
    datasources: {
      db: { url: envConfig.TEST_DATABASE_URL },
    },
  })

  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect()
      await prisma.$disconnect()
      return
    } catch {
      if (i === maxRetries - 1) {
        throw new Error(
          `DB接続失敗: ${maxRetries}回リトライしましたが接続できませんでした`
        )
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval))
    }
  }
}
