このworktreeでissue #{{ISSUE_NUMBER}}の開発を開始します。

【Issue情報】

- タイトル: {{ISSUE_TITLE}}
- ブランチ: {{BRANCH_NAME}}
- 環境: Monorepo(frontend/backend/shared) + 独立Docker環境（ポート競合なし）

【CRITICAL: 必須セットアップ手順（Docker強制実行）】
以下を**必ず順番通り**に実行してください。ローカル実行は絶対禁止です。

1. **依存関係のインストール**:

   ```bash
   # ローカル開発ツールのためのnpm install（Docker環境構築前に必要）
   npm install
   ```

2. **Docker環境とテストDB起動確認**:

   ```bash
   # 既存コンテナの状況確認
   docker-compose ps

   # 段階的起動（dbコンテナ競合回避）
   # 1) dbコンテナが未起動の場合は全て起動
   # 2) dbコンテナが起動している場合はappsコンテナのみ起動
   if ! docker-compose ps db | grep -q "Up"; then
     echo "📦 dbコンテナが未起動のため、全サービスを起動します"
     docker-compose --profile development up -d
   else
     echo "📦 既存dbコンテナを使用し、appsコンテナのみ起動します"
     docker-compose --profile development up -d --no-deps apps
   fi

   # 最終起動状況確認
   docker-compose ps
   ```

3. **アクセス確認**:
   - Frontend: http://localhost:{{APP_PORT}}
   - API: http://localhost:{{API_PORT}}

【品質チェック（実装前後で必須実行）】

```bash
# backendチェック
npm run docker:quality:backend

# frontendチェック
npm run docker:quality:frontend

# テスト実行
npm run docker:test:unit
npm run docker:test:integration
```

【CRITICAL: 実装ワークフロー（必須）】

1. **要件分析**: issueの内容を分析し、TodoWriteで実装計画を作成
2. **ドキュメント参照**: docs/ 内の技術仕様に厳密に従う
3. **テスト駆動開発**: テストファーストで品質確保
4. **段階的実装**: 小さく実装→テスト→コミットのサイクル
5. **品質チェック**: 全品質チェックコマンドが成功することを確認

このworktreeは完全に独立した環境です。メインブランチや他のissueに影響しません。
上記の手順を厳密に守って開発を進めてください。
