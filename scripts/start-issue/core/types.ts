export type GitHub = {
  issueNumber?: number
  issueTitle?: string
  issueLabel?: string
  issueSlugTitle?: string
  branchName?: string
}

export type GithubProjects = {
  projectId?: string
  projectNumber?: number
  statusFieldId?: string
  todoStatusId?: string
  inProgressStatusId?: string
  inReviewStatusId?: string
  projectItemId?: string
}

export type Environment = {
  webPort?: number
  apiPort?: number
  dbName?: string
  dbAdminUser?: string
  dbAdminPassword?: string
  dbUser?: string
  dbUserPassword?: string
  appName?: string
  worktreePath?: string
}

export type Ctx = {
  gitHub?: GitHub
  githubProjects?: GithubProjects
  cloudTranslation?: string
  environment?: Environment
}

export type InitializeContextOutput = {
  githubProjects: {
    projectId: string
    projectNumber: number
    statusFieldId: string
    todoStatusId: string
    inProgressStatusId: string
    inReviewStatusId: string
  }
  cloudTranslation: string
  environment: {
    dbAdminUser: string
    dbAdminPassword: string
    dbUser: string
    dbUserPassword: string
  }
}

export type FetchIssueOutput = InitializeContextOutput & {
  gitHub: {
    issueNumber: number
    issueTitle: string
    issueLabel: string
  }
  githubProjects: InitializeContextOutput['githubProjects'] & {
    projectItemId: string
  }
}

export type GenerateSlugTitleOutput = FetchIssueOutput & {
  gitHub: FetchIssueOutput['gitHub'] & {
    issueSlugTitle: string
  }
}

export type CreateWorktreeOutput = GenerateSlugTitleOutput & {
  gitHub: GenerateSlugTitleOutput['gitHub'] & {
    branchName: string
  }
  environment: GenerateSlugTitleOutput['environment'] & {
    worktreePath: string
  }
}

export type SetupEnvironmentOutput = CreateWorktreeOutput & {
  environment: CreateWorktreeOutput['environment'] & {
    webPort: number
    apiPort: number
    dbName: string
    appName: string
  }
}
