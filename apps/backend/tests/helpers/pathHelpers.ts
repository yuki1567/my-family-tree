import path from 'node:path'

import { envConfig } from '../setup/env.js'

/**
 * バックエンドディレクトリパスを取得
 * @returns バックエンドディレクトリパス
 */
export function getBackendDir(): string {
  return path.join(envConfig.ROOT_PATH, 'apps', 'backend')
}
