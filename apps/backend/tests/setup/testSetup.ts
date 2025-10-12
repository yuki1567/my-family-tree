import { TestDbManager } from '@/tests/helpers/dbManagerHelpers.js'
import { afterAll } from 'vitest'

afterAll(async () => {
  await TestDbManager.closeTestDbConnection()
})
