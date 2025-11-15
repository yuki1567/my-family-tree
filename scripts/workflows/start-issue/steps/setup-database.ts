import { Database } from '../../lib/Database.js'
import type { WorkflowContext } from '../../shared/types.js'

export function setupDatabase(ctx: WorkflowContext): void {
  const database = new Database(
    ctx.worktreeEnvironment.slugTitle,
    ctx.worktreeEnvironment.databaseAdminPassword
  )
  database.create()
}
