import { AwsProfile } from 'scripts/workflows/lib/AwsProfile.js'
import type { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'

export async function cleanupAwsResources(
  parameterStore: ParameterStore,
  appName: string
): Promise<void> {
  await parameterStore.deleteParameters()

  const awsProfile = new AwsProfile(appName)
  awsProfile.delete()
}
