import { execSync } from 'node:child_process'

import { DOCKER } from '../shared/constants.js'
import { DatabaseError } from '../shared/errors.js'
import { log } from '../shared/utils.js'

export class DockerContainer {
  constructor(private readonly containerName: string) {}

  stop(): void {
    try {
      execSync(`docker stop ${this.containerName}`, { stdio: 'pipe' })
      log(`🛑 コンテナ停止: ${this.containerName}`)
    } catch {
      log(`ℹ️ コンテナは既に停止済み: ${this.containerName}`)
    }
  }

  remove(): void {
    try {
      execSync(`docker rm ${this.containerName}`, { stdio: 'pipe' })
      log(`🗑 コンテナ削除: ${this.containerName}`)
    } catch {
      log(`ℹ️ コンテナは既に存在しません: ${this.containerName}`)
    }
  }

  removeImage(): void {
    try {
      execSync(`docker rmi ${this.containerName}`, { stdio: 'pipe' })
      log(`🗑 イメージ削除: ${this.containerName}`)
    } catch {
      log(`ℹ️ イメージは既に存在しません: ${this.containerName}`)
    }
  }

  cleanup(): void {
    if (!this.containerName) {
      log('ℹ️ コンテナ名が設定されていないため、削除をスキップします')
      return
    }

    log(`🐳 Worktreeコンテナ処理開始: ${this.containerName}`)

    this.stop()
    this.remove()
    this.removeImage()

    log(`✅ Worktreeコンテナ削除完了: ${this.containerName}`)
  }

  createDatabase(dbName: string, adminPassword: string): void {
    log(`🗄 データベース作成: ${dbName}`)

    try {
      execSync(
        `docker exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "CREATE DATABASE ${dbName};"`,
        { stdio: 'inherit' }
      )
      log(`✅ データベース作成完了: ${dbName}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(`データベース作成に失敗しました: ${errorMessage}`)
    }
  }

  deleteDatabase(dbName: string, adminPassword: string): void {
    log(`🗄 データベース削除: ${dbName}`)

    try {
      execSync(
        `docker exec -e PGPASSWORD="${adminPassword}" ${DOCKER.DB_SERVICE} psql -U ${DOCKER.DB_ADMIN_USER} -d ${DOCKER.DB_DEFAULT_DATABASE} -c "DROP DATABASE IF EXISTS ${dbName};"`,
        { stdio: 'inherit' }
      )
      log(`✅ データベース削除完了: ${dbName}`)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      throw new DatabaseError(`データベース削除に失敗しました: ${errorMessage}`)
    }
  }
}
