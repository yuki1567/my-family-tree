import { execSync } from 'child_process'

import { LABEL } from '../shared/constants.js'
import {
  FETCH_PROJECT_ISSUES_QUERY,
  UPDATE_PROJECT_ITEM_STATUS_MUTATION,
} from '../shared/graphql-queries.js'
import type {
  FetchProjectIssuesResponse,
  GitHubLabels,
  GitHubStatusIds,
  Issue,
  ProjectItem,
} from '../shared/types.js'
import { log } from '../shared/utils.js'

import {
  GitHubApiError,
  GitHubGraphQLError,
  IssueNotFoundError,
} from './WorkflowError.js'

export class GitHubApi {
  private readonly _projectId: string
  private readonly _statusFieldId: string
  private readonly _statusIds: GitHubStatusIds
  private readonly _issue: Issue

  private constructor(
    projectId: string,
    statusFieldId: string,
    statusIds: GitHubStatusIds,
    issue: Issue
  ) {
    this._projectId = projectId
    this._statusFieldId = statusFieldId
    this._statusIds = statusIds
    this._issue = issue
  }

  get projectId(): string {
    return this._projectId
  }

  get statusFieldId(): string {
    return this._statusFieldId
  }

  get statusIds(): GitHubStatusIds {
    return this._statusIds
  }

  get issue(): Issue {
    return this._issue
  }

  public static async create(
    projectId: string,
    statusFieldId: string,
    statusIds: GitHubStatusIds
  ): Promise<GitHubApi> {
    const todoItems = await this.fetchTodoIssues(projectId, statusIds.todo)
    const firstItem = todoItems[0]

    if (!firstItem?.content) {
      throw new GitHubApiError(
        'Issueの内容が取得できません',
        'GitHubApi.create'
      )
    }

    const issue = this.extractIssue(firstItem)

    return new GitHubApi(projectId, statusFieldId, statusIds, issue)
  }

  public moveToInProgress(): void {
    GitHubApi.executeGraphQL(UPDATE_PROJECT_ITEM_STATUS_MUTATION, {
      projectId: this._projectId,
      itemId: this._issue.projectItemId,
      statusFieldId: this._statusFieldId,
      statusValueId: this._statusIds.inProgress,
    })
  }

  private static async fetchTodoIssues(
    projectId: string,
    todoStatusId: string
  ) {
    const response = this.executeGraphQL(FETCH_PROJECT_ISSUES_QUERY, {
      projectId,
    })

    const validatedData = this.validateGraphQLResponse(response)

    const filterdData = validatedData.data.node.items.nodes.filter(
      (item) => item.fieldValueByName?.optionId === todoStatusId
    )

    if (filterdData.length === 0) {
      throw new IssueNotFoundError('GitHubApi.fetchTodoIssues')
    }

    return filterdData
  }

  private static executeGraphQL(
    query: string,
    variables: Record<string, unknown>
  ): unknown {
    const variablesJson = JSON.stringify(variables).replace(/"/g, '\\"')
    const queryJson = query.replace(/\n/g, ' ').replace(/"/g, '\\"')

    try {
      const result = execSync(
        `gh api graphql -f query="${queryJson}" -f variables="${variablesJson}"`,
        { encoding: 'utf-8' }
      )
      return JSON.parse(result)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitHubApiError(
        `GraphQL実行エラー: ${errorMessage}`,
        'GitHubApi.executeGraphQL'
      )
    }
  }

  private static validateGraphQLResponse(
    data: unknown
  ): FetchProjectIssuesResponse {
    if (this.isFetchProjectIssuesResponse(data)) {
      return data
    }

    throw new GitHubGraphQLError(
      'fetchProjectIssues',
      ['data.node.items.nodes'],
      'GitHubApi.validateGraphQLResponse'
    )
  }

  private static isFetchProjectIssuesResponse(
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

  private static extractIssue(issue: ProjectItem): Issue {
    if (!issue.content) {
      throw new GitHubApiError(
        'Issueの内容が取得できません',
        'GitHubApi.extractIssue'
      )
    }

    return {
      number: issue.content?.number,
      title: issue.content?.title,
      label: this.extractIssueLabel(issue.content?.labels),
      projectItemId: issue.id,
    }
  }

  private static extractIssueLabel(labels: GitHubLabels): string {
    const typeLabel = labels.nodes.find(
      (label) => !label.name.startsWith(LABEL.PRIORITY_PREFIX)
    )
    return typeLabel?.name || LABEL.DEFAULT_LABEL
  }

  public static async closeIssue(issueNumber: number): Promise<void> {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new GitHubApiError(
        `Issueクローズに失敗しました: #${issueNumber}\n${errorMessage}`,
        'GitHubApi.closeIssue'
      )
    }
  }

  public assignToCurrentUser(): void {
    const currentUser = this.getCurrentUser()
    this.assignIssue(this._issue.number, currentUser)
  }

  private getCurrentUser(): string {
    const result = execSync('gh api user --jq .login', { encoding: 'utf-8' })
    return result.trim()
  }

  private assignIssue(issueNumber: number, userName: string): void {
    execSync(`gh issue edit ${issueNumber} --add-assignee ${userName}`, {
      encoding: 'utf-8',
    })
  }
}
