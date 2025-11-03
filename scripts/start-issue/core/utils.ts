import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SystemCommandError } from './errors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const PROJECT_ROOT = path.resolve(__dirname, '../../..')

export function runCommand(
  command: string,
  args: string[],
  env?: NodeJS.ProcessEnv
): string {
  const result = spawnSync(command, args, {
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: PROJECT_ROOT,
    env,
  })

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim() ?? ''
    throw new SystemCommandError(command, args, stderr)
  }

  return result.stdout?.toString().trim() ?? ''
}

export function getRequiredEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`環境変数${key}が設定されていません`)
  }
  return value
}

export function log(message: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]
  console.log(`[${timestamp}] ${message}`)
}

export function logError(error: Error | string) {
  const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0]

  if (error instanceof Error) {
    console.error(`[${timestamp}] ERROR: ${error.message}`)
    if (error.stack) {
      console.error(error.stack)
    }
  } else {
    console.error(`[${timestamp}] ERROR: ${error}`)
  }
}
