import {
  type Ctx,
  type SearchResponse,
  getRequiredEnv,
  log,
  runCommand,
  isValidZenHubTodoPipelineId,
  isValidZenHubEndPoint,
  isValidZenHubToken,
  isValidZenHubIssueId,
  isValidIssueNumber,
  isValidIssueTitle,
  isValidcloudTranslation,
} from './context.js'

export function loadEnv(): Ctx {
  const mysqlRootPassword = getRequiredEnv('MYSQL_ROOT_PASSWORD')
  const mysqlUser = getRequiredEnv('MYSQL_USER')
  const googleTranslateApiKey = getRequiredEnv('GOOGLE_TRANSLATE_API_KEY')
  const zenhubToken = getRequiredEnv('ZENHUB_TOKEN')
  const zenhubEndpoint = getRequiredEnv('ZENHUB_ENDPOINT')
  const todoPipelineId = getRequiredEnv('ZENHUB_TODO_PIPELINE_ID')
  const doingPipelineId = getRequiredEnv('ZENHUB_DOING_PIPELINE_ID')

  log(`��	p���~W_`)
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
  if (!isValidZenHubTodoPipelineId(ctx)) {
    throw new Error('ZenHubnTodoѤ���IDL��U�fD~[�')
  }

  if (!isValidZenHubEndPoint(ctx)) {
    throw new Error('ZenHubn���ݤ��L��U�fD~[�')
  }

  if (!isValidZenHubToken(ctx)) {
    throw new Error('ZenHubn����L��U�fD~[�')
  }

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
    throw new Error('�anIssueL�dK�~[�gW_')
  }
  const nonPriorityLabel = firstNode.labels.nodes.find(
    (label: { name: string }) => !label.name.startsWith('priority:')
  )
  const labelName = nonPriorityLabel ? nonPriorityLabel.name : '���jW'
  log(
    `=d x�U�_Issue: #${firstNode.number} - ${firstNode.title} (${labelName})`
  )

  return {
    ...ctx,
    gitHub: {
      issueNumber: firstNode.number,
      issueTitle: firstNode.title,
      issueLable: labelName,
    },
    zenHub: {
      ...ctx.zenHub,
      zenHubIssueId: firstNode.id,
    },
  }
}

export async function moveIssueToDoing(ctx: Ctx): Promise<void> {
  if (!isValidZenHubTodoPipelineId(ctx)) {
    throw new Error('ZenHubnTodoѤ���IDL��U�fD~[�')
  }

  if (!isValidZenHubIssueId(ctx)) {
    throw new Error('ZenHubnTodoѤ���IDL��U�fD~[�')
  }

  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubnIssuej�L��U�fD~[�')
  }

  const currentUser = runCommand('gh', ['api', 'user', '--jq', '.login'])
  runCommand('gh', [
    'issue',
    'edit',
    ctx.gitHub.issueNumber.toString(),
    '--add-assignee',
    currentUser,
  ])

  log(
    `=d Issue #${ctx.gitHub.issueNumber} � ${currentUser} k����W~W_`
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

  log(`=� Issue #${ctx.gitHub.issueNumber} �DoingѤ���x��W~W_`)
}

export async function generateSlugTitle(ctx: Ctx): Promise<Ctx> {
  if (!isValidIssueTitle(ctx)) {
    throw new Error('Issue����L��U�fD~[�')
  }

  if (!isValidcloudTranslation(ctx)) {
    throw new Error('Google TranslatenAPI��L��U�fD~[�')
  }

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
    throw new Error('APIK����L֗gM~[�gW_')
  }
  const translated = payload.data.translations[0].translatedText

  const issueSlugTitle = translated
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  log(`=� Issue�����3���W~W_: ${issueSlugTitle}`)

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
  if (!isValidZenHubEndPoint(config)) {
    throw new Error('ZenHubn���ݤ��L��U�fD~[�')
  }

  if (!isValidZenHubToken(config)) {
    throw new Error('ZenHubn����L��U�fD~[�')
  }

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
    throw new Error('ZenHub APIK����L֗gM~[�gW_')
  }

  return payload.data
}