import { OpenAPIHono } from '@hono/zod-openapi'
import type { ApiErrorResponse, ErrorDetail } from '@shared/api/common.js'
import { errorHandler } from '@/middlewares/errorHandler.js'
import { peopleRoutes } from '@/routes/peopleRoute.js'

export function buildApp() {
  const app = createApp()

  const routes = app.route('/api', peopleRoutes)

  app.doc('/api/openapi.json', {
    openapi: '3.0.0',
    info: {
      title: 'Family Tree API',
      version: '1.0.0',
    },
  })

  return routes
}

export type AppType = ReturnType<typeof buildApp>

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
