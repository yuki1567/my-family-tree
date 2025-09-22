import { PrismaClient } from '@prisma/client'

import { envConfig } from '../setup/env.js'

export class TestPrismaManager {
  private static instance: PrismaClient | undefined

  static getTestDbConnection(): PrismaClient {
    if (!this.instance) {
      this.instance = new PrismaClient({
        datasources: {
          db: { url: envConfig.TEST_DATABASE_URL },
        },
        log: envConfig.TEST_LOG_LEVEL,
      })
    }
    return this.instance
  }

  static async closeTestDbConnection(): Promise<void> {
    if (this.instance) {
      await this.instance.$disconnect()
      this.instance = undefined
    }
  }
}
