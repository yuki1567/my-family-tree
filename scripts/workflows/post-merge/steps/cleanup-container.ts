import { cleanupWorktreeContainer } from '../../lib/docker.js'
import type { WorkflowContext } from '../../shared/types.js'

export function cleanupContainer(ctx: WorkflowContext): void {
  cleanupWorktreeContainer(ctx.worktreeEnvironment.appName)
}
