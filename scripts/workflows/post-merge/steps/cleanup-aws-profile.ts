import { deleteAwsProfile } from 'scripts/workflows/lib/aws-profile.js'
import { WorkflowContext } from 'scripts/workflows/shared/types.js'

export function cleanupAwsProfile(ctx: WorkflowContext): void {
  deleteAwsProfile(ctx.githubApi.issueData.number)
}
