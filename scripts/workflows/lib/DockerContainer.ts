import { execSync } from 'node:child_process'

import { DOCKER } from '../shared/constants.js'
import { DatabaseError } from '../shared/errors.js'
import { log } from '../shared/utils.js'

export class DockerContainer {
  constructor(private readonly containerName: string) {}

  public cleanup(): void {
    this.stop()
    this.remove()
    this.removeImage()
  }

  private stop(): void {
    try {
      execSync(`docker stop ${this.containerName}`, { stdio: 'pipe' })
    } catch {
      log(`ℹ️ コンテナは既に停止済み: ${this.containerName}`)
    }
  }

  private remove(): void {
    try {
      execSync(`docker rm ${this.containerName}`, { stdio: 'pipe' })
    } catch {
      log(`ℹ️ コンテナは既に存在しません: ${this.containerName}`)
    }
  }

  private removeImage(): void {
    try {
      execSync(`docker rmi ${this.containerName}`, { stdio: 'pipe' })
    } catch {
      log(`ℹ️ イメージは既に存在しません: ${this.containerName}`)
    }
  }

  public createDatabase(dbName: string, adminPassword: string): void {
    try {
      execSync(
        `docker exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "CREATE DATABASE ${dbName};"`,
        { stdio: 'inherit' }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(`データベース作成に失敗しました: ${errorMessage}`)
    }
  }

  public deleteDatabase(dbName: string, adminPassword: string): void {
    try {
      execSync(
        `docker exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "DROP DATABASE IF EXISTS ${dbName};"`,
        { stdio: 'inherit' }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(`データベース削除に失敗しました: ${errorMessage}`)
    }
  }
}
