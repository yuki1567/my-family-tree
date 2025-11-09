import { execSync } from 'node:child_process'

import { log } from '../shared/utils.js'

export function stopContainer(containerName: string): void {
  try {
    execSync(`docker stop ${containerName}`, { stdio: 'pipe' })
    log(`🛑 コンテナ停止: ${containerName}`)
  } catch {
    log(`ℹ️ コンテナは既に停止済み: ${containerName}`)
  }
}

export function removeContainer(containerName: string): void {
  try {
    execSync(`docker rm ${containerName}`, { stdio: 'pipe' })
    log(`🗑 コンテナ削除: ${containerName}`)
  } catch {
    log(`ℹ️ コンテナは既に存在しません: ${containerName}`)
  }
}

export function removeImage(imageName: string): void {
  try {
    execSync(`docker rmi ${imageName}`, { stdio: 'pipe' })
    log(`🗑 イメージ削除: ${imageName}`)
  } catch {
    log(`ℹ️ イメージは既に存在しません: ${imageName}`)
  }
}

export function cleanupWorktreeContainer(appName: string): void {
  if (!appName) {
    log('ℹ️ APP_NAME が設定されていないため、コンテナ削除をスキップします')
    return
  }

  log(`🐳 Worktreeコンテナ処理開始: ${appName}`)

  stopContainer(appName)
  removeContainer(appName)
  removeImage(appName)

  log(`✅ Worktreeコンテナ削除完了: ${appName}`)
}
