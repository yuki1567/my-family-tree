import { spawnSync } from 'node:child_process'
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { EOL } from 'node:os'
import path from 'node:path'

type GitHub = {
  issueNumber?: number
  issueTitle?: string
  issueLable?: string
  issueSlugTitle?: string
  branchName?: string
}

type ZenHub = {
  token?: string
  endPoint?: string
  todoPipelineId?: string
  doingPipelineId?: string
  zenHubIssueId?: string
}

type Environment = {
  webPort?: number
  apiPort?: number
  dbName?: string
  dbRootPassword?: string
  dbUser?: string
  appName?: string
  worktreePath?: string
}

type Ctx = {
  gitHub?: GitHub
  zenHub?: ZenHub
  cloudTranslation?: string
  environment?: Environment
}

type SearchResponse = {
  searchIssuesByPipeline: {
    nodes: Array<{
      id: string
      number: number
      title: string
      labels: { nodes: Array<{ name: string }> }
    }>
  }
}

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..')

async function main() {
  const loadEnvCtx = loadEnv()
  const fetchIssueCtx = await fetchIssue(loadEnvCtx)
  await moveIssueToDoing(fetchIssueCtx)
  const generateSlugTitleCtx = await generateSlugTitle(fetchIssueCtx)
  const createWorktreeCtx = createWorktree(generateSlugTitleCtx)
  const generateEnvFileCtx = generateEnvFile(createWorktreeCtx)
  createDbSchema(generateEnvFileCtx)
  openVscode(generateEnvFileCtx)
  generatePrompt(generateEnvFileCtx)
}

function loadEnv(): Ctx {
  const mysqlRootPassword = getRequiredEnv('MYSQL_ROOT_PASSWORD')
  const mysqlUser = getRequiredEnv('MYSQL_USER')
  const googleTranslateApiKey = getRequiredEnv('GOOGLE_TRANSLATE_API_KEY')
  const zenhubToken = getRequiredEnv('ZENHUB_TOKEN')
  const zenhubEndpoint = getRequiredEnv('ZENHUB_ENDPOINT')
  const todoPipelineId = getRequiredEnv('ZENHUB_TODO_PIPELINE_ID')
  const doingPipelineId = getRequiredEnv('ZENHUB_DOING_PIPELINE_ID')

  log(`環境変数を読み込みました`)
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

async function fetchIssue(ctx: Ctx): Promise<Ctx> {
  if (!isValidZenHubTodoPipelineId(ctx)) {
    throw new Error('ZenHubのTodoパイプラインIDが定義されていません')
  }

  if (!isValidZenHubEndPoint(ctx)) {
    throw new Error('ZenHubのエンドポイントが定義されていません')
  }

  if (!isValidZenHubToken(ctx)) {
    throw new Error('ZenHubのトークンが定義されていません')
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
      issueLable: labelName,
    },
    zenHub: {
      ...ctx.zenHub,
      zenHubIssueId: firstNode.id,
    },
  }
}

async function moveIssueToDoing(ctx: Ctx): Promise<void> {
  if (!isValidZenHubTodoPipelineId(ctx)) {
    throw new Error('ZenHubのTodoパイプラインIDが定義されていません')
  }

  if (!isValidZenHubIssueId(ctx)) {
    throw new Error('ZenHubのTodoパイプラインIDが定義されていません')
  }

  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubのIssue番号が定義されていません')
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

async function generateSlugTitle(ctx: Ctx): Promise<Ctx> {
  if (!isValidIssueTitle(ctx)) {
    throw new Error('Issueタイトルが定義されていません')
  }

  if (!isValidcloudTranslation(ctx)) {
    throw new Error('Google TranslateのAPIキーが定義されていません')
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

function createWorktree(ctx: Ctx): Ctx {
  if (!isValidIssueLabel(ctx)) {
    throw new Error('GitHubのIssueラベルが定義されていません')
  }

  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubのIssue番号が定義されていません')
  }

  if (!isValidIssueSlugTitle(ctx)) {
    throw new Error('スラグ化されたIssueタイトルが定義されていません')
  }

  runCommand('git', ['fetch', 'origin'])
  runCommand('git', ['stash', '-u'])
  runCommand('git', ['pull', 'origin', 'main'])
  runCommand('git', ['stash', 'pop'])

  const branchName = `${ctx.gitHub.issueLable}/${ctx.gitHub.issueNumber}-${ctx.gitHub.issueSlugTitle}`
  const worktreePath = path.resolve(PROJECT_ROOT, '..', branchName)

  runCommand('git', ['worktree', 'add', worktreePath, '-b', branchName, 'main'])
  log(`🛠 Worktreeを作成しました: ${worktreePath}`)

  return {
    ...ctx,
    gitHub: {
      ...ctx.gitHub,
      branchName,
    },
    environment: {
      ...ctx.environment,
      worktreePath,
    },
  }
}

function generateEnvFile(ctx: Ctx): Ctx {
  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubのIssue番号が定義されていません')
  }

  if (!isValidIssueSlugTitle(ctx)) {
    throw new Error('スラグ化されたIssueタイトルが定義されていません')
  }

  if (!isValidWorktreePath(ctx)) {
    throw new Error('Worktreeパスが定義されていません')
  }

  if (!isValidBranchName(ctx)) {
    throw new Error('ブランチ名が定義されていません')
  }

  const webPort = 3000 + (ctx.gitHub.issueNumber % 100)
  const apiPort = 4000 + (ctx.gitHub.issueNumber % 100)
  const dbName = `family_tree_${ctx.gitHub.issueSlugTitle.replace(/-/g, '_')}`
  const appName = `app-${ctx.gitHub.issueSlugTitle}`
  const jwtSecret = `worktree_jwt_${ctx.gitHub.issueNumber}_${Date.now()}`

  const srcEnvExample = path.join(PROJECT_ROOT, '.env.example')
  const srcEnvTest = path.join(PROJECT_ROOT, '.env.test')
  const srcClaudeLocalSettings = path.join(
    PROJECT_ROOT,
    '.claude',
    'settings.local.json'
  )

  const dstEnv = path.join(ctx.environment.worktreePath, '.env')
  const dstEnvTest = path.join(ctx.environment.worktreePath, '.env.test')
  const dstClaudeLocalSettings = path.join(
    ctx.environment.worktreePath,
    '.claude',
    'settings.local.json'
  )

  const envContent = readFileSync(srcEnvExample, 'utf-8')
    .replaceAll('{{BRANCH_NAME}}', ctx.gitHub.branchName)
    .replaceAll('{{ISSUE_NUMBER}}', String(ctx.gitHub.issueNumber))
    .replaceAll('{{APP_NAME}}', appName)
    .replaceAll('{{WEB_PORT}}', String(webPort))
    .replaceAll('{{API_PORT}}', String(apiPort))
    .replaceAll('{{DB_NAME}}', dbName)
    .replaceAll('{{JWT_SECRET}}', jwtSecret)

  writeFileSync(dstEnv, envContent)
  log(`📝 環境ファイルを作成しました: ${dstEnv}`)

  copyFileSync(srcEnvTest, dstEnvTest)
  log(`📝 テスト環境ファイルをコピーしました: ${dstEnvTest}`)

  copyFileSync(srcClaudeLocalSettings, dstClaudeLocalSettings)
  log(
    `📝 Claudeローカル設定ファイルをコピーしました: ${dstClaudeLocalSettings}`
  )

  return {
    ...ctx,
    environment: {
      ...ctx.environment,
      webPort,
      apiPort,
      dbName,
      appName,
    },
  }
}

function createDbSchema(ctx: Ctx): void {
  if (!isValidDbName(ctx)) {
    throw new Error('DB名が定義されていません')
  }

  if (!isValidDbUser(ctx)) {
    throw new Error('DBユーザ名が定義されていません')
  }

  const dbName = ctx.environment.dbName
  const dbUser = ctx.environment.dbUser
  const statements = [
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`,
    `GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX ON \`${dbName}\`.* TO '${dbUser}'@'%';`,
  ]

  log('🔐 MySQLのルートパスワード入力が求められます...')
  const result = spawnSync(
    'docker-compose',
    ['exec', 'db', 'mysql', '-u', 'root', '-p', '-e', statements.join(' ')],
    {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    }
  )

  if (result.status !== 0) {
    throw new Error('MySQLコマンドの実行に失敗しました')
  }

  log(`🗄 DBスキーマを作成しました: ${dbName}`)
}

function openVscode(ctx: Ctx) {
  if (!isValidWorktreePath(ctx)) {
    throw new Error('Worktreeパスが定義されていません')
  }

  runCommand('code', [ctx.environment.worktreePath])
  log('💻 VS Codeでworktreeを開きました')
}

function generatePrompt(ctx: Ctx) {
  if (!isValidIssueNumber(ctx)) {
    throw new Error('GitHubのIssue番号が定義されていません')
  }

  if (!isValidIssueTitle(ctx)) {
    throw new Error('Issueタイトルが定義されていません')
  }

  if (!isValidBranchName(ctx)) {
    throw new Error('ブランチ名が定義されていません')
  }

  if (!isValidApiPort(ctx)) {
    throw new Error('APIポートが定義されていません')
  }

  if (!isValidWebPort(ctx)) {
    throw new Error('WEBポートが定義されていません')
  }

  const templatePath = path.join(
    PROJECT_ROOT,
    '.claude',
    'templates',
    'worktree-prompt.md'
  )
  const outputPath = path.join(
    PROJECT_ROOT,
    '.claude',
    'tmp',
    'generated-worktree-prompt.md'
  )
  const template = readFileSync(templatePath, 'utf-8')
  const replaced = template
    .replaceAll('{{ISSUE_NUMBER}}', String(ctx.gitHub.issueNumber))
    .replaceAll('{{ISSUE_TITLE}}', ctx.gitHub.issueTitle)
    .replaceAll('{{BRANCH_NAME}}', ctx.gitHub.branchName)
    .replaceAll('{{WEB_PORT}}', String(ctx.environment.webPort))
    .replaceAll('{{API_PORT}}', String(ctx.environment.apiPort))

  writeFileSync(outputPath, replaced, 'utf-8')
  log('📝 Claude Code用プロンプトを生成しました')
}

async function zenHubRequest<T, U>(
  config: Ctx,
  query: string,
  variables: Record<string, T>
): Promise<U> {
  if (!isValidZenHubEndPoint(config)) {
    throw new Error('ZenHubのエンドポイントが定義されていません')
  }

  if (!isValidZenHubToken(config)) {
    throw new Error('ZenHubのトークンが定義されていません')
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
    throw new Error('ZenHub APIからデータが取得できませんでした。')
  }

  return payload.data
}

function runCommand(command: string, args: string[]): string {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PROJECT_ROOT,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim() ?? ''
    throw new Error(`${command} ${args.join(' ')} failed: ${stderr}`)
  }

  return result.stdout?.toString().trim() ?? ''
}

function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`環境変数${key}が設定されていません`)
  }
  return value
}

function isValidZenHubEndPoint(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { endPoint: string } } {
  return typeof ctx.zenHub?.endPoint === 'string'
}

function isValidZenHubTodoPipelineId(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { todoPipelineId: string } } {
  return typeof ctx.zenHub?.todoPipelineId === 'string'
}

function isValidZenHubToken(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { token: string } } {
  return typeof ctx.zenHub?.token === 'string'
}

function isValidZenHubIssueId(
  ctx: Ctx
): ctx is Ctx & { zenHub: ZenHub & { zenHubIssueId: string } } {
  return typeof ctx.zenHub?.zenHubIssueId === 'string'
}

function isValidIssueNumber(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueNumber: number } } {
  return typeof ctx.gitHub?.issueNumber === 'number'
}

function isValidIssueTitle(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueTitle: string } } {
  return typeof ctx.gitHub?.issueTitle === 'string'
}

function isValidIssueLabel(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueLable: string } } {
  return typeof ctx.gitHub?.issueLable === 'string'
}

function isValidIssueSlugTitle(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { issueSlugTitle: string } } {
  return typeof ctx.gitHub?.issueSlugTitle === 'string'
}

function isValidWorktreePath(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { worktreePath: string } } {
  return typeof ctx.environment?.worktreePath === 'string'
}

function isValidcloudTranslation(
  ctx: Ctx
): ctx is Ctx & { cloudTranslation: string } {
  return typeof ctx.cloudTranslation === 'string'
}

function isValidDbName(ctx: Ctx): ctx is Ctx & { dbName: string } {
  return typeof ctx.environment?.dbName === 'string'
}

function isValidDbUser(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { dbUser: string } } {
  return typeof ctx.environment?.dbUser === 'string'
}

function isValidBranchName(
  ctx: Ctx
): ctx is Ctx & { gitHub: GitHub & { branchName: string } } {
  return typeof ctx.gitHub?.branchName === 'string'
}

function isValidApiPort(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { apiPort: number } } {
  return typeof ctx.environment?.apiPort === 'number'
}

function isValidWebPort(
  ctx: Ctx
): ctx is Ctx & { environment: Environment & { webPort: number } } {
  return typeof ctx.environment?.webPort === 'number'
}

function log(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  process.stdout.write(`[${timestamp}] ${message}${EOL}`)
}

function logError(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  process.stderr.write(`[${timestamp}] ❌ ERROR: ${message}${EOL}`)
}

main().catch((error) => {
  logError(error.message)
  process.exit(1)
})
