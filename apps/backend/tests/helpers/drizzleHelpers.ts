import * as schema from '@/database/schema.js'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { envConfig } from '../setup/env.js'

export class TestDrizzleManager {
  private static instance: ReturnType<typeof drizzle> | undefined
  private static client: ReturnType<typeof postgres> | undefined

  static getTestDbConnection() {
    if (!this.instance) {
      this.client = postgres(envConfig.TEST_DATABASE_URL)
      this.instance = drizzle(this.client, { schema })
    }
    return this.instance
  }

  static async closeTestDbConnection(): Promise<void> {
    if (this.client) {
      await this.client.end()
      this.instance = undefined
      this.client = undefined
    }
  }
}
