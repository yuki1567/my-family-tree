import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/database/schema.js'

import { envConfig } from '../setup/env.js'

// biome-ignore lint/complexity/noStaticOnlyClass: DB接続のライフサイクル管理にクラスベースのシングルトンを使用
export class TestDbManager {
  private static instance: ReturnType<typeof drizzle> | undefined
  private static client: ReturnType<typeof postgres> | undefined

  static getTestDbConnection() {
    if (!TestDbManager.instance) {
      TestDbManager.client = postgres(envConfig.TEST_DATABASE_URL)
      TestDbManager.instance = drizzle(TestDbManager.client, { schema })
    }
    return TestDbManager.instance
  }

  static async closeTestDbConnection(): Promise<void> {
    if (TestDbManager.client) {
      await TestDbManager.client.end()
      TestDbManager.instance = undefined
      TestDbManager.client = undefined
    }
  }
}
