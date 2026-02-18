import type {
  ApiErrorResponse,
  ErrorDetail,
  ErrorResponse,
  HttpStatusCode,
} from '@shared/api/common.js'
import type { Context } from 'hono'
import postgres from 'postgres'
import { AppError } from '@/errors/AppError.js'

export function validationErrorResponse(
  c: Context,
  issues: { path: PropertyKey[]; message: string }[]
): Response {
  const details = issues.map(
    (issue) =>
      ({
        field: issue.path.map(String).join('.'),
        code: issue.message,
      }) satisfies ErrorDetail
  )

  return createErrorResponse(c, 400, {
    errorCode: 'VALIDATION_ERROR',
    details,
  })
}

export function errorHandler(err: Error, c: Context): Response {
  // biome-ignore lint/suspicious/noConsole: エラーログの出力は運用監視上必要
  console.error(err)

  if (err instanceof AppError) {
    return createErrorResponse(c, err.statusCode, {
      errorCode: err.errorCode,
    })
  }

  if (err instanceof postgres.PostgresError) {
    return createErrorResponse(c, 500, {
      errorCode: 'DATABASE_ERROR',
    })
  }

  return createErrorResponse(c, 500, {
    errorCode: 'UNKNOWN_ERROR',
  })
}

function createErrorResponse(
  c: Context,
  statusCode: HttpStatusCode,
  error: ErrorResponse
): Response {
  return c.json({ error } satisfies ApiErrorResponse, statusCode)
}
