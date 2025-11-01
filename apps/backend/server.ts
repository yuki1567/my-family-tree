import { createApp } from '@/app.js'
import { peopleRoutes } from '@/routes/peopleRoute.js'
import { serve } from '@hono/node-server'

export function startServer(): void {
  const app = createApp()

  app.route('/api', peopleRoutes)

  const port = 4000

  const server = serve({
    fetch: app.fetch,
    port,
  })

  console.log(`Hono server is running on port ${port}`)

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...')
    server.close(() => {
      console.log('Hono server closed')
      process.exit(0)
    })
  })
}

startServer()
