import { createHonoApp } from '@/app.js'
import { envConfig } from '@/config/env.js'
import { personRoutes } from '@/routes/personRoutes.js'
import { serve } from '@hono/node-server'

export function startServer(): void {
  const app = createHonoApp()

  app.route('/api', personRoutes)

  const port = envConfig.API_PORT

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
