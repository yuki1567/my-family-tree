import dotenv from 'dotenv'
import path from 'node:path'

import {
  type Ctx,
  PROJECT_ROOT,
  assertCloudTranslation,
  assertInProgressStatusId,
  assertIssueNumber,
  assertIssueTitle,
  assertProjectId,
  assertProjectItemId,
  assertTodoStatusId,
  getRequiredEnv,
  log,
  runCommand,
} from './context.js'

export function loadEnv(): Ctx {
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })
  const mysqlRootPassword = getRequiredEnv('MYSQL_ROOT_PASSWORD')
  const mysqlUser = getRequiredEnv('MYSQL_USER')
  const googleTranslateApiKey = getRequiredEnv('GOOGLE_TRANSLATE_API_KEY')
  const githubProjectId = getRequiredEnv('GITHUB_PROJECT_ID')
  const githubProjectNumber = getRequiredEnv('GITHUB_PROJECT_NUMBER')
  const githubStatusFieldId = getRequiredEnv('GITHUB_STATUS_FIELD_ID')
  const todoStatusId = getRequiredEnv('GITHUB_TODO_STATUS_ID')
  const inProgressStatusId = getRequiredEnv('GITHUB_INPROGRESS_STATUS_ID')
  const inReviewStatusId = getRequiredEnv('GITHUB_INREVIEW_STATUS_ID')

  log('環境変数を読み込みました')
  return {
    githubProjects: {
      projectId: githubProjectId,
      projectNumber: Number(githubProjectNumber),
      statusFieldId: githubStatusFieldId,
      todoStatusId,
      inProgressStatusId,
      inReviewStatusId,
    },
    cloudTranslation: googleTranslateApiKey,
    environment: {
      dbRootPassword: mysqlRootPassword,
      dbUser: mysqlUser,
    },
  }
}

export async function fetchIssue(ctx: Ctx): Promise<Ctx> {
  assertProjectId(ctx)
  assertTodoStatusId(ctx)

  const query = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          items(first: 100) {
            nodes {
              id
              fieldValueByName(name: "Status") {
                ... on ProjectV2ItemFieldSingleSelectValue {
                  optionId
                }
              }
              content {
                ... on Issue {
                  number
                  title
                  labels(first: 10) {
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

  const result = runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${query}`,
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

  log(`👤 選択されたIssue: #${issue.number} - ${issue.title} (${labelName})`)

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

export async function moveIssueToInProgress(ctx: Ctx): Promise<void> {
  assertProjectId(ctx)
  assertProjectItemId(ctx)
  assertInProgressStatusId(ctx)
  assertIssueNumber(ctx)

  const currentUser = runCommand('gh', ['api', 'user', '--jq', '.login'])
  runCommand('gh', [
    'issue',
    'edit',
    ctx.gitHub.issueNumber.toString(),
    '--add-assignee',
    currentUser,
  ])

  log(
    `👤 Issue #${ctx.gitHub.issueNumber} を ${currentUser} にアサインしました`
  )

  const mutation = `
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

  // まずStatusフィールドのIDを取得
  const fieldQuery = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
          field(name: "Status") {
            ... on ProjectV2SingleSelectField {
              id
            }
          }
        }
      }
    }
  `

  const fieldResult = runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${fieldQuery}`,
    '-f',
    `projectId=${ctx.githubProjects.projectId}`,
  ])

  const fieldData = JSON.parse(fieldResult)
  const statusFieldId = fieldData.data?.node?.field?.id

  if (!statusFieldId) {
    throw new Error('StatusフィールドのIDが取得できませんでした')
  }

  runCommand('gh', [
    'api',
    'graphql',
    '-f',
    `query=${mutation}`,
    '-f',
    `projectId=${ctx.githubProjects.projectId}`,
    '-f',
    `itemId=${ctx.githubProjects.projectItemId}`,
    '-f',
    `statusFieldId=${statusFieldId}`,
    '-f',
    `statusValueId=${ctx.githubProjects.inProgressStatusId}`,
  ])

  log(
    `🚚 Issue #${ctx.gitHub.issueNumber} をIn Progressステータスへ移動しました`
  )
}

export async function generateSlugTitle(ctx: Ctx): Promise<Ctx> {
  assertIssueTitle(ctx)
  assertCloudTranslation(ctx)

  const endPoint = `https://translation.googleapis.com/language/translate/v2?key=${ctx.cloudTranslation}`

  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: ctx.gitHub.issueTitle,
      source: 'ja',
      target: 'en',
    }),
  })

  if (!response.ok) {
    throw new Error(`API: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()

  if (payload.errors) {
    throw new Error(`API: ${JSON.stringify(payload.errors)}`)
  }

  if (!payload.data) {
    throw new Error('APIからデータが取得できませんでした。')
  }
  const translated = payload.data.translations[0].translatedText

  const issueSlugTitle = translated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  log(`📝 Issueタイトルを翻訳・スラグ化しました: ${issueSlugTitle}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      issueSlugTitle,
    },
  }
}
