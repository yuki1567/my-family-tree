import { DATABASE, PORTS, WORKTREE_PARAMETERS } from '../shared/constants.js'
import type { DatabaseConfig, WorktreeParameters } from '../shared/types.js'

export class WorktreeEnvironment {
  private readonly _issueNumber: number
  private readonly _branchName: string
  private readonly _webPort: number
  private readonly _apiPort: number
  private readonly _databaseName: string
  private readonly _appName: string
  private readonly _databaseUrl: string
  private readonly _databaseAdminUrl: string
  private readonly _dbConfig: DatabaseConfig
  private readonly _logLevel: string

  constructor(
    issueNumber: number,
    slugTitle: string,
    dbConfig: DatabaseConfig,
    logLevel: string
  ) {
    this._issueNumber = issueNumber
    this._branchName = `feature/issue-${issueNumber}-${slugTitle}`
    this._webPort = PORTS.WEB_BASE + issueNumber
    this._apiPort = PORTS.API_BASE + issueNumber
    this._databaseName = this.generateDatabaseName(slugTitle)
    this._appName = `app-${slugTitle}`
    this._databaseUrl = this.buildDatabaseUrl(
      dbConfig.user,
      dbConfig.userPassword,
      this._databaseName
    )
    this._databaseAdminUrl = this.buildDatabaseUrl(
      dbConfig.adminUser,
      dbConfig.adminPassword,
      'postgres'
    )
    this._dbConfig = dbConfig
    this._logLevel = logLevel
  }

  public getWorktreeParameters(): WorktreeParameters {
    const KEYS = WORKTREE_PARAMETERS.KEYS
    return {
      [KEYS.ISSUE_NUMBER]: this._issueNumber,
      [KEYS.BRANCH_NAME]: this._branchName,
      [KEYS.WEB_PORT]: this._webPort,
      [KEYS.API_PORT]: this._apiPort,
      [KEYS.DATABASE_NAME]: this._databaseName,
      [KEYS.DATABASE_URL]: this._databaseUrl,
      [KEYS.DATABASE_ADMIN_URL]: this._databaseAdminUrl,
      [KEYS.DATABASE_ADMIN_USER]: this._dbConfig.adminUser,
      [KEYS.DATABASE_ADMIN_PASSWORD]: this._dbConfig.adminPassword,
      [KEYS.DATABASE_USER]: this._dbConfig.user,
      [KEYS.DATABASE_USER_PASSWORD]: this._dbConfig.userPassword,
      [KEYS.LOG_LEVEL]: this._logLevel,
    }
  }

  private generateDatabaseName(slugTitle: string): string {
    const truncatedSlug = this.truncateSlugForDatabase(slugTitle)
    return `${DATABASE.NAME_PREFIX}${truncatedSlug.replace(/-/g, '_')}`
  }

  private truncateSlugForDatabase(slugTitle: string): string {
    if (slugTitle.length <= DATABASE.MAX_SLUG_LENGTH) {
      return slugTitle
    }

    const lastHyphenIndex = slugTitle.lastIndexOf('-', DATABASE.MAX_SLUG_LENGTH)
    return lastHyphenIndex > 0
      ? slugTitle.substring(0, lastHyphenIndex)
      : slugTitle.substring(0, DATABASE.MAX_SLUG_LENGTH)
  }

  private buildDatabaseUrl(
    user: string,
    password: string,
    dbName: string
  ): string {
    return `postgresql://${user}:${password}@db:5432/${dbName}`
  }
}
