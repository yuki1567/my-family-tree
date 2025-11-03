import { GitHubGraphQLError } from '../core/errors.js'
import {
  FETCH_STATUS_FIELD_ID_QUERY,
  UPDATE_PROJECT_ITEM_STATUS_MUTATION,
} from '../core/graphql-queries.js'
import type {
  FetchIssueOutput,
  FetchStatusFieldIdResponse,
} from '../core/types.js'
import { log, runCommand } from '../core/utils.js'

export async function moveIssueToInProgress(
  ctx: FetchIssueOutput
): Promise<void> {
  const currentUser = getCurrentUser()
  assignIssueToUser(ctx.gitHub.issueNumber, currentUser)

  const statusFieldId = fetchStatusFieldId(ctx.githubProjects.projectId)
  updateIssueStatus(ctx, statusFieldId)
}

function getCurrentUser(): string {
  return runCommand('gh', ['api', 'user', '--jq', '.login'])
}

function assignIssueToUser(issueNumber: number, userName: string): void {
  runCommand('gh', [
    'issue',
    'edit',
    issueNumber.toString(),
    '--add-assignee',
    userName,
  ])

  log(`Issue #${issueNumber} を ${userName} にアサインしました`)
}

function fetchStatusFieldId(projectId: string): string {
  const result = runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${FETCH_STATUS_FIELD_ID_QUERY}`,
    '-f',
    `projectId=${projectId}`,
  ])

  const response = JSON.parse(result)
  const validatedData = validateStatusFieldIdResponse(response)

  return validatedData.data.node.field.id
}

function isFetchStatusFieldIdResponse(
  data: unknown
): data is FetchStatusFieldIdResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof data.data === 'object' &&
    data.data !== null &&
    'node' in data.data &&
    typeof data.data.node === 'object' &&
    data.data.node !== null &&
    'field' in data.data.node &&
    typeof data.data.node.field === 'object' &&
    data.data.node.field !== null &&
    'id' in data.data.node.field &&
    typeof data.data.node.field.id === 'string'
  )
}

function validateStatusFieldIdResponse(
  data: unknown
): FetchStatusFieldIdResponse {
  if (isFetchStatusFieldIdResponse(data)) {
    return data
  }

  throw new GitHubGraphQLError('fetchStatusFieldId', ['data.node.field.id'])
}

function updateIssueStatus(ctx: FetchIssueOutput, statusFieldId: string): void {
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
