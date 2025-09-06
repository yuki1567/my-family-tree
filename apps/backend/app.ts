import express from 'express'
import dotenv from 'dotenv'
import { envConfig } from './config/env.js'

// 環境変数を読み込み
dotenv.config()

const app = express()
const port = envConfig.API_PORT

// JSON解析用ミドルウェア
app.use(express.json())

// サーバー起動
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`)
})

export default app
