import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * バックエンドディレクトリパスを取得
 * @returns バックエンドディレクトリパス
 */
export function getBackendDir(): string {
  return path.resolve(__dirname, '..', '..')
}
