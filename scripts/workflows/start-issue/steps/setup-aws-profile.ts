import { AwsProfile } from '../../lib/AwsProfile.js'
import type { WorkflowContext } from '../../shared/types.js'

export function setupAwsProfile(ctx: WorkflowContext): void {
  const awsProfile = new AwsProfile(ctx.worktreeEnvironment.issueNumber)
  awsProfile.create()

  ctx.worktreeEnvironment.setAwsProfile(awsProfile.name)
}
