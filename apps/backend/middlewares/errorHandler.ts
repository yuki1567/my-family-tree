import { AppError } from '@/errors/AppError.js'
import { Prisma } from '@prisma/client'
import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

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

  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      code: e.message,
    }))

    res.status(400).json({
      error: {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        details,
      },
    })
    return
  }

  if (isPrismaError(error)) {
    console.error('Database error:', error)

    res.status(500).json({
      error: {
        statusCode: 500,
        errorCode: 'DATABASE_ERROR',
        details: [],
      },
    })
    return
  }

  if (error instanceof AppError) {
    console.error('Application error:', error)

    res.status(error.statusCode).json({
      error: {
        statusCode: error.statusCode,
        errorCode: error.errorCode,
        details: [],
      },
    })
    return
  }

  console.error('Unexpected error:', error)

  res.status(500).json({
    error: {
      statusCode: 500,
      errorCode: 'UNKNOWN_ERROR',
      details: [],
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
