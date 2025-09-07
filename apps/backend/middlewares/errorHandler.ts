import { Request, Response, NextFunction } from 'express'

export function globalErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Unexpected error:', error)
  
  res.status(500).json({
    isSuccess: false,
    error: {
      statusCode: 500,
      errorCode: 'UNEXPECTED_ERROR',
      details: []
    }
  })
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    isSuccess: false,
    error: {
      statusCode: 404,
      errorCode: 'NOT_FOUND',
      details: []
    }
  })
}