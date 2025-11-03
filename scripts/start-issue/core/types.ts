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
