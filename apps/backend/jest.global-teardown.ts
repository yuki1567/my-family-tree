// 統合テスト用のグローバルティアダウン
export default async function globalTeardown() {
  console.log('🧹 Global teardown: 統合テスト環境をクリーンアップ中...')
  
  // 必要に応じて最終クリーンアップ処理をここに追加
  // 例：テスト用データベースの最終クリーンアップなど
}