import { PrismaClient } from '@prisma/client'
import { envConfig } from '@/config/env'

const prisma = new PrismaClient({
  log:
    envConfig.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['warn', 'error'],
})

export { prisma }
