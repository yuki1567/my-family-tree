import { execSync } from 'node:child_process'

import { DATABASE, DOCKER } from '../shared/constants.js'
import { DatabaseError } from '../shared/errors.js'
import { log } from '../shared/utils.js'

export class Database {
  private readonly dbName: string

  constructor(
    slugTitle: string,
    private readonly adminPassword: string
  ) {
    this.dbName = this.generateName(slugTitle)
  }

  get name(): string {
    return this.dbName
  }

  create(): void {
    log(`🗄 データベース作成: ${this.dbName}`)

    try {
      execSync(
        `docker exec -e PGPASSWORD="${this.adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "CREATE DATABASE ${this.dbName};"`,
        { stdio: 'inherit' }
      )
      log(`✅ データベース作成完了: ${this.dbName}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(`データベース作成に失敗しました: ${errorMessage}`)
    }
  }

  delete(): void {
    log(`🗄 データベース削除: ${this.dbName}`)

    try {
      execSync(
        `docker exec -e PGPASSWORD="${this.adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "DROP DATABASE IF EXISTS ${this.dbName};"`,
        { stdio: 'inherit' }
      )
      log(`✅ データベース削除完了: ${this.dbName}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(`データベース削除に失敗しました: ${errorMessage}`)
    }
  }

  private generateName(slugTitle: string): string {
    const truncatedSlug = this.truncateSlug(slugTitle)
    return `${DATABASE.NAME_PREFIX}${truncatedSlug.replace(/-/g, '_')}`
  }

  private truncateSlug(slug: string): string {
    if (slug.length <= DATABASE.MAX_SLUG_LENGTH) {
      return slug
    }

    const lastHyphenIndex = slug.lastIndexOf('-', DATABASE.MAX_SLUG_LENGTH)
    return lastHyphenIndex > 0
      ? slug.substring(0, lastHyphenIndex)
      : slug.substring(0, DATABASE.MAX_SLUG_LENGTH)
  }
}
