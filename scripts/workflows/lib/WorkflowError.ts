export class WorkflowError extends Error {
  constructor(
    message: string,
    public readonly step: string
  ) {
    super(message)
    this.name = 'WorkflowError'
  }
}

export class ParameterStoreError extends WorkflowError {
  constructor(message: string, step: string) {
    super(message, step)
    this.name = 'ParameterStoreError'
  }
}

export class GitHubApiError extends WorkflowError {
  constructor(message: string, step: string) {
    super(message, step)
    this.name = 'GitHubApiError'
  }
}

export class IssueNotFoundError extends GitHubApiError {
  constructor(step: string) {
    super('Todoステータスのissueが見つかりません', step)
    this.name = 'IssueNotFoundError'
  }
}

export class GitHubGraphQLError extends GitHubApiError {
  constructor(operation: string, expectedFields: string[], step: string) {
    super(
      `GraphQLレスポンスの構造が不正です (operation: ${operation}, expected: ${expectedFields.join(', ')})`,
      step
    )
    this.name = 'GitHubGraphQLError'
  }
}

export class AwsProfileError extends WorkflowError {
  constructor(profileName: string, configKey: string, step: string) {
    const message =
      configKey === 'config_file'
        ? 'AWS config ファイルが見つかりません (~/.aws/config)'
        : `AWS profile "${profileName}" の ${configKey} が見つかりません`
    super(message, step)
    this.name = 'AwsProfileError'
  }
}

export class DatabaseError extends WorkflowError {
  constructor(message: string, step: string) {
    super(message, step)
    this.name = 'DatabaseError'
  }
}

export class DockerError extends WorkflowError {
  constructor(message: string, step: string) {
    super(message, step)
    this.name = 'DockerError'
  }
}

export class GitError extends WorkflowError {
  constructor(message: string, step: string) {
    super(message, step)
    this.name = 'GitError'
  }
}
