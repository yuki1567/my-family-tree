import { errorHandler } from '@/middlewares/errorHandler.js'
import { Hono } from 'hono'

export function createApp() {
  const app = new Hono()

  app.onError(errorHandler)

  return app
}
