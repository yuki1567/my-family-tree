import { AwsProfile } from 'scripts/workflows/lib/AwsProfile.js'
import type { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import { AWS } from 'scripts/workflows/shared/constants.js'

export async function cleanupAwsResources(
  parameterStore: ParameterStore,
  issueNumber: number
): Promise<void> {
  await parameterStore.deleteParameters()

  const appName = `${AWS.PROFILE.PREFIX}-${issueNumber}`
  const awsProfile = new AwsProfile(appName)
  awsProfile.delete()
}
