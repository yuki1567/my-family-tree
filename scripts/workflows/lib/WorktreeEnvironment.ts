import path from 'node:path'

import { DATABASE, PORTS, WORKTREE_PARAMETERS } from '../shared/constants.js'
import { WorktreeScriptError } from '../shared/errors.js'
import type { DatabaseConfig, WorktreeParameters } from '../shared/types.js'

export class WorktreeEnvironment {
  private _issueNumber?: number
  private _label?: string
  private _slugTitle?: string
  private _branchName?: string
  private _worktreePath?: string
  private _awsProfileName?: string

  private readonly _dbConfig: DatabaseConfig
  private readonly _logLevel: string

  constructor(dbConfig: DatabaseConfig, logLevel: string) {
    this._dbConfig = dbConfig
    this._logLevel = logLevel
  }

  public setIssueData(issue: { number: number; label: string }): void {
    this._issueNumber = issue.number
    this._label = issue.label
  }

  public setWorktreeInfo(slugTitle: string, rootPath: string): void {
    if (!this._issueNumber || !this._label) {
      throw new WorktreeScriptError(
        'Issue data must be set before setting worktree info'
      )
    }

    this._slugTitle = slugTitle
    this._branchName = `${this._label}/${this._issueNumber}-${slugTitle}`
    this._worktreePath = path.resolve(
      rootPath,
      '..',
      this._label,
      `${this._issueNumber}-${slugTitle}`
    )
  }

  public setAwsProfile(profileName: string): void {
    this._awsProfileName = profileName
  }

  get issueNumber(): number {
    if (this._issueNumber === undefined) {
      throw new WorktreeScriptError('Issue number not set')
    }
    return this._issueNumber
  }

  get slugTitle(): string {
    if (!this._slugTitle) {
      throw new WorktreeScriptError('Slug title not generated')
    }
    return this._slugTitle
  }

  get branchName(): string {
    if (!this._branchName) {
      throw new WorktreeScriptError('Branch name not generated')
    }
    return this._branchName
  }

  get worktreePath(): string {
    if (!this._worktreePath) {
      throw new WorktreeScriptError('Worktree path not generated')
    }
    return this._worktreePath
  }

  get awsProfileName(): string {
    if (!this._awsProfileName) {
      throw new WorktreeScriptError('AWS profile not set')
    }
    return this._awsProfileName
  }

  get webPort(): number {
    return PORTS.WEB_BASE + this.issueNumber
  }

  get apiPort(): number {
    return PORTS.API_BASE + this.issueNumber
  }

  get databaseName(): string {
    if (!this._slugTitle) {
      throw new WorktreeScriptError('Slug title not generated')
    }
    return this.generateDatabaseName(this._slugTitle)
  }

  get appName(): string {
    if (!this._slugTitle) {
      throw new WorktreeScriptError('Slug title not generated')
    }
    return `app-${this._slugTitle}`
  }

  get databaseUrl(): string {
    return this.buildDatabaseUrl(
      this._dbConfig.user,
      this._dbConfig.userPassword,
      this.databaseName
    )
  }

  get databaseAdminUrl(): string {
    return this.buildDatabaseUrl(
      this._dbConfig.adminUser,
      this._dbConfig.adminPassword,
      'postgres'
    )
  }

  get databaseAdminPassword(): string {
    return this._dbConfig.adminPassword
  }

  public getWorktreeParameters(): WorktreeParameters {
    const KEYS = WORKTREE_PARAMETERS.KEYS
    return {
      [KEYS.ISSUE_NUMBER]: this.issueNumber,
      [KEYS.BRANCH_NAME]: this.branchName,
      [KEYS.WEB_PORT]: this.webPort,
      [KEYS.API_PORT]: this.apiPort,
      [KEYS.DATABASE_NAME]: this.databaseName,
      [KEYS.DATABASE_URL]: this.databaseUrl,
      [KEYS.DATABASE_ADMIN_URL]: this.databaseAdminUrl,
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
