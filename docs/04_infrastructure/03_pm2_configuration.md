# PM2統合設定書

## 1. PM2統合運用の設計方針

### 1.1 基本コンセプト

**単一コンテナ内でのフロント・バック統合管理**
- Docker apps コンテナ内でPM2による複数プロセス管理
- フロントエンド（Nuxt.js）とバックエンド（Express.js）の同時実行
- 統合ログ管理とプロセス監視

### 1.2 統合運用の利点

**運用効率**
- 単一コンテナでの一元管理
- プロセス間の依存関係自動管理
- 統合ログによるデバッグ効率化

**開発効率**
- フロント・バック同時起動
- ホットリロード統合監視
- 障害時の自動復旧

## 2. ecosystem.config.js設計

### 2.1 設定内容

**ファイル配置**: `ecosystem.config.cjs`（ルート直下）

```javascript
module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/usr/src",
      script: "npm",
      args: "run dev:frontend",
      watch: ["apps/frontend", "apps/shared"],
      ignore_watch: ["node_modules", "logs", ".git", "*.log"],
      error_file: "/apps/logs/frontend-error.log",
      out_file: "/apps/logs/frontend-out.log",
      log_file: "/apps/logs/frontend-combined.log",
    },
    // {
    //   name: "backend",
    //   script: "npm",
    //   args: "run dev:backend",
    //   cwd: "/usr/src",
    //   watch: ["apps/backend", "apps/shared"],
    //   ignore_watch: ["node_modules", "logs", ".git", "*.log"],
    //   error_file: "/apps/logs/backend-error.log",
    //   out_file: "/apps/logs/backend-out.log",
    //   log_file: "/apps/logs/backend-combined.log",
    // },
  ],
};
```

### 2.2 重要な変更点と設計理由

#### **ファイル拡張子: .js → .cjs**

**変更理由**:
- **ES Modules問題**: package.jsonに`"type": "module"`設定により、`.js`ファイルがES Moduleとして扱われる
- **CommonJS対応**: `module.exports`形式はCommonJSのため、`.cjs`拡張子で明示的に指定
- **PM2互換性**: PM2 6.0.8でのES Modules設定ファイルサポートの制限回避

#### **作業ディレクトリ: /apps → /usr/src**

**変更理由**:
- **Docker構成統一**: Dockerfileの`WORKDIR /usr/src`との整合性確保
- **npm workspace対応**: ルートpackage.jsonとworkspace設定の正常動作
- **パス参照統一**: 相対パスの起点を明確化

#### **フロントエンドプロセス設定**

**基本設定**
```javascript
name: "frontend",
cwd: "/usr/src",
script: "npm",
args: "run dev:frontend"
```
- **cwd**: 作業ディレクトリを明示的に指定（Docker環境との整合性）
- **script**: ルートpackage.jsonのnpmスクリプト実行
- **args**: `npm run dev:frontend` → `npm run dev --workspace=apps/frontend`

**監視設定**
```javascript
watch: ["apps/frontend", "apps/shared"],
ignore_watch: ["node_modules", "logs", ".git", "*.log"]
```
- **apps/frontend**: フロントエンドファイル変更時の自動再起動
- **apps/shared**: 共有ライブラリ変更時の自動再起動
  - **理由**: Nuxt.jsの自動監視だけでは不十分な場合への対応
  - **統一性**: バックエンドとの一貫した監視戦略
- **ignore_watch**: 不要なファイル変更での再起動防止
- **パフォーマンス**: node_modules等の大量ファイル監視回避

**ログ設定**
```javascript
error_file: "/apps/logs/frontend-error.log",
out_file: "/apps/logs/frontend-out.log", 
log_file: "/apps/logs/frontend-combined.log"
```
- **分離ログ**: stdout/stderrの個別管理
- **統合ログ**: combined.logでの一元確認
- **Docker対応**: ボリュームマウント対応ログパス

#### **バックエンドプロセス設定**

**基本設定**
```javascript
name: "backend",
script: "npm",
args: "run dev:backend"
```
- **integration**: ルートpackage.jsonとの連携
- **実行内容**: `npm run dev --workspace=apps/backend` → `tsx watch src/index.ts`

**監視設定**
```javascript
watch: ["apps/backend", "apps/shared"]
```
- **apps/backend**: バックエンドソースコード監視
- **apps/shared**: 共有ライブラリ監視の重要性
  - **理由**: バックエンドは共有型定義・定数・ユーティリティに依存
  - **効果**: shared変更時のバックエンド自動再起動
  - **具体例**: `@shared/types/person.ts` 変更 → backend再起動

**作業ディレクトリ**
```javascript
cwd: "/usr/src"
```
- **Docker統一**: Dockerfileの`WORKDIR /usr/src`との完全一致
- **パス解決**: 相対パス・エイリアスの正常動作
- **package.json**: ルートのワークスペース設定との整合性
- **ボリュームマウント**: `/usr/src/apps`への部分マウントとの整合性

### 2.3 package.jsonスクリプトとの連携

#### **ルートpackage.json連携**

**スクリプト実行フロー**
```
PM2 ecosystem.config.js
├── frontend: npm run dev:frontend
│   └── npm run dev --workspace=apps/frontend
│       └── nuxt dev (apps/frontend/package.json)
└── backend: npm run dev:backend
    └── npm run dev --workspace=apps/backend
        └── tsx watch --clear-screen=false src/index.ts
```

**連携の利点**
- **一元管理**: package.jsonでのスクリプト管理
- **保守性**: PM2設定とpackage.jsonの疎結合
- **柔軟性**: 各アプリの開発コマンド変更への対応

#### **個別package.json対応**

**フロントエンド（apps/frontend/package.json）**
```json
"scripts": {
  "dev": "nuxt dev"
}
```
- **Nuxt.js起動**: 開発サーバー + HMR
- **ポート**: 3000番（デフォルト）

**バックエンド（apps/backend/package.json）**
```json
"scripts": {
  "dev": "tsx watch --clear-screen=false src/index.ts"
}
```
- **tsx watch**: TypeScript直接実行 + ファイル監視
- **--clear-screen=false**: PM2ログとの整合性

## 3. 監視戦略

### 3.1 ファイル監視設計

#### **フロントエンド監視**
```javascript
watch: ["apps/frontend", "apps/shared"]
```
**監視対象**:
- `apps/frontend/**/*.vue` (Vue SFC)
- `apps/frontend/**/*.ts` (TypeScript)
- `apps/frontend/**/*.css` (スタイル)
- `apps/frontend/nuxt.config.ts` (設定)
- `apps/shared/**/*.ts` (共有ライブラリ)

#### **バックエンド監視**
```javascript
watch: ["apps/backend", "apps/shared"]
```
**監視対象**:
- `apps/backend/**/*.ts` (Express.js)
- `apps/shared/**/*.ts` (共有ライブラリ)

**apps/shared監視の重要性**
- **型定義変更**: インターフェース更新時の自動反映
- **定数変更**: API_ROUTES等の設定変更反映
- **ユーティリティ変更**: 共通関数修正の即座反映

### 3.2 監視除外設定

```javascript
ignore_watch: ["node_modules", "logs", ".git", "*.log"]
```

**除外理由**
- **node_modules**: 大量ファイル、パフォーマンス影響
- **logs**: 循環監視防止（ログ書き込み→監視発動→再起動→ログ）
- **.git**: バージョン管理システム、開発に無関係
- **\*.log**: 個別ログファイル除外

## 4. ログ管理設計

### 4.1 ログファイル構成

```
/apps/logs/
├── frontend-error.log      # フロントエンドエラー専用
├── frontend-out.log        # フロントエンド標準出力
├── frontend-combined.log   # フロントエンド統合
├── backend-error.log       # バックエンドエラー専用  
├── backend-out.log         # バックエンド標準出力
└── backend-combined.log    # バックエンド統合
```

### 4.2 ログレベル別用途

**Error Log**
- アプリケーションエラー
- 未処理例外
- システム障害

**Output Log**
- 通常の標準出力
- デバッグ情報
- システム起動ログ

**Combined Log**
- error + output の統合
- デバッグ時の一元確認
- 障害調査での時系列確認

### 4.3 ログローテーション

**現在**: PM2デフォルト設定
**将来拡張時**: pm2-logrotateモジュール検討
```bash
pm2 install pm2-logrotate
```

## 5. プロセス管理

### 5.1 PM2コマンド

**基本操作**
```bash
# プロセス一覧
pm2 list

# プロセス再起動
pm2 restart frontend
pm2 restart backend
pm2 restart all

# ログ確認
pm2 logs
pm2 logs frontend
pm2 logs backend

# プロセス停止
pm2 stop all
pm2 delete all
```

**統計情報**
```bash
# CPU・メモリ使用量
pm2 monit

# プロセス詳細
pm2 show frontend
pm2 show backend
```

### 5.2 自動起動・復旧

**自動復旧**
- PM2によるプロセス異常検出
- 自動再起動処理
- 障害ログ記録

**起動順序**
- entrypoint.shによる統合起動
- データベース接続確認後の安全起動
- 両プロセス同時起動

## 6. 開発ワークフロー

### 6.1 開発時の操作

**Docker環境起動**
```bash
docker-compose up -d
# → entrypoint.sh → PM2自動起動
```

**手動制御（必要時）**
```bash
# コンテナ内でのPM2操作
docker-compose exec apps pm2 list
docker-compose exec apps pm2 restart all
```

**ログ確認**
```bash
# リアルタイムログ
docker-compose exec apps pm2 logs --lines 50

# ファイル直接確認
docker-compose exec apps tail -f logs/frontend-combined.log
docker-compose exec apps tail -f logs/backend-combined.log
```

### 6.2 トラブルシューティング

**プロセス異常時**
```bash
# プロセス状態確認
docker-compose exec apps pm2 list
docker-compose exec apps pm2 show backend

# 手動再起動
docker-compose exec apps pm2 restart backend

# ログ確認
docker-compose exec apps pm2 logs backend --lines 100
```

**ファイル監視問題**
```bash
# 監視状態確認
docker-compose exec apps pm2 show backend

# 手動restart（監視無効化）
docker-compose exec apps pm2 restart backend --watch=false
```

## 7. 将来的な拡張

### 7.1 本番環境対応

**PM2 Cluster Mode**
```javascript
{
  name: "backend",
  script: "dist/index.js",
  instances: "max",
  exec_mode: "cluster"
}
```

**環境別設定**
```javascript
// ecosystem.production.config.js
module.exports = {
  apps: [
    {
      name: "backend-prod",
      script: "dist/index.js",
      instances: 2,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

### 7.2 監視・アラート強化

**プロセス監視**
- CPU・メモリ使用量監視
- 異常時のアラート設定
- 自動スケーリング対応

**ログ分析**
- 構造化ログ導入
- エラー頻度分析
- パフォーマンス監視

---

**重要**: この設定は**開発効率**と**運用安定性**のバランスを重視して設計されています。本番環境では別途最適化が必要です。