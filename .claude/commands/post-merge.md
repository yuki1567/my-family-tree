PRマージ後の後処理を自動実行するコマンドです。
worktreeディレクトリから実行して、開発完了後のリソース整理を行います。

## 実行例

```bash
# 現在のworktreeで実行（自動検知）
post-merge

# 特定のissue番号を指定
post-merge 123
```

## 処理フロー

以下の手順で自動実行されます：

1. **環境情報の取得**
   - 現在のworktree情報を取得
   - ブランチ名からissue番号を特定
   - .envファイルから環境変数を読み込み

2. **PRマージ状況の確認**
   - GitHub APIでPRのマージ状況を確認
   - マージされていない場合は警告表示

3. **worktree専用リソースの削除**

   ```bash
   # worktree専用データベース削除（安全チェック付き）
   docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS \`${DB_NAME}\`;"
   ```

4. **メインプロジェクトへの復帰**

   ```bash
   # メインディレクトリに移動
   cd "$MAIN_PROJECT_PATH"

   # 最新のmainブランチを取得
   git fetch origin
   git checkout main
   git pull origin main
   ```

5. **依存関係・スキーマの変更チェック**
   - package.json, Dockerfile, docker-compose, prisma/schema の変更を検出
   - 変更があった場合、確認プロンプト後にappsコンテナ更新

   ```bash
   # 依存関係とスキーマ更新
   npm install

   # appsコンテナのみ更新
   docker-compose stop apps
   docker-compose rm -f apps
   docker rmi apps
   docker-compose up -d apps
   ```

6. **worktreeとブランチの削除**

   ```bash
   # worktree削除
   git worktree remove --force "$CURRENT_WORKTREE"

   # ローカルブランチ削除
   git branch -D "$BRANCH_NAME"

   # リモートブランチ削除
   git push origin --delete "$BRANCH_NAME"
   ```

7. **issueの完了処理**

   ```bash
   # issueクローズ
   gh issue close "$ISSUE_NUMBER" --comment "✅ 開発完了・マージ済み"
   ```

8. **開発環境の復帰**
   ```bash
   # VS Codeでメインプロジェクトを開く
   code .
   ```

## 安全機能

- **PRマージ確認**: マージされていない場合の警告表示
- **データベース保護**: メインDBの誤削除防止
- **エラー処理**: 各段階でのエラーハンドリング

## 実行条件

- worktreeディレクトリから実行すること
- GitHub CLIが設定済みであること
- Dockerコンテナが適切に設定されていること
- .envファイルにDB_NAME, APP_NAME等が設定されていること

## 注意事項

⚠️ **このコマンドは以下のリソースを削除します**：

- worktree専用データベース
- worktreeディレクトリ
- 開発ブランチ（ローカル・リモート）

実行前にPRがマージされ、必要なコードがmainブランチに反映されていることを確認してください。
