import { Git } from '../../lib/Git.js'
import { PARAMETER_KEYS } from '../../shared/constants.js'
import type { WorkflowContext } from '../../shared/types.js'

export function gitRemoveWorktree(ctx: WorkflowContext): void {
  const branchName = ctx.parameterStore.get(PARAMETER_KEYS.BRANCH_NAME)
  const git = new Git(branchName, ctx.parameterStore.path)
  git.removeWorktree()
}
