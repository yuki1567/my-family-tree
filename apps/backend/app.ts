import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import { envConfig } from '@/config/env'
import { globalErrorHandler } from '@/middlewares/errorHandler'
import { personRoutes } from '@/routes/personRoutes'

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

function startServer(): void {
  const app = createApp()
  const port = envConfig.API_PORT

  app.listen(port, () => {
    console.log(`Backend server is running on port ${port}`)
  })
}

startServer()
