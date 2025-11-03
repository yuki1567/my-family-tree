import { LABEL } from '../core/constants.js'
import { GitHubGraphQLError, IssueNotFoundError } from '../core/errors.js'
import { FETCH_PROJECT_ISSUES_QUERY } from '../core/graphql-queries.js'
import type {
  FetchIssueOutput,
  FetchProjectIssuesResponse,
  GitHubIssue,
  GitHubLabel,
  InitializeContextOutput,
  ProjectItem,
} from '../core/types.js'
import { log, runCommand } from '../core/utils.js'

export async function fetchIssue(
  ctx: InitializeContextOutput
): Promise<FetchIssueOutput> {
  const response = fetchProjectIssuesFromGitHub(ctx.githubProjects.projectId)
  const validatedData = validateGraphQLResponse(response)
  const todoItem = findFirstTodoItem(
    validatedData,
    ctx.githubProjects.todoStatusId
  )
  const issue = extractIssueFromItem(todoItem)
  const labelName = extractIssueLabel(issue.labels.nodes)

  log(`選択されたIssue: #${issue.number} - ${issue.title} (${labelName})`)

  return {
    ...ctx,
    gitHub: {
      issueNumber: issue.number,
      issueTitle: issue.title,
      issueLabel: labelName,
    },
    githubProjects: {
      ...ctx.githubProjects,
      projectItemId: todoItem.id,
    },
  }
}

function fetchProjectIssuesFromGitHub(projectId: string): unknown {
  const result = runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${FETCH_PROJECT_ISSUES_QUERY}`,
    '-f',
    `projectId=${projectId}`,
  ])

  return JSON.parse(result)
}

function isFetchProjectIssuesResponse(
  data: unknown
): data is FetchProjectIssuesResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'data' in data &&
    typeof data.data === 'object' &&
    data.data !== null &&
    'node' in data.data &&
    typeof data.data.node === 'object' &&
    data.data.node !== null &&
    'items' in data.data.node &&
    typeof data.data.node.items === 'object' &&
    data.data.node.items !== null &&
    'nodes' in data.data.node.items &&
    Array.isArray(data.data.node.items.nodes)
  )
}

function validateGraphQLResponse(data: unknown): FetchProjectIssuesResponse {
  if (isFetchProjectIssuesResponse(data)) {
    return data
  }

  throw new GitHubGraphQLError('fetchProjectIssues', ['data.node.items.nodes'])
}

function findFirstTodoItem(
  response: FetchProjectIssuesResponse,
  todoStatusId: string
): ProjectItem {
  const todoItems = filterTodoItems(
    response.data.node.items.nodes,
    todoStatusId
  )

  if (todoItems.length === 0) {
    throw new IssueNotFoundError()
  }

  const firstItem = todoItems[0]

  if (!firstItem) {
    throw new Error('First item is undefined')
  }

  return firstItem
}

function extractIssueFromItem(item: ProjectItem): GitHubIssue {
  const issue = item.content

  if (!issue) {
    throw new Error('Issue content is null')
  }

  return issue
}

function filterTodoItems(
  items: ProjectItem[],
  todoStatusId: string
): ProjectItem[] {
  return items.filter(
    (item) =>
      item.fieldValueByName?.optionId === todoStatusId && item.content !== null
  )
}

function extractIssueLabel(labels: GitHubLabel[]): string {
  const nonPriorityLabel = labels.find(
    (label) => !label.name.startsWith(LABEL.PRIORITY_PREFIX)
  )
  return nonPriorityLabel ? nonPriorityLabel.name : LABEL.DEFAULT_LABEL
}
