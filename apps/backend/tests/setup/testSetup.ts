import { TestDrizzleManager } from '@/tests/helpers/drizzleHelpers.js'
import { afterAll } from 'vitest'

afterAll(async () => {
  await TestDrizzleManager.closeTestDbConnection()
})
