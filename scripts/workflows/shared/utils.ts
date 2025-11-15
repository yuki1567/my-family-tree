import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const PROJECT_ROOT = path.resolve(__dirname, '..', '..')

export function log(message: string): void {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  console.log(`[${timestamp}] ${message}`)
}

export function logError(error: unknown): void {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19)
  if (error instanceof Error) {
    const stepInfo =
      'step' in error && typeof error.step === 'string'
        ? ` [${error.step}]`
        : ''
    console.error(`[${timestamp}] ❌ ERROR${stepInfo}: ${error.message}`)
    if (error.stack) {
      console.error(error.stack)
    }
  } else {
    console.error(`[${timestamp}] ❌ ERROR: ${String(error)}`)
  }
}

export function parseIssueNumber(issueNumber: string | undefined): number {
  if (!issueNumber) {
    throw new Error('issue番号を指定してください')
  }

  const parsedIssueNumber = Number.parseInt(issueNumber, 10)
  if (Number.isNaN(parsedIssueNumber)) {
    throw new Error(`無効なissue番号です: ${issueNumber}`)
  }

  return parsedIssueNumber
}
