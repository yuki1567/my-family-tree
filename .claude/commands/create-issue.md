以下の情報を基に熟考してClaude Codeに作業を任せるのに最適なこのリポジトリの新機能追加・不具合修正・改善提案などのissueを作成してください。
指示が曖昧な場合は、必ず質問をして明確にしてからissueを作成してください。

## ⚠️ 重要：issueを作成する前に必ず実行してください

### 1. 既存issue重複チェック

```bash
gh issue list --state open
```

提案予定のissueと類似・重複するものがないか確認してください。

### 2. 実装状況確認

関連ファイルが既に存在しないか確認してください：

```bash
# 例：CSS変数 → apps/frontend/assets/css/main.css をチェック
# 例：Person型 → apps/shared/types/ ディレクトリをチェック
```

### 3. ラベル分類ガイド

- `bug`: 不具合や期待通りに動かない問題
- `chore`: 開発環境・ビルド・設定の改善
- `docs`: ドキュメント関連
- `enhancement`: 既存コードの改善・拡張・修正
- `feature`: 完全に新しい機能・コンポーネントの作成
- `refactor`: 動作は変えずに内部のコードを整理・改善
- `test`: テストコードの追加や修正

## 💡 提案方法

事前チェック完了後、GitHubリポジトリにissueを作成してください。

条件:

### issueの作成方法

- 作業が分割できそうな場合は、適切に分割して複数のissueを作成する
- 機能全体ではなく「小さな修正」「部分的改善」「限定的な追加」に分割すること
- 1Issue = 最大2〜4時間で終わる小さなタスク（作業単位）
- 大きな改善や機能は、2〜4時間以内のタスクに分解して複数の Issue にすること

### issueのラベル

- Labels: bug, chore, docs, enhancement, feature, refactor, test のいずれかを必ず1つ付与

### issueのタイトル

- タイトルは1行（最大50文字）
- 人間が読みやすいように、簡潔でわかりやすいタイトルを付ける

### issueの内容

- 本文は「背景」「提案内容」「受け入れ基準」を含む
- 受け入れ基準は箇条書きで最低3項目

### プロジェクト情報

/Users/yuki/MyProjects/my-family-tree/docs
/Users/yuki/MyProjects/my-family-tree/README.md

出力フォーマット:

# タイトル

本文（背景/提案内容/受け入れ基準を含む）
Labels: ...

---
