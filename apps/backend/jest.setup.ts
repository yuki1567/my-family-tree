// 統合テスト用のセットアップファイル
import { prisma } from '@/config/database'

// 各テストファイルの後にPrisma接続を確実にクローズ
afterAll(async () => {
  await prisma.$disconnect()
})