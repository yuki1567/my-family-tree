import { AwsProfile } from 'scripts/workflows/lib/AwsProfile.js'
import { ParameterStore } from 'scripts/workflows/lib/ParameterStore.js'
import {
  AWS,
  REQUIRED_WORKTREE_PARAMETERS,
} from 'scripts/workflows/shared/constants.js'

export async function cleanupAwsResources(issueNumber: number): Promise<void> {
  const path = `${AWS.PARAMETER_PATH.WORKTREE}/${issueNumber}`
  const parameterStore = await ParameterStore.create(
    path,
    REQUIRED_WORKTREE_PARAMETERS
  )
  await parameterStore.deleteParameters()

  const appName = `${AWS.PROFILE.PREFIX}-${issueNumber}`
  const awsProfile = new AwsProfile(appName)
  awsProfile.delete()
}
