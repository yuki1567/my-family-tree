import { AwsProfile } from 'scripts/workflows/lib/AwsProfile.js'
import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'

export function cleanupAwsResources(
  parameterStore: ParameterStore,
  issueNumber: number
): void {
  parameterStore.deleteParameters()

  const awsProfile = new AwsProfile(issueNumber)
  awsProfile.delete()
}
