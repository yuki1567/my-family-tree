import { globalErrorHandler } from '@/middlewares/errorHandler.js'
import { personRoutes } from '@/routes/personRoutes.js'
import express from 'express'

export function createApp(): express.Express {
  const app = express()

  // ミドルウェア設定
  app.use(express.json())

  // ルーティング
  app.use('/api', personRoutes)

  // エラーハンドリング
  app.use(globalErrorHandler)

  return app
}
