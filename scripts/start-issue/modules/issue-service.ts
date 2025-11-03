import { TRANSLATION } from '../core/constants.js'
import {
  FETCH_PROJECT_ISSUES_QUERY,
  FETCH_STATUS_FIELD_ID_QUERY,
  UPDATE_PROJECT_ITEM_STATUS_MUTATION,
} from '../core/graphql-queries.js'
import type { Ctx } from '../core/types.js'
import { log, runCommand } from '../core/utils.js'
import {
  assertCloudTranslation,
  assertInProgressStatusId,
  assertIssueNumber,
  assertIssueTitle,
  assertProjectId,
  assertProjectItemId,
  assertTodoStatusId,
} from '../core/validators.js'

import {
  getRequiredParameter,
  loadParametersFromStore,
} from './parameter-store.js'

export async function loadEnv(): Promise<Ctx> {
  const params = await loadParametersFromStore()

  const dbAdminUser = getRequiredParameter(params, 'DATABASE_ADMIN_USER')
  const dbAdminPassword = getRequiredParameter(
    params,
    'DATABASE_ADMIN_PASSWORD'
  )
  const dbUser = getRequiredParameter(params, 'DATABASE_USER')
  const dbUserPassword = getRequiredParameter(params, 'DATABASE_USER_PASSWORD')
  const googleTranslateApiKey = getRequiredParameter(
    params,
    'GOOGLE_TRANSLATE_API_KEY'
  )
  const githubProjectId = getRequiredParameter(params, 'GITHUB_PROJECT_ID')
  const githubProjectNumber = getRequiredParameter(
    params,
    'GITHUB_PROJECT_NUMBER'
  )
  const githubStatusFieldId = getRequiredParameter(
    params,
    'GITHUB_STATUS_FIELD_ID'
  )
  const todoStatusId = getRequiredParameter(params, 'GITHUB_TODO_STATUS_ID')
  const inProgressStatusId = getRequiredParameter(
    params,
    'GITHUB_INPROGRESS_STATUS_ID'
  )
  const inReviewStatusId = getRequiredParameter(
    params,
    'GITHUB_INREVIEW_STATUS_ID'
  )

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
      dbAdminUser,
      dbAdminPassword,
      dbUser,
      dbUserPassword,
    },
  }
}

export async function fetchIssue(ctx: Ctx): Promise<Ctx> {
  assertProjectId(ctx)
  assertTodoStatusId(ctx)

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
    throw new Error('StatusフィールドのIDが取得できませんでした')
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

export async function generateSlugTitle(ctx: Ctx): Promise<Ctx> {
  assertIssueTitle(ctx)
  assertCloudTranslation(ctx)

  const endPoint = `${TRANSLATION.API_ENDPOINT}?key=${ctx.cloudTranslation}`

  const response = await fetch(endPoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: ctx.gitHub.issueTitle,
      source: TRANSLATION.SOURCE_LANG,
      target: TRANSLATION.TARGET_LANG,
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

  log(`Issueタイトルを翻訳・スラグ化しました: ${issueSlugTitle}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      issueSlugTitle,
    },
  }
}
