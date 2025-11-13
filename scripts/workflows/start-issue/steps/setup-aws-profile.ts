import { createAwsProfile } from '../../lib/aws-profile.js'
import type { WorkflowContext } from '../../shared/types.js'

export function setupAwsProfile(ctx: WorkflowContext): void {
  const awsProfileName = createAwsProfile(ctx.worktreeEnvironment.issueNumber)

  ctx.worktreeEnvironment.setAwsProfile(awsProfileName)
}
