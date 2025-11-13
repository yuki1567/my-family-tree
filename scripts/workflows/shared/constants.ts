export const PORTS = {
  WEB_BASE: 3000,
  API_BASE: 4000,
} as const

export const DATABASE = {
  NAME_PREFIX: 'family_tree_',
  MAX_SLUG_LENGTH: 50,
} as const

export const AWS = {
  PARAMETER_PATH: {
    DEVELOPMENT: '/family-tree/development',
    WORKTREE: '/family-tree/worktree',
  },
  PROFILE: {
    PREFIX: 'family-tree-worktree',
    REFERENCE_PROFILE: 'family-tree-dev',
  },
  REGION: 'ap-northeast-1',
} as const

export const FILES = {
  CLAUDE_LOCAL_SETTINGS: '.claude/settings.local.json',
  PROMPT: {
    TEMPLATE: '.claude/templates/worktree-prompt.md',
    OUTPUT: '.claude/tmp/generated-worktree-prompt.md',
  },
} as const

export const DOCKER = {
  DB_SERVICE: 'db',
  DB_ADMIN_USER: 'admin_user',
  DB_DEFAULT_DATABASE: 'postgres',
} as const

export const TRANSLATION = {
  API_ENDPOINT: 'https://translation.googleapis.com/language/translate/v2',
  SOURCE_LANG: 'ja',
  TARGET_LANG: 'en',
} as const

export const GRAPHQL = {
  LIMITS: {
    PROJECT_ITEMS: 100,
    ISSUE_LABELS: 10,
  },
  FIELD_NAMES: {
    STATUS: 'Status',
  },
} as const

export const LABEL = {
  PRIORITY_PREFIX: 'priority',
  DEFAULT_LABEL: 'no-label',
} as const

export const PARAMETER_KEYS = {
  GITHUB_PROJECT_ID: 'GITHUB_PROJECT_ID',
  GITHUB_PROJECT_NUMBER: 'GITHUB_PROJECT_NUMBER',
  GITHUB_STATUS_FIELD_ID: 'GITHUB_STATUS_FIELD_ID',
  GITHUB_TODO_STATUS_ID: 'GITHUB_TODO_STATUS_ID',
  GITHUB_INPROGRESS_STATUS_ID: 'GITHUB_INPROGRESS_STATUS_ID',
  GITHUB_INREVIEW_STATUS_ID: 'GITHUB_INREVIEW_STATUS_ID',
  DATABASE_ADMIN_USER: 'DATABASE_ADMIN_USER',
  DATABASE_ADMIN_PASSWORD: 'DATABASE_ADMIN_PASSWORD',
  DATABASE_USER: 'DATABASE_USER',
  DATABASE_USER_PASSWORD: 'DATABASE_USER_PASSWORD',
  GOOGLE_TRANSLATE_API_KEY: 'GOOGLE_TRANSLATE_API_KEY',
  LOG_LEVEL: 'LOG_LEVEL',
} as const

export const DEVELOPMENT_PARAMETERS = {
  GITHUB_PROJECT_ID: 'github-project-id',
  GITHUB_PROJECT_NUMBER: 'github-project-number',
  GITHUB_STATUS_FIELD_ID: 'github-status-field-id',
  GITHUB_TODO_STATUS_ID: 'github-todo-status-id',
  GITHUB_INPROGRESS_STATUS_ID: 'github-inprogress-status-id',
  GITHUB_INREVIEW_STATUS_ID: 'github-inreview-status-id',
  GOOGLE_TRANSLATE_API_KEY: 'google-translate-api-key',
  DATABASE_ADMIN_USER: 'database-admin-user',
  DATABASE_ADMIN_PASSWORD: 'database-admin-password',
  DATABASE_USER: 'database-user',
  DATABASE_USER_PASSWORD: 'database-user-password',
  LOG_LEVEL: 'log-level',
} as const

export type DevelopmentParameterKey = keyof typeof DEVELOPMENT_PARAMETERS

const WORKTREE_PARAMETER_KEYS = {
  BRANCH_NAME: 'branch-name',
  ISSUE_NUMBER: 'issue-number',
  WEB_PORT: 'web-port',
  API_PORT: 'api-port',
  DATABASE_URL: 'database-url',
  DATABASE_ADMIN_URL: 'database-admin-url',
  LOG_LEVEL: 'log-level',
  DATABASE_ADMIN_USER: 'database-admin-user',
  DATABASE_ADMIN_PASSWORD: 'database-admin-password',
  DATABASE_NAME: 'database-name',
  DATABASE_USER: 'database-user',
  DATABASE_USER_PASSWORD: 'database-user-password',
} as const

const WORKTREE_SECURE_KEYS = [
  'database-url',
  'database-admin-url',
  'database-admin-password',
  'database-user-password',
] as const

export const WORKTREE_PARAMETERS = {
  KEYS: WORKTREE_PARAMETER_KEYS,
  ALL_KEYS: Object.values(WORKTREE_PARAMETER_KEYS),
  SECURE_KEYS: WORKTREE_SECURE_KEYS,
} as const
