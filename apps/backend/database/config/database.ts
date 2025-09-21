import { envConfig } from '@/config/env.js'
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: envConfig.DATABASE_URL,
    },
  },
  log: envConfig.LOG_LEVEL,
})
