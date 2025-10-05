import { AppError } from '@/errors/AppError.js'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { ZodError } from 'zod'

type Env = {
  Variables: Record<string, unknown>
}

function isPrismaError(error: unknown): error is PrismaClientKnownRequestError {
  return error instanceof PrismaClientKnownRequestError
}

export function createHonoApp(): Hono<Env> {
  const app = new Hono<Env>()

  // グローバルエラーハンドラー
  app.onError((error, c) => {
    console.error('Error caught:', error)

    // ZodError処理
    if (error instanceof ZodError) {
      const details = error.issues.map((e) => ({
        field: e.path.join('.'),
        code: e.message,
      }))

      return c.json(
        {
          error: {
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            details,
          },
        },
        400
      )
    }

    // PrismaError処理
    if (isPrismaError(error)) {
      console.error('Database error:', error)

      return c.json(
        {
          error: {
            statusCode: 500,
            errorCode: 'DATABASE_ERROR',
            details: [],
          },
        },
        500
      )
    }

    // AppError処理
    if (error instanceof AppError) {
      console.error('Application error:', error)

      return c.json(
        {
          error: {
            statusCode: error.statusCode,
            errorCode: error.errorCode,
            details: [],
          },
        },
        error.statusCode as Parameters<Context['json']>[1]
      )
    }

    // 予期しないエラー処理
    console.error('Unexpected error:', error)

    return c.json(
      {
        error: {
          statusCode: 500,
          errorCode: 'UNKNOWN_ERROR',
          details: [],
        },
      },
      500
    )
  })

  return app
}
