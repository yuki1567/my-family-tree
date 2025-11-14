import { removeWorktree } from '../../lib/git.js'
import type { WorkflowContext } from '../../shared/types.js'

export function gitRemoveWorktree(ctx: WorkflowContext): void {
  removeWorktree(ctx.parameterStore.path)
}
