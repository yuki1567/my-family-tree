import { createHonoApp } from '@/app.js'
import { envConfig } from '@/config/env.js'
import { personRoutesHono } from '@/routes/personRoutes.hono.js'
import { serve } from '@hono/node-server'

export function startServer(): void {
  const app = createHonoApp()

  // ルーティング設定
  app.route('/api', personRoutesHono)

  const port = envConfig.API_PORT

  const server = serve({
    fetch: app.fetch,
    port,
  })

  console.log(`Hono server is running on port ${port}`)

  // PM2からのSIGINTシグナルでグレースフルシャットダウン
  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...')
    server.close(() => {
      console.log('Hono server closed')
      process.exit(0)
    })
  })
}

startServer()
