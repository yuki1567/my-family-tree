import { Hono } from 'hono'
import { errorHandler } from '@/middlewares/errorHandler.js'
import { peopleRoutes } from '@/routes/peopleRoute.js'

export function buildApp() {
  const app = createApp()

  const routes = app.route('/api', peopleRoutes)

  return routes
}

export type AppType = ReturnType<typeof buildApp>

export function createApp() {
  const app = new Hono()

  app.onError(errorHandler)

  return app
}
