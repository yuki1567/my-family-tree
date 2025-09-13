import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export function globalErrorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (res.headersSent) return

  if (!error) {
    res.status(404).json({
      isSuccess: false,
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
      isSuccess: false,
      error: {
        statusCode: 400,
        errorCode: 'VALIDATION_ERROR',
        details: details,
      },
    })
    return
  }

  console.error('Unexpected error:', error)

  res.status(500).json({
    isSuccess: false,
    error: {
      statusCode: 500,
      errorCode: 'UNEXPECTED_ERROR',
      details: [],
    },
  })
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    isSuccess: false,
    error: {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      details: [],
    },
  })
}
