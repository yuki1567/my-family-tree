import { Request, Response, NextFunction } from 'express'
import { ZodSchema } from 'zod'

export function validateBody(
  schema: ZodSchema,
): (req: Request, res: Response, next: NextFunction) => void {
  return function (req: Request, _res: Response, next: NextFunction): void {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      next(error)
    }
  }
}
