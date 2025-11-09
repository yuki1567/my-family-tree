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
  DEFAULT_LABEL: 'ラベルなし',
} as const

export const WORKTREE_PARAMETERS = {
  ALL_KEYS: [
    'branch-name',
    'issue-number',
    'web-port',
    'api-port',
    'database-url',
    'database-admin-url',
    'log-level',
    'database-admin-user',
    'database-admin-password',
    'database-name',
    'database-user',
    'database-user-password',
  ],
  SECURE_KEYS: [
    'database-url',
    'database-admin-url',
    'database-admin-password',
    'database-user-password',
  ],
} as const
