import { afterAll } from 'vitest'
import { TestDbManager } from '@/tests/helpers/dbManagerHelpers.js'

afterAll(async () => {
  await TestDbManager.closeTestDbConnection()
})
