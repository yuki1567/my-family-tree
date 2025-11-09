import { execSync } from 'node:child_process'

import { GRAPHQL, LABEL } from '../shared/constants.js'
import { GitHubApiError } from '../shared/errors.js'
import type {
  FetchProjectIssuesResponse,
  FetchStatusFieldIdResponse,
  GitHubIssue,
  ProjectItem,
} from '../shared/types.js'
import { log } from '../shared/utils.js'

const FETCH_PROJECT_ISSUES_QUERY = `
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: ${GRAPHQL.LIMITS.PROJECT_ITEMS}) {
          nodes {
            id
            fieldValueByName(name: "${GRAPHQL.FIELD_NAMES.STATUS}") {
              ... on ProjectV2ItemFieldSingleSelectValue {
                optionId
              }
            }
            content {
              ... on Issue {
                number
                title
                labels(first: ${GRAPHQL.LIMITS.ISSUE_LABELS}) {
                  nodes {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const UPDATE_PROJECT_ITEM_STATUS_MUTATION = `
  mutation($projectId: ID!, $itemId: ID!, $statusFieldId: ID!, $statusValueId: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId
        itemId: $itemId
        fieldId: $statusFieldId
        value: { singleSelectOptionId: $statusValueId }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`

const FETCH_STATUS_FIELD_ID_QUERY = `
  query($projectId: ID!) {
    node(id: $projectId) {
      ... on ProjectV2 {
        field(name: "${GRAPHQL.FIELD_NAMES.STATUS}") {
          ... on ProjectV2SingleSelectField {
            id
          }
        }
      }
    }
  }
`

export async function fetchProjectIssues(
  projectId: string,
  todoStatusId: string
): Promise<ProjectItem[]> {
  try {
    const response = await executeGraphQL<FetchProjectIssuesResponse>(
      FETCH_PROJECT_ISSUES_QUERY,
      { projectId }
    )

    return response.data.node.items.nodes.filter(
      (item) => item.fieldValueByName?.optionId === todoStatusId
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitHubApiError(`Issue一覧取得に失敗しました: ${errorMessage}`)
  }
}

export async function fetchIssueByNumber(
  projectId: string,
  issueNumber: number
): Promise<{ issue: GitHubIssue; projectItemId: string }> {
  try {
    const response = await executeGraphQL<FetchProjectIssuesResponse>(
      FETCH_PROJECT_ISSUES_QUERY,
      { projectId }
    )

    const projectItem = response.data.node.items.nodes.find(
      (item) => item.content?.number === issueNumber
    )

    if (!projectItem?.content) {
      throw new GitHubApiError(`Issue #${issueNumber} が見つかりません`)
    }

    return {
      issue: projectItem.content,
      projectItemId: projectItem.id,
    }
  } catch (error) {
    if (error instanceof GitHubApiError) {
      throw error
    }
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitHubApiError(`Issue取得に失敗しました: ${errorMessage}`)
  }
}

export async function fetchStatusFieldId(projectId: string): Promise<string> {
  try {
    const response = await executeGraphQL<FetchStatusFieldIdResponse>(
      FETCH_STATUS_FIELD_ID_QUERY,
      { projectId }
    )

    return response.data.node.field.id
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitHubApiError(
      `Status Field ID取得に失敗しました: ${errorMessage}`
    )
  }
}

export async function updateIssueStatus(
  projectId: string,
  itemId: string,
  statusFieldId: string,
  statusValueId: string
): Promise<void> {
  try {
    await executeGraphQL(UPDATE_PROJECT_ITEM_STATUS_MUTATION, {
      projectId,
      itemId,
      statusFieldId,
      statusValueId,
    })
    log('✅ Issueステータスを更新しました')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitHubApiError(
      `Issueステータス更新に失敗しました: ${errorMessage}`
    )
  }
}

export function closeIssue(issueNumber: number): void {
  try {
    const state = execSync(
      `gh issue view ${issueNumber} --json state -q ".state"`,
      { encoding: 'utf-8' }
    ).trim()

    if (state === 'CLOSED') {
      log(`ℹ️ Issue #${issueNumber} は既にクローズ済みです`)
      return
    }

    execSync(
      `gh issue close ${issueNumber} --comment "✅ 開発完了・マージ済み"`,
      { stdio: 'inherit' }
    )
    log(`✅ Issueクローズ: #${issueNumber}`)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitHubApiError(
      `Issueクローズに失敗しました: #${issueNumber}\n${errorMessage}`
    )
  }
}

export function extractIssueLabel(issue: GitHubIssue): string {
  const priorityLabel = issue.labels.nodes.find((label) =>
    label.name.startsWith(LABEL.PRIORITY_PREFIX)
  )
  return (
    priorityLabel?.name.replace(`${LABEL.PRIORITY_PREFIX}:`, '') ||
    LABEL.DEFAULT_LABEL
  )
}

async function executeGraphQL<T>(
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const variablesJson = JSON.stringify(variables).replace(/"/g, '\\"')
  const queryJson = query.replace(/\n/g, ' ').replace(/"/g, '\\"')

  try {
    const result = execSync(
      `gh api graphql -f query="${queryJson}" -f variables="${variablesJson}"`,
      { encoding: 'utf-8' }
    )
    return JSON.parse(result) as T
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    throw new GitHubApiError(`GraphQL実行エラー: ${errorMessage}`)
  }
}
