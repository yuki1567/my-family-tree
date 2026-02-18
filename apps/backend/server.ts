import { serve } from '@hono/node-server'
import { buildApp } from '@/app.js'

function startServer(): void {
  const app = buildApp()

  const port = 4000

  const server = serve({
    fetch: app.fetch,
    port,
  })

  // biome-ignore lint/suspicious/noConsole: サーバー起動ログは運用上必要
  console.log(`Hono server is running on port ${port}`)

  process.on('SIGINT', () => {
    // biome-ignore lint/suspicious/noConsole: シャットダウンログは運用上必要
    console.log('SIGINT received, shutting down gracefully...')
    server.close(() => {
      // biome-ignore lint/suspicious/noConsole: シャットダウン完了ログは運用上必要
      console.log('Hono server closed')
      process.exit(0)
    })
  })
}

startServer()
