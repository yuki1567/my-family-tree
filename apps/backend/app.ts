import { Hono } from 'hono'
import { errorHandler } from '@/middlewares/errorHandler.js'

export function createApp() {
  const app = new Hono()

  app.onError(errorHandler)

  return app
}
