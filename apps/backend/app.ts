import express from 'express'
import dotenv from 'dotenv'

// 環境変数を読み込み
dotenv.config()

const app = express()
const port = process.env['API_PORT'] || 4000

// JSON解析用ミドルウェア
app.use(express.json())

// サーバー起動
app.listen(port, () => {
  console.log(`Backend server is running on port ${port}`)
})

export default app
