Claude Codeによる作業に最適化されたissueを作成するためのコマンドです。

詳細は [Issue管理](../docs/03_development/06_issue_management.md) を参照

## 事前チェック（必須）

### 1. 重複確認

```bash
gh issue list --state open
```

### 2. 実装状況確認

関連ファイルが既に存在しないかチェック

### 3. ラベル選択

詳細は [Issue管理](../docs/03_development/06_issue_management.md#ラベル定義) を参照

## Issue作成要件

詳細は [Issue管理](../docs/03_development/06_issue_management.md#issue作成要件) を参照

### 要件サマリー

- **分割基準**: 1issue = 2-4時間の作業量
- **タイトル**: 1行（最大50文字）
- **本文**: 背景・提案内容・受け入れ基準（最低3項目）
- **ラベル**: 必ず1つ付与

### 出力フォーマット

```
# タイトル

## 背景
[なぜ必要か]

## 提案内容
[何を実装するか]

## 受け入れ基準
- [ ] [基準1]
- [ ] [基準2]
- [ ] [基準3]

Labels: [ラベル名]
```
