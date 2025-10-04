import { envConfig } from '@/config/env.js'
import { AppError, DatabaseError } from '@/errors/AppError.js'
import { Prisma } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

type ErrorLogData = {
  timestamp: string
  errorType: string
  statusCode: number
  errorCode: string
  message: string
  stack?: string
  details?: unknown
  requestPath?: string
  requestMethod?: string
}

function logError(
  error: Error,
  req: Request,
  statusCode: number,
  errorCode: string
): void {
  const logData: ErrorLogData = {
    timestamp: new Date().toISOString(),
    errorType: error.constructor.name,
    statusCode,
    errorCode,
    message: error.message,
    requestPath: req.path,
    requestMethod: req.method,
  }

  // 本番環境以外ではスタックトレースを含める
  if (envConfig.NODE_ENV !== 'production') {
    logData.stack = error.stack
  }

  // DatabaseErrorの場合は元のエラー情報も含める
  if (error instanceof DatabaseError && error.originalError) {
    logData.details = error.originalError
  }

  console.error(JSON.stringify(logData, null, 2))
}

function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: unknown }).code === 'string'
  )
}

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return

  if (!error) {
    res.status(404).json({
      error: { statusCode: 404, errorCode: 'NOT_FOUND', details: [] },
    })
    return
  }

  // ZodErrorのハンドリング
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      code: e.message,
    }))

    logError(error, req, 400, 'VALIDATION_ERROR')

    res.status(400).json({
      error: {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        details,
      },
    })
    return
  }

  // Prismaエラーのハンドリング
  if (isPrismaError(error)) {
    const dbError = new DatabaseError(
      'データベース操作エラーが発生しました',
      error
    )
    logError(dbError, req, 500, 'DATABASE_ERROR')

    res.status(500).json({
      error: {
        statusCode: 500,
        errorCode: 'DATABASE_ERROR',
        details: [],
        // 本番環境では詳細なエラーメッセージを隠す
        message:
          envConfig.NODE_ENV === 'production'
            ? 'データベースエラーが発生しました'
            : error.message,
      },
    })
    return
  }

  // AppErrorのハンドリング
  if (error instanceof AppError) {
    logError(error, req, error.statusCode, error.errorCode)

    res.status(error.statusCode).json({
      error: {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        details: [],
        message:
          envConfig.NODE_ENV === 'production'
            ? 'エラーが発生しました'
            : error.message,
      },
    })
    return
  }

  // その他の予期しないエラー
  logError(error, req, 500, 'UNEXPECTED_ERROR')

  res.status(500).json({
    error: {
      statusCode: 500,
      errorCode: 'UNEXPECTED_ERROR',
      details: [],
      message:
        envConfig.NODE_ENV === 'production'
          ? 'サーバーエラーが発生しました'
          : error.message,
    },
  })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      details: [],
    },
  })
}
