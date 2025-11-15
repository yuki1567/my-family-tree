import { execSync } from 'node:child_process'

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
}
