import { Database } from '../../lib/Database.js'
import type { WorkflowContext } from '../../shared/types.js'

export function cleanupDatabase(ctx: WorkflowContext): void {
  const database = new Database(
    ctx.worktreeEnvironment.slugTitle,
    ctx.worktreeEnvironment.databaseAdminPassword
  )
  database.delete()
}
