import { AwsProfile } from '../../lib/AwsProfile.js'
import type { WorkflowContext } from '../../shared/types.js'

export function cleanupAwsProfile(ctx: WorkflowContext): void {
  const awsProfile = new AwsProfile(ctx.githubApi.issueData.number)
  awsProfile.delete()
}
