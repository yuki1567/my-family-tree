export class WorktreeScriptError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WorktreeScriptError'
  }
}

export class ParameterStoreError extends WorktreeScriptError {
  constructor(message: string) {
    super(message)
    this.name = 'ParameterStoreError'
  }
}

export class GitHubApiError extends WorktreeScriptError {
  constructor(message: string) {
    super(message)
    this.name = 'GitHubApiError'
  }
}

export class AwsProfileConfigError extends WorktreeScriptError {
  constructor(profileName: string, configType: 'config_file' | 'role_arn') {
    const messages = {
      config_file: 'AWS config ファイルが見つかりません (~/.aws/config)',
      role_arn: `AWS profile "${profileName}" の role_arn が見つかりません`,
    }
    super(messages[configType])
    this.name = 'AwsProfileConfigError'
  }
}

export class DatabaseError extends WorktreeScriptError {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class DockerError extends WorktreeScriptError {
  constructor(message: string) {
    super(message)
    this.name = 'DockerError'
  }
}

export class GitOperationError extends WorktreeScriptError {
  constructor(message: string) {
    super(message)
    this.name = 'GitOperationError'
  }
}
