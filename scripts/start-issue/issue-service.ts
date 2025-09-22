import dotenv from 'dotenv'
import path from 'node:path'

import {
  type Ctx,
  PROJECT_ROOT,
  type SearchResponse,
  assertCloudTranslation,
  assertIssueNumber,
  assertIssueTitle,
  assertZenHubEndPoint,
  assertZenHubIssueId,
  assertZenHubTodoPipelineId,
  assertZenHubToken,
  getRequiredEnv,
  log,
  runCommand,
} from './context.js'

export function loadEnv(): Ctx {
  dotenv.config({ path: path.join(PROJECT_ROOT, '.env') })
  const mysqlRootPassword = getRequiredEnv('MYSQL_ROOT_PASSWORD')
  const mysqlUser = getRequiredEnv('MYSQL_USER')
  const googleTranslateApiKey = getRequiredEnv('GOOGLE_TRANSLATE_API_KEY')
  const zenhubToken = getRequiredEnv('ZENHUB_TOKEN')
  const zenhubEndpoint = getRequiredEnv('ZENHUB_ENDPOINT')
  const todoPipelineId = getRequiredEnv('ZENHUB_TODO_PIPELINE_ID')
  const doingPipelineId = getRequiredEnv('ZENHUB_DOING_PIPELINE_ID')

  log('環境変数を読み込みました')
  return {
    zenHub: {
      token: zenhubToken,
      endPoint: zenhubEndpoint,
      todoPipelineId,
      doingPipelineId,
    },
    cloudTranslation: googleTranslateApiKey,
    environment: {
      dbRootPassword: mysqlRootPassword,
      dbUser: mysqlUser,
    },
  }
}

export async function fetchIssue(ctx: Ctx): Promise<Ctx> {
  assertZenHubTodoPipelineId(ctx)
  assertZenHubEndPoint(ctx)
  assertZenHubToken(ctx)

  const query = `
    query($pipelineId: ID!, $labels: [String!]) {
      searchIssuesByPipeline(pipelineId: $pipelineId, filters: { labels: { in: $labels } }) {
        nodes {
          id
          number
          title
          labels {
            nodes {
              name
            }
          }
        }
      }
    }
  `

  const variables = {
    pipelineId: ctx.zenHub.todoPipelineId,
    labels: ['priority:1'],
  }

  const data = await zenHubRequest<string | string[], SearchResponse>(
    ctx,
    query,
    variables
  )

  const firstNode = data.searchIssuesByPipeline.nodes[0]
  if (!firstNode) {
    throw new Error('対象のIssueが見つかりませんでした')
  }
  const nonPriorityLabel = firstNode.labels.nodes.find(
    (label: { name: string }) => !label.name.startsWith('priority:')
  )
  const labelName = nonPriorityLabel ? nonPriorityLabel.name : 'ラベルなし'
  log(
    `👤 選択されたIssue: #${firstNode.number} - ${firstNode.title} (${labelName})`
  )

  return {
    ...ctx,
    gitHub: {
      issueNumber: firstNode.number,
      issueTitle: firstNode.title,
      issueLabel: labelName,
    },
    zenHub: {
      ...ctx.zenHub,
      zenHubIssueId: firstNode.id,
    },
  }
}

export async function moveIssueToDoing(ctx: Ctx): Promise<void> {
  assertZenHubTodoPipelineId(ctx)
  assertZenHubIssueId(ctx)
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
    mutation($issueId: ID!, $pipelineId: ID!) {
      moveIssue(input: { issueId: $issueId, pipelineId: $pipelineId }) {
        issue {
          number
        }
      }
    }
  `

  const variables = {
    issueId: ctx.zenHub.zenHubIssueId,
    pipelineId: ctx.zenHub.doingPipelineId,
  }

  await zenHubRequest(ctx, mutation, variables)

  log(`🚚 Issue #${ctx.gitHub.issueNumber} をDoingパイプラインへ移動しました`)
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

export async function zenHubRequest<T, U>(
  config: Ctx,
  query: string,
  variables: Record<string, T>
): Promise<U> {
  assertZenHubEndPoint(config)
  assertZenHubToken(config)

  const response = await fetch(config.zenHub.endPoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.zenHub.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })

  if (!response.ok) {
    throw new Error(`ZenHub API: ${response.status} ${response.statusText}`)
  }

  const payload = await response.json()

  if (payload.errors) {
    throw new Error(`ZenHub API: ${JSON.stringify(payload.errors)}`)
  }

  if (!payload.data) {
    throw new Error('ZenHub APIからデータが取得できませんでした。')
  }

  return payload.data
}
