import { serve } from '@hono/node-server'
import { createApp } from '@/app.js'
import { peopleRoutes } from '@/routes/peopleRoute.js'

export function startServer(): void {
  const app = createApp()

  app.route('/api', peopleRoutes)

  const port = 4000

  const server = serve({
    fetch: app.fetch,
    port,
  })

  process.on('SIGINT', () => {
    server.close(() => {
      process.exit(0)
    })
  })
}

startServer()
