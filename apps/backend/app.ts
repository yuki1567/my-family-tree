import { OpenAPIHono } from '@hono/zod-openapi'
import type { ApiErrorResponse, ErrorDetail } from '@shared/api/common.js'
import { errorHandler } from '@/middlewares/errorHandler.js'

export function createApp() {
  const app = new OpenAPIHono({
    defaultHook: (result, c) => {
      if (result.success) {
        return
      }

      const details = result.error.issues.map(
        (issue) =>
          ({
            field: issue.path.join('.'),
            code: issue.message,
          }) satisfies ErrorDetail
      )

      return c.json(
        {
          error: {
            statusCode: 400,
            errorCode: 'VALIDATION_ERROR',
            details,
          },
        } satisfies ApiErrorResponse,
        400
      )
    },
  })

  app.onError(errorHandler)

  return app
}
