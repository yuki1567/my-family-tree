import { deleteAwsProfile } from '../../lib/aws-profile.js'

export function cleanupAwsProfile(issueNumber: number): void {
  deleteAwsProfile(issueNumber)
}
