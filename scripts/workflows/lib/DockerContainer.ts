import { execSync } from 'node:child_process'

import { DOCKER } from '../shared/constants.js'
import { log } from '../shared/utils.js'

import { DatabaseError } from './WorkflowError.js'

export class DockerContainer {
  constructor(private readonly name: string) {}

  private isDatabasePresent(dbName: string, adminPassword: string): boolean {
    try {
      const result = execSync(
        `docker compose exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "SELECT 1 FROM pg_database WHERE datname = '${dbName}';" -t`,
        { encoding: 'utf-8' }
      )
      return result.trim() === '1'
    } catch {
      return false
    }
  }

  public cleanup(): void {
    this.stop()
    this.remove()
    this.removeImage()
  }

  private stop(): void {
    try {
      execSync(`docker stop ${this.name}`, { stdio: 'pipe' })
    } catch {
      log(`ℹ️ コンテナは既に停止済み: ${this.name}`)
    }
  }

  private remove(): void {
    try {
      execSync(`docker rm ${this.name}`, { stdio: 'pipe' })
    } catch {
      log(`ℹ️ コンテナは既に存在しません: ${this.name}`)
    }
  }

  private removeImage(): void {
    try {
      execSync(`docker rmi ${this.name}`, { stdio: 'pipe' })
    } catch {
      log(`ℹ️ イメージは既に存在しません: ${this.name}`)
    }
  }

  public static cleanupTestDbImage(): void {
    const imageIds = execSync(
      "docker images -q --filter reference='*-test-db'",
      { encoding: 'utf-8' }
    ).trim()

    if (!imageIds) {
      log('ℹ️ test-dbイメージは既に存在しません')
      return
    }

    const ids = imageIds.split('\n').filter(Boolean)

    for (const imageId of ids) {
      const containerIds = execSync(
        `docker ps -aq --filter ancestor=${imageId}`,
        { encoding: 'utf-8' }
      ).trim()

      if (containerIds) {
        execSync(
          `docker rm -f ${containerIds.split('\n').filter(Boolean).join(' ')}`,
          { stdio: 'pipe' }
        )
      }
    }

    execSync(`docker rmi ${ids.join(' ')}`, { stdio: 'pipe' })
    log('✅ test-dbイメージを削除しました')
  }

  public createDatabase(dbName: string, adminPassword: string): void {
    if (this.isDatabasePresent(dbName, adminPassword)) {
      log(`ℹ️ Database already exists: ${dbName}`)
      return
    }

    try {
      execSync(
        `docker compose exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "CREATE DATABASE ${dbName};"`,
        { stdio: 'inherit' }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(
        `データベース作成に失敗しました: ${errorMessage}`,
        'DockerContainer.createDatabase'
      )
    }
  }

  public deleteDatabase(dbName: string, adminPassword: string): void {
    if (!this.isDatabasePresent(dbName, adminPassword)) {
      log(`ℹ️ Database does not exist: ${dbName}`)
      return
    }

    try {
      execSync(
        `docker compose exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "DROP DATABASE IF EXISTS ${dbName};"`,
        { stdio: 'inherit' }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(
        `データベース削除に失敗しました: ${errorMessage}`,
        'DockerContainer.deleteDatabase'
      )
    }
  }
}
