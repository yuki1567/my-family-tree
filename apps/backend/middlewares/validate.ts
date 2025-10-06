import { mapZodErrorToResponse } from '@/utils/zodErrorMapper.js'
import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

export function validateBody(
  schema: ZodSchema
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req: Request, res: Response, next: NextFunction): void {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errorResponse = mapZodErrorToResponse(result.error)
      res.status(400).json(errorResponse)
      return
    }

    req.body = result.data
    next()
  }
}
