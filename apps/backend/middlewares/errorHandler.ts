import type {
  ApiErrorResponse,
  ErrorResponse,
  HttpStatusCode,
} from '@shared/api/common.js'
import type { Context } from 'hono'
import postgres from 'postgres'
import { AppError } from '@/errors/AppError.js'

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
