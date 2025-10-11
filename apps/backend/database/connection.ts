import { envConfig } from '@/config/env.js'
import { PrismaClient } from '@prisma/client'

const client = new PrismaClient({
  datasources: {
    db: { url: envConfig.DATABASE_URL },
  },
  log: [...envConfig.LOG_LEVEL] as ('query' | 'info' | 'warn' | 'error')[],
})

export const prisma = client
