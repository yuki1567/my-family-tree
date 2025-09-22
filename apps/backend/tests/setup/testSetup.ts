import { TestPrismaManager } from '@/tests/helpers/prismaHelpers.js'
import { afterAll } from 'vitest'

afterAll(async () => {
  await TestPrismaManager.closeTestDbConnection()
})
