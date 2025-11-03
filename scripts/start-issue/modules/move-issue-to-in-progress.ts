import { GitHubGraphQLError } from '../core/errors.js'
import {
  FETCH_STATUS_FIELD_ID_QUERY,
  UPDATE_PROJECT_ITEM_STATUS_MUTATION,
} from '../core/graphql-queries.js'
import type { FetchIssueOutput } from '../core/types.js'
import { log, runCommand } from '../core/utils.js'

export async function moveIssueToInProgress(
  ctx: FetchIssueOutput
): Promise<void> {
  const currentUser = runCommand('gh', ['api', 'user', '--jq', '.login'])
  runCommand('gh', [
    'issue',
    'edit',
    ctx.gitHub.issueNumber.toString(),
    '--add-assignee',
    currentUser,
  ])

  log(`Issue #${ctx.gitHub.issueNumber} を ${currentUser} にアサインしました`)

  const fieldResult = runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${FETCH_STATUS_FIELD_ID_QUERY}`,
    '-f',
    `projectId=${ctx.githubProjects.projectId}`,
  ])

  const fieldData = JSON.parse(fieldResult)
  const statusFieldId = fieldData.data?.node?.field?.id

  if (!statusFieldId) {
    throw new GitHubGraphQLError('fetchStatusFieldId', ['data.node.field.id'])
  }

  runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${UPDATE_PROJECT_ITEM_STATUS_MUTATION}`,
    '-f',
    `projectId=${ctx.githubProjects.projectId}`,
    '-f',
    `itemId=${ctx.githubProjects.projectItemId}`,
    '-f',
    `statusFieldId=${statusFieldId}`,
    '-f',
    `statusValueId=${ctx.githubProjects.inProgressStatusId}`,
  ])

  log(`Issue #${ctx.gitHub.issueNumber} をIn Progressステータスへ移動しました`)
}
