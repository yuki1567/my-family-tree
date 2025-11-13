import { createAwsProfile as libCreateAwsProfile } from '../../lib/aws-profile.js'
import type { WorkflowContext } from '../../shared/types.js'

export function createAwsProfile(ctx: WorkflowContext): void {
  const awsProfileName = libCreateAwsProfile(
    ctx.worktreeEnvironment.issueNumber
  )

  ctx.worktreeEnvironment.setAwsProfile(awsProfileName)
}
