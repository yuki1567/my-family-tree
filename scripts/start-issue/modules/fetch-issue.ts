import { FETCH_PROJECT_ISSUES_QUERY } from '../core/graphql-queries.js'
import type { FetchIssueOutput, LoadEnvOutput } from '../core/types.js'
import { log, runCommand } from '../core/utils.js'

export async function fetchIssue(
  ctx: LoadEnvOutput
): Promise<FetchIssueOutput> {
  const result = runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${FETCH_PROJECT_ISSUES_QUERY}`,
    '-f',
    `projectId=${ctx.githubProjects.projectId}`,
  ])

  const data = JSON.parse(result)

  if (!data.data?.node?.items?.nodes) {
    throw new Error('Github Projects APIからデータが取得できませんでした')
  }

  const todoItems = data.data.node.items.nodes.filter(
    (item: {
      fieldValueByName: { optionId: string } | null
      content: {
        number: number
        title: string
        labels: { nodes: Array<{ name: string }> }
      } | null
    }) =>
      item.fieldValueByName?.optionId === ctx.githubProjects.todoStatusId &&
      item.content
  )

  if (todoItems.length === 0) {
    throw new Error('To Doステータスのissueが見つかりませんでした')
  }

  const firstItem = todoItems[0]
  const issue = firstItem.content

  const nonPriorityLabel = issue.labels.nodes.find(
    (label: { name: string }) => !label.name.startsWith('priority:')
  )
  const labelName = nonPriorityLabel ? nonPriorityLabel.name : 'ラベルなし'

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
      projectItemId: firstItem.id,
    },
  }
}
