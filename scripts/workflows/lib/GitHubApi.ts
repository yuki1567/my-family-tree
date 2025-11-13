import { execSync } from 'child_process'

import { LABEL } from '../shared/constants.js'
import {
  GitHubApiError,
  GitHubGraphQLError,
  IssueNotFoundError,
} from '../shared/errors.js'
import { FETCH_PROJECT_ISSUES_QUERY } from '../shared/graphql-queries.js'
import type {
  FetchProjectIssuesResponse,
  GitHubIssue,
  IssueData,
} from '../shared/types.js'

export class GitHubApi {
  constructor(
    private readonly _projectId: string,
    private readonly _statusFieldId: string,
    private readonly _statusIds: {
      todo: string
      inProgress: string
      inReview: string
    }
  ) {}

  private _issueData?: IssueData

  get projectId(): string {
    return this._projectId
  }

  get statusFieldId(): string {
    return this._statusFieldId
  }

  get inReviewStatusId(): string {
    return this._statusIds.inReview
  }

  get issueData(): IssueData {
    return this.readIssue()
  }

  public async loadTopPriorityIssue(): Promise<void> {
    const todoItems = await this.fetchProjectIssues()

    const firstItem = todoItems[0]

    if (!firstItem?.content) {
      throw new GitHubApiError('Issue内容が取得できません')
    }

    this.setIssue(firstItem.content, firstItem.id)
  }

  private readIssue(): IssueData {
    if (this._issueData === undefined) {
      throw new GitHubApiError(
        'Issue情報が読み込まれていません。loadTopPriorityIssue()を先に実行してください'
      )
    }

    return this._issueData
  }

  private async fetchProjectIssues() {
    const response = this.executeGraphQL(FETCH_PROJECT_ISSUES_QUERY, {
      projectId: this._projectId,
    })

    const validatedData = this.validateGraphQLResponse(response)

    const filterdData = validatedData.data.node.items.nodes.filter(
      (item) => item.fieldValueByName?.optionId === this._statusIds.todo
    )

    if (filterdData.length === 0) {
      throw new IssueNotFoundError()
    }

    return filterdData
  }

  private executeGraphQL(
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
      throw new GitHubApiError(`GraphQL実行エラー: ${errorMessage}`)
    }
  }

  private isFetchProjectIssuesResponse(
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

  private validateGraphQLResponse(data: unknown): FetchProjectIssuesResponse {
    if (this.isFetchProjectIssuesResponse(data)) {
      return data
    }

    throw new GitHubGraphQLError('fetchProjectIssues', [
      'data.node.items.nodes',
    ])
  }

  private setIssue(issue: GitHubIssue, projectItemId: string): void {
    this._issueData = {
      number: issue.number,
      title: issue.title,
      projectItemId,
      label: this.extractIssueLabel(issue),
    }
  }

  private extractIssueLabel(issue: GitHubIssue): string {
    const typeLabel = issue.labels.nodes.find(
      (label) => !label.name.startsWith(LABEL.PRIORITY_PREFIX)
    )
    return typeLabel?.name || LABEL.DEFAULT_LABEL
  }

  private async updateIssueStatus(
    _itemId: string,
    _statusValueId: string
  ): Promise<void> {
    throw new Error('Not implemented')
  }

  async moveToInProgress(_projectItemId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async moveToInReview(_projectItemId: string): Promise<void> {
    throw new Error('Not implemented')
  }

  async closeIssue(_issueNumber: number): Promise<void> {
    throw new Error('Not implemented')
  }
}
