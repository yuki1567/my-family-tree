import { PrismaClient } from '@prisma/client'
import { envConfig } from '@/config/env'

// テスト環境ではTEST_DATABASE_URLを使用
const databaseUrl = envConfig.NODE_ENV === 'test' 
  ? envConfig.TEST_DATABASE_URL 
  : envConfig.DATABASE_URL

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log:
    envConfig.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
})
