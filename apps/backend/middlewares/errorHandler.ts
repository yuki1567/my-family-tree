import type { ApiErrorResponse, ErrorDetail } from '@shared/api/common.js'
import type { Context } from 'hono'
import postgres from 'postgres'
import { ZodError } from 'zod'
import { AppError } from '@/errors/AppError.js'

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof ZodError) {
    const details = err.issues.map(
      (issue) =>
        ({
          field: issue.path.join('.'),
          code: issue.message,
        }) satisfies ErrorDetail
    )

    return c.json({
      error: {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        details,
      },
    } satisfies ApiErrorResponse)
  }

  if (err instanceof postgres.PostgresError) {
    // biome-ignore lint/suspicious/noConsole: DBエラーのログ出力は運用監視上必要
    console.error('Database error:', err)

    return c.json({
      error: {
        statusCode: 500,
        errorCode: 'DATABASE_ERROR',
        details: [],
      },
    } satisfies ApiErrorResponse)
  }

  if (err instanceof AppError) {
    // biome-ignore lint/suspicious/noConsole: アプリケーションエラーのログ出力は運用監視上必要
    console.error('Application error:', err)

    return c.json({
      error: {
        statusCode: err.statusCode,
        errorCode: err.errorCode,
        details: [],
      },
    } satisfies ApiErrorResponse)
  }

  // biome-ignore lint/suspicious/noConsole: 未知のエラーのログ出力は運用監視上必要
  console.error('UNKNOWN_ERROR:', err)

  return c.json({
    error: {
      statusCode: 500,
      errorCode: 'UNKNOWN_ERROR',
      details: [],
    },
  } satisfies ApiErrorResponse)
}
