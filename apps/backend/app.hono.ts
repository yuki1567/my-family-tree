import { Hono } from 'hono'

export function createHonoApp() {
  const app = new Hono()

  return app
}
