import type { Database } from '../lib/Database.js'
import type { Git } from '../lib/Git.js'
import type { GitHubApi } from '../lib/GitHubApi.js'
import type { ParameterStore } from '../lib/ParameterStore.js'

import { PARAMETER_KEYS } from './constants.js'

export type GitHubLabel = {
  name: string
}

export type GitHubLabels = {
  nodes: GitHubLabel[]
}

export type GitHubIssue = {
  number: number
  title: string
  labels: GitHubLabels
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

export type WorktreeParameterKey =
  | 'branch-name'
  | 'issue-number'
  | 'database-url'
  | 'database-admin-url'
  | 'log-level'
  | 'database-admin-user'
  | 'database-admin-password'
  | 'database-name'
  | 'database-user'
  | 'database-user-password'

export type WorktreeParameters = Record<WorktreeParameterKey, string | number>

export type ParameterDescriptor = {
  key: WorktreeParameterKey
  value: string
  name: string
  type: 'String' | 'SecureString'
}

export type Issue = {
  number: number
  title: string
  label: string
  projectItemId: string
}

export type AwsProfileConfig = {
  roleArn: string
  sourceProfile: string
}

export type GitHubStatusIds = {
  todo: string
  inProgress: string
  inReview: string
}

export type ParameterKey = (typeof PARAMETER_KEYS)[keyof typeof PARAMETER_KEYS]

export type Parameters = Record<string, string>

export type WorktreeConfig = {
  branchName: string
  databaseName: string
  worktreePath: string
  webPort: number
  apiPort: number
}

export type WorktreeEnvironmentParameters = {
  parameterStore: ParameterStore
  gitHubApi: GitHubApi
  git: Git
  database: Database
  worktreeConfig: WorktreeConfig
}
