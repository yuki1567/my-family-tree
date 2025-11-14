import { deleteDatabase } from '../../lib/database.js'
import type { WorkflowContext } from '../../shared/types.js'

export function cleanupDatabase(ctx: WorkflowContext): void {
  deleteDatabase(
    ctx.worktreeEnvironment.databaseAdminUrl,
    ctx.worktreeEnvironment.databaseAdminPassword
  )
}
