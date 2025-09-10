最優先かつ未アサインのissueを自動選択して処理し、ブランチ作成からPR作成まで自動化するコマンドです。
引数なしで実行すると自動的に最優先のissueを選択し、引数でissue番号を指定することも可能です。

## 実行例

```bash
# 最優先かつ未アサインのissueを自動選択して処理
process-issue

# 特定のissue番号を指定して処理
process-issue 123
```

## 優先度の決定方法

以下の条件で最優先のissueを自動選択します：

### 1. **対象issueの条件**

- **状態**: Open（未クローズ）
- **アサイン**: 未アサイン（assignees が空）
- **優先度**: タイトルに `[数字]` 形式で指定

### 2. **選択順序**

1. **タイトルの `[数字]` で昇順ソート** (小さい数字 = 高優先度)
   - 例: `[1] バグ修正` > `[2] 機能追加` > `[10] ドキュメント更新`
2. **数字なしのissueは最低優先度**として扱う
3. **同じ優先度数字の場合はissue番号昇順**

### 3. **スキップされるissue**

- すでに誰かにアサインされているissue
- クローズ済みのissue

## 処理フロー

以下の手順で自動実行されます：

1. **最優先Issue の自動選択**（引数なしの場合）
   - 未アサインのOpen issueを一覧取得
   - タイトルの `[数字]` による優先度ソート
   - 最優先issueを自動選択

2. **Issue情報の取得と確認**
   - 選択または指定されたissue番号の詳細を GitHub CLI で取得
   - issue の タイトル、本文、ラベル を表示して確認

3. **Issueアサイン**
   - 選択されたissueを自分（現在のGitHubユーザー）にアサイン
   - `gh issue edit [issue番号] --add-assignee @me`

4. **Git準備作業**
   - リモートから最新の変更を pull
   - issue番号とタイトルから適切なブランチ名を生成
   - mainブランチを基に新しいブランチを作成
   - 新しいブランチ用の別ディレクトリ（worktree）を作成
   - VS Codeの新規タブでそのworktreeディレクトリを開く

   **詳細手順**:

   ```bash
   # 1. 最新の変更を取得
   git fetch origin && git pull origin main

   # 2. ブランチ名を生成
   BRANCH_NAME="[Labels]/[issue番号]-[タイトルスラッグ]"

   # 3. mainブランチから新しいブランチを作成
   git branch "$BRANCH_NAME" main

   # 4. 新しいブランチ用のworktreeを作成
   git worktree add "../$BRANCH_NAME" "$BRANCH_NAME"

   # 5. VS Codeで新しいworktreeを開く
   code "../$BRANCH_NAME"
   ```

5. **Issue実装**
   - issue の内容を分析
   - 必要なタスクを TodoWrite で管理
   - コーディング標準に従って実装

6. **品質チェック**（修正対象に応じて選択実行）
   - **フロントエンド修正の場合**: `docker-compose exec apps npm run quality:frontend`
   - **バックエンド修正の場合**: `docker-compose exec apps npm run quality:backend`
   - **両方修正の場合**: 両方のコマンドを実行
   - すべて通るまで修正

7. **コミット作成**
   - 適切な粒度でコミットを作成
   - コミットメッセージに issue番号 を含める

8. **PR作成**
   - ブランチをリモートにプッシュ
   - GitHub CLI で PR を作成
   - issue とのリンクを設定

## エラー処理

各段階でエラーが発生した場合、処理を停止し、具体的なエラー内容を表示します。
