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
   git fetch origin
   git pull origin main

   # 2. ブランチ名生成とworktree作成
   git worktree add "../[Labels]/[issue番号]-[タイトルスラッグ]" -b "[Labels]/[issue番号]-[タイトルスラッグ]" main

   # 3. VS Codeでworktreeを開き、Claude Code起動の準備

   # VS Codeで新しいworktreeを開く
   code "../[Labels]/[issue番号]-[タイトルスラッグ]"
   ```
