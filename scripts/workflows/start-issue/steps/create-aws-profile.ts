import { createAwsProfile as libCreateAwsProfile } from '../../lib/aws-profile.js'
import type {
  CreateAwsProfileContext,
  SetupEnvironmentContext,
} from '../../shared/types.js'

export function createAwsProfile(
  ctx: SetupEnvironmentContext
): CreateAwsProfileContext {
  const awsProfileName = libCreateAwsProfile(ctx.gitHub.issueNumber)

  return {
    ...ctx,
    environment: {
      ...ctx.environment,
      awsProfileName,
    },
  }
}
