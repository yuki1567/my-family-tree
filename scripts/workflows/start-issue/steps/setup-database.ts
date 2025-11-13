import { createDatabase } from '../../lib/database.js'
import type { WorkflowContext } from '../../shared/types.js'

export function setupDatabase(ctx: WorkflowContext): void {
  createDatabase(
    ctx.worktreeEnvironment.databaseName,
    ctx.worktreeEnvironment.dbAdminPassword
  )
}
