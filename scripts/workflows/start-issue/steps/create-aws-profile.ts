import { createAwsProfile as libCreateAwsProfile } from '../../../lib/aws-profile.js'

import type { SetupEnvironmentOutput } from './setup-environment.js'

export type CreateAwsProfileOutput = SetupEnvironmentOutput & {
  environment: SetupEnvironmentOutput['environment'] & {
    awsProfileName: string
  }
}

export function createAwsProfile(
  ctx: SetupEnvironmentOutput
): CreateAwsProfileOutput {
  const awsProfileName = libCreateAwsProfile(ctx.gitHub.issueNumber)

  return {
    ...ctx,
    environment: {
      ...ctx.environment,
      awsProfileName,
    },
  }
}
