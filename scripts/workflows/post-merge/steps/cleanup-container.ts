import { DockerContainer } from '../../lib/DockerContainer.js'
import type { WorkflowContext } from '../../shared/types.js'

export function cleanupContainer(ctx: WorkflowContext): void {
  const container = new DockerContainer(ctx.worktreeEnvironment.appName)
  container.cleanup()
}
