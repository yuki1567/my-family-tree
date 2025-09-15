PRマージ後の後処理を自動実行するコマンドです。
メインプロジェクトディレクトリから実行して、指定したissueの開発完了後のリソース整理を行います。

## 実行例

```bash
# メインプロジェクトディレクトリで実行（issue番号必須）
post-merge 123
```

## 処理フロー

以下の手順で自動実行されます：

1. **パラメータ検証**
   - issue番号の指定確認
   - worktreeの存在確認
   - .envファイルから環境変数を読み込み

2. **PRマージ状況の確認**
   - GitHub APIでPRのマージ状況を確認
   - マージされていない場合は警告表示

3. **最新のmainブランチを取得**

   ```bash
   # 最新のmainブランチを取得
   git fetch origin
   git checkout main
   git pull origin main
   ```

4. **worktree専用リソースの削除**

   ```bash
   # worktree専用データベース削除（安全チェック付き）
   # worktreeディレクトリ内の.envから取得
   WORKTREE_DB_NAME=$(grep "DB_NAME=" "../issue-$ISSUE_NUMBER/.env" | cut -d'=' -f2)
   docker-compose exec db mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "DROP DATABASE IF EXISTS \`${WORKTREE_DB_NAME}\`;"
   ```

5. **依存関係・スキーマの変更チェック**
   - worktree内のpackage.json, Dockerfile, docker-compose, prisma/schema の変更を検出
   - 変更があった場合、確認プロンプト後にappsコンテナ更新

   ```bash
   # 依存関係とスキーマ更新（メインプロジェクトで実行）
   npm install

   # appsコンテナのみ更新
   docker-compose stop apps
   docker-compose rm -f apps
   docker rmi apps
   docker-compose up -d apps
   ```

6. **worktreeとブランチの削除**

   ```bash
   # worktree削除（メインプロジェクトから安全に削除）
   git worktree remove --force "../issue-$ISSUE_NUMBER"

   # worktreeディレクトリの物理削除（残ったファイル・ディレクトリを確実に削除）
   if [ -d "../issue-$ISSUE_NUMBER" ]; then
     rm -rf "../issue-$ISSUE_NUMBER"
     echo "worktreeディレクトリ ../issue-$ISSUE_NUMBER を削除しました"
   fi

   # ローカルブランチ削除
   git branch -D "feature/issue-$ISSUE_NUMBER"

   # リモートブランチ削除
   git push origin --delete "feature/issue-$ISSUE_NUMBER"
   ```

7. **issueの完了処理**

   ```bash
   # issueクローズ
   gh issue close "$ISSUE_NUMBER" --comment "✅ 開発完了・マージ済み"
   ```

## 安全機能

- **PRマージ確認**: マージされていない場合の警告表示
- **データベース保護**: メインDBの誤削除防止
- **エラー処理**: 各段階でのエラーハンドリング

## 実行条件

- **メインプロジェクトディレクトリから実行すること**
- GitHub CLIが設定済みであること
- Dockerコンテナが適切に設定されていること
- 対象issue番号のworktreeが存在すること
- worktree内の.envファイルにDB_NAME等が設定されていること

## 注意事項

⚠️ **このコマンドは以下のリソースを削除します**：

- 指定issueのworktree専用データベース
- 指定issueのworktreeディレクトリ
- 指定issueの開発ブランチ（ローカル・リモート）

実行前にPRがマージされ、必要なコードがmainブランチに反映されていることを確認してください。
