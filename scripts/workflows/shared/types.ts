import type { SSMClient } from '@aws-sdk/client-ssm'

import type { GitHubApi } from '../lib/GitHubApi.js'
import type { ParameterStore } from '../lib/ParameterStore.js'

export type GitHubLabel = {
  name: string
}

export type GitHubIssue = {
  number: number
  title: string
  labels: {
    nodes: GitHubLabel[]
  }
}

export type ProjectItem = {
  id: string
  fieldValueByName: {
    optionId: string
  } | null
  content: GitHubIssue | null
}

export type FetchProjectIssuesResponse = {
  data: {
    node: {
      items: {
        nodes: ProjectItem[]
      }
    }
  }
}

export type FetchStatusFieldIdResponse = {
  data: {
    node: {
      field: {
        id: string
      }
    }
  }
}

export type GoogleTranslateResponse = {
  data: {
    translations: Array<{
      translatedText: string
    }>
  }
}

export type WorktreeParameterKey =
  | 'branch-name'
  | 'issue-number'
  | 'web-port'
  | 'api-port'
  | 'database-url'
  | 'database-admin-url'
  | 'log-level'
  | 'database-admin-user'
  | 'database-admin-password'
  | 'database-name'
  | 'database-user'
  | 'database-user-password'

export type WorktreeParameters = Record<WorktreeParameterKey, string>

export type ParameterDescriptor = {
  key: WorktreeParameterKey
  value: string
  name: string
  type: 'String' | 'SecureString'
}

export type WorktreeInfo = {
  issueNumber: number
  path: string
  branch: string
}

export type WorktreeConfig = {
  issueNumber: number
  branchName: string
  webPort: number
  apiPort: number
  databaseName: string
  databaseUrl: string
  databaseAdminUrl: string
  databaseAdminUser: string
  databaseAdminPassword: string
  databaseUser: string
  databaseUserPassword: string
  appName?: string
  awsProfileName: string
}

export type BaseContext = {
  ssmClient: SSMClient
}

export type DatabaseConfig = {
  adminUser: string
  adminPassword: string
  user: string
  userPassword: string
}

export type WorkflowContext = {
  parameterStore: ParameterStore
  githubApi: GitHubApi
}

export type IssueData = {
  number: number
  title: string
  projectItemId: string
  label: string
  slugTitle?: string
  branchName?: string
  worktreePath?: string
}
