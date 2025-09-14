最優先かつ未アサインのissueを自動選択して処理し、ブランチ作成からPR作成まで自動化するコマンドです。

## 実行例

```bash
# 最優先かつ未アサインのissueを自動選択
process-issue

# 特定のissue番号を指定
process-issue 123
```

## 処理フロー

### 1. Issue選択とアサイン

詳細は [Issue管理](../docs/03_development/06_issue_management.md#自動選択フロー) と [アサインコマンド](../docs/03_development/06_issue_management.md#アサインコマンド) を参照

**実行内容**:

- 最優先issueの自動選択または指定issue取得
- issue詳細の確認表示
- 自動アサイン

### 2. Git準備とWorktree作成

詳細は [Git Workflow](../docs/03_development/04_git_workflow.md#worktree-ワークフロー) を参照

**実行内容**:

- 最新の変更をpull
- ブランチ名生成: `[ラベル]/[issue番号]-[タイトルスラッグ]`
- worktree作成: `../[ラベル]/[issue番号]-[タイトルスラッグ]/`
- 環境設定ファイル自動生成（ポート・DB名など）
- VS Codeで新しいworktreeを開く
- Claude Code用プロンプトテンプレート表示

## ⚠️ CRITICAL: process-issueコマンド完了チェック

**このコマンドの役割はここで終了です。**

### ✅ 完了済み項目の確認

- [ ] issue詳細の取得・確認
- [ ] issueのアサイン
- [ ] Git準備作業（fetch、pull、worktree作成）
- [ ] .env設定ファイルの生成
- [ ] VS Codeでworktree開く（`code`コマンド実行）
- [ ] プロンプトテンプレートの出力

### 🚫 実装作業は開始しない

**重要**: このClaude Codeでは**絶対に実装作業を開始しないでください**。

- Vitestの設定ファイル作成 ❌
- package.json修正 ❌
- その他のコード変更 ❌

### ✅ 次のステップ

1. 新しく開いたVS CodeのClaude Codeで上記のプロンプトを貼り付け
2. 新しい環境で実装作業を開始

**process-issueコマンドは環境準備のみが責任範囲です。**

```

```
