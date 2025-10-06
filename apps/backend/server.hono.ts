import { createHonoApp } from '@/app.hono.js'
import { personRoutesHono } from '@/routes/personRoutes.hono.js'
import { serve } from '@hono/node-server'

export function startHonoServer(): void {
  const app = createHonoApp()

  // ルーティング設定
  app.route('/api', personRoutesHono)

  // ポート設定（環境変数 HONO_PORT または デフォルト 3001）
  const port = Number(process.env['HONO_PORT']) || 3001

  serve({
    fetch: app.fetch,
    port,
  })

  console.log(`Hono server is running on port ${port}`)
}

startHonoServer()
