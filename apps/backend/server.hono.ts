import { createHonoApp } from '@/app.hono.js'
import { personRoutesHono } from '@/routes/personRoutes.hono.js'
import { serve } from '@hono/node-server'

export function startHonoServer(): void {
  const app = createHonoApp()

  // ルーティング設定
  app.route('/api', personRoutesHono)

  // ポート設定（環境変数 HONO_PORT または デフォルト 3001）
  const port = Number(process.env['HONO_PORT']) || 3001

  const server = serve({
    fetch: app.fetch,
    port,
  })

  console.log(`Hono server is running on port ${port}`)

  // グレースフルシャットダウン
  const gracefulShutdown = (signal: string) => {
    console.log(`${signal} received, shutting down gracefully...`)
    server.close(() => {
      console.log('Hono server closed')
      process.exit(0)
    })
  }

  // SIGTERM: Docker/Kubernetes等のコンテナ環境からの終了シグナル
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  // SIGINT: PM2やCtrl+Cからの終了シグナル
  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
}

startHonoServer()
