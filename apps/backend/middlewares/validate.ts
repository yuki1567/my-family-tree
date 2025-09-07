import { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'

export function validateBody(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void {
  return function(req: Request, res: Response, next: NextFunction): void {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        handleValidationError(error, res)
        return
      }
      next(error)
    }
  }
}

function handleValidationError(error: ZodError, res: Response): void {
  res.status(400).json({
    isSuccess: false,
    error: {
      statusCode: 400,
      errorCode: 'VALIDATION_ERROR',
      details: error.errors.map(err => ({
        field: err.path.join('.'),
        code: err.message
      }))
    }
  })
}