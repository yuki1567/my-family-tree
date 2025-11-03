export class BaseError extends Error {
  constructor(message: string) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ParameterNotFoundError extends BaseError {
  constructor(parameterName: string, parameterPath: string) {
    super(
      `必須パラメータ '${parameterName}' がParameter Storeに見つかりません。\n` +
        `パス: ${parameterPath}`
    )
  }
}

export class AWSAuthenticationError extends BaseError {
  constructor(missingVariable: 'AWS_VAULT' | 'AWS_REGION') {
    const messages = {
      AWS_VAULT:
        `AWS_VAULT環境変数が設定されていません。\n` +
        `このスクリプトはaws-vault経由で実行する必要があります。\n` +
        `実行例: aws-vault exec family-tree-dev -- npm run start:issue`,
      AWS_REGION:
        `AWS_REGION環境変数が設定されていません。\n` +
        `aws-vaultの設定を確認してください。`,
    }
    super(messages[missingVariable])
  }
}

export class GitHubGraphQLError extends BaseError {
  constructor(operationName: string, expectedFields: string[]) {
    super(
      `GitHub GraphQL '${operationName}' が失敗しました。\n` +
        `期待されるフィールド: ${expectedFields.join(', ')}`
    )
  }
}

export class IssueNotFoundError extends BaseError {
  constructor() {
    super(`To Doステータスのissueが見つかりませんでした。`)
  }
}

export class GoogleTranslateError extends BaseError {
  constructor(statusCode: number, statusText: string) {
    super(
      `Google翻訳APIが失敗しました。\n` +
        `HTTPステータス: ${statusCode} ${statusText}`
    )
  }
}

export class SystemCommandError extends BaseError {
  constructor(command: string, args: string[], stderr: string) {
    super(
      `コマンドの実行に失敗しました。\n` +
        `コマンド: ${command} ${args.join(' ')}\n` +
        `エラー: ${stderr}`
    )
  }
}

export class DatabaseCommandError extends BaseError {
  constructor(command: string, args: string[], dbName: string) {
    super(
      `データベースコマンドが失敗しました。\n` +
        `コマンド: ${command} ${args.join(' ')}\n` +
        `DB名: ${dbName}`
    )
  }
}

export class ParametersEmptyError extends BaseError {
  constructor(parameterPath: string) {
    super(
      `Parameter Storeにパラメータが見つかりません。\n` +
        `パス: ${parameterPath}\n` +
        `scripts/ssm/register-params.sh でパラメータを登録してください。`
    )
  }
}

export class ParameterValueEmptyError extends BaseError {
  constructor(parameterName: string | undefined) {
    super(
      `パラメータ ${parameterName} の値が空です。\n` +
        `Parameter Storeの設定を確認してください。`
    )
  }
}

export class ParameterNameUndefinedError extends BaseError {
  constructor() {
    super(
      `パラメータ名が未定義です。Parameter Storeのデータを確認してください。`
    )
  }
}
