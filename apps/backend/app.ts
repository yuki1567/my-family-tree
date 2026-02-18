import { OpenAPIHono } from '@hono/zod-openapi'
import {
  errorHandler,
  validationErrorResponse,
} from '@/middlewares/errorHandler.js'
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
      if (result.success) return
      return validationErrorResponse(c, result.error.issues)
    },
  })

  app.onError(errorHandler)

  return app
}
