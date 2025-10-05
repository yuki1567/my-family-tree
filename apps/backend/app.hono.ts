import { Hono } from 'hono'

type Env = {
  Variables: Record<string, unknown>
}

export function createHonoApp(): Hono<Env> {
  const app = new Hono<Env>()

  return app
}
