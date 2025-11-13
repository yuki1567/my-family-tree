import { DATABASE, PORTS } from '../shared/constants.js'
import type { WorktreeParameters } from '../shared/types.js'

type DatabaseConfig = {
  adminUser: string
  adminPassword: string
  user: string
  userPassword: string
}

export class WorktreeEnvironment {
  private readonly _webPort: number
  private readonly _apiPort: number
  private readonly _databaseName: string
  private readonly _appName: string
  private readonly _databaseUrl: string
  private readonly _databaseAdminUrl: string

  constructor(
    private readonly issueNumber: number,
    private readonly slugTitle: string,
    private readonly dbConfig: DatabaseConfig
  ) {
    this._webPort = 0
    this._apiPort = 0
    this._databaseName = ''
    this._appName = ''
    this._databaseUrl = ''
    this._databaseAdminUrl = ''
  }

  get webPort(): number {
    return this._webPort
  }

  get apiPort(): number {
    return this._apiPort
  }

  get databaseName(): string {
    return this._databaseName
  }

  get appName(): string {
    return this._appName
  }

  get databaseUrl(): string {
    return this._databaseUrl
  }

  get databaseAdminUrl(): string {
    return this._databaseAdminUrl
  }

  get databaseAdminPassword(): string {
    return this.dbConfig.adminPassword
  }

  toWorktreeParameters(_branchName: string): WorktreeParameters {
    throw new Error('Not implemented')
  }

  private generateDatabaseName(_slugTitle: string): string {
    throw new Error('Not implemented')
  }

  private truncateSlugForDatabase(_slug: string): string {
    throw new Error('Not implemented')
  }

  private buildDatabaseUrl(
    _user: string,
    _password: string,
    _dbName: string
  ): string {
    throw new Error('Not implemented')
  }
}
