import { createHonoApp } from '@/app.hono.js'
import { personRoutesHono } from '@/routes/personRoutes.hono.js'
import { serve } from '@hono/node-server'

export function startHonoServer(): void {
  const app = createHonoApp()

  // ルーティング設定
  app.route('/api', personRoutesHono)

  // ポート設定（環境変数 HONO_PORT または デフォルト 3001）
  const port = Number(process.env['HONO_PORT']) || 3001

  // サーバー起動
  const server = serve({
    fetch: app.fetch,
    port,
  })

  console.log(`Hono server is running on port ${port}`)

  // グレースフルシャットダウン
  const gracefulShutdown = () => {
    console.log('\nShutting down Hono server gracefully...')
    server.close(() => {
      console.log('Hono server closed')
      process.exit(0)
    })

    // 強制終了タイムアウト（10秒）
    setTimeout(() => {
      console.error(
        'Could not close connections in time, forcefully shutting down'
      )
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', gracefulShutdown)
  process.on('SIGINT', gracefulShutdown)
}

startHonoServer()
