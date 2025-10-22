#!/bin/bash

set -euo pipefail

# ============================================================
# 本番環境起動スクリプト
# ============================================================
# 説明:
#   本番環境（EC2）でアプリケーションをビルドし、PM2で起動します。
#   Parameter Storeから環境変数を取得するため、事前にEC2インスタンスロールの
#   設定が必要です。
#
# 使用例:
#   ./scripts/production/start.sh
#
# 前提条件:
#   - EC2インスタンスロールが設定されていること
#   - Parameter Store (/family-tree/production/*) にパラメータが登録されていること
# ============================================================

log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# 環境変数設定
export APP_ENV=production
export AWS_REGION=${AWS_REGION:-ap-northeast-1}
export NODE_ENV=production

log "========================================="
log "本番環境起動処理開始"
log "========================================="

# 依存関係インストール
log "📦 依存関係をインストール中..."
npm ci --frozen-lockfile

# フロントエンドビルド
log "🏗️ フロントエンドをビルド中..."
npm run build:frontend

# バックエンドビルド
log "🏗️ バックエンドをビルド中..."
npm run build:backend

# PM2で起動
log "🚀 PM2でアプリケーションを起動中..."
pm2 start ecosystem.config.production.cjs

# PM2設定の保存（再起動時に復元されるように）
log "💾 PM2設定を保存中..."
pm2 save

# システム起動時の自動起動設定
log "⚙️ システム起動時の自動起動を設定中..."
pm2 startup

log "========================================="
log "✅ 本番環境起動完了"
log "========================================="
log ""
log "PM2ステータス確認: pm2 status"
log "PM2ログ確認: pm2 logs"
