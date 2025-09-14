// 統合テスト用のセットアップファイル
import { afterAll } from '@jest/globals'

// 各テストファイルの後にPrisma接続を確実にクローズ
afterAll(async () => {
  // Prismaクライアントの切断処理をここに追加予定
  // 実際のPrismaクライアントが利用可能になったら実装
})
