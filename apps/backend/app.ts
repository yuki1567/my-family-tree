import express from 'express'
import dotenv from 'dotenv'
import { envConfig } from '@/config/env'
import { globalErrorHandler, notFoundHandler } from '@/middlewares/errorHandler'
import { personRoutes } from '@/routes/personRoutes'

// 環境変数を読み込み
dotenv.config()

const app = express()
const port = envConfig.API_PORT

// ミドルウェア設定
app.use(express.json())

// ルーティング
app.use('/api', personRoutes)

// エラーハンドリング（順序重要）
app.use(notFoundHandler)
app.use(globalErrorHandler)

// サーバー起動
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`)
})

export default app
