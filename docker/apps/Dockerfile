# ============================================================
# Base Stage: 共通ベースイメージ
# ============================================================
FROM node:22.18-slim AS base

WORKDIR /usr/src

RUN npm install -g npm@10.9.3 pm2@6.0.8

# 必要なシステムパッケージのインストール
RUN apt-get update && apt-get install -y curl postgresql-client vim procps unzip jq ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# AWS CLI v2のインストール
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# ============================================================
# Development Stage: 開発環境用
# ============================================================
FROM base AS development

# モノレポ対応：依存関係定義ファイルのコピー
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/

# 開発用依存関係を含めて全てインストール
RUN npm ci --frozen-lockfile

# TypeScript設定ファイルのコピー
COPY tsconfig*.json ./
COPY apps/frontend/tsconfig*.json ./apps/frontend/
COPY apps/backend/tsconfig*.json ./apps/backend/

# ESLintとPrettier設定ファイルのコピー
COPY eslint.config.js ./
COPY .prettierrc ./
COPY .prettierignore ./

# ログディレクトリ作成
RUN mkdir -p /apps/logs

# entrypoint.shとecosystem.config.cjsのコピー
COPY docker/apps/entrypoint.sh ./
COPY ecosystem.config.cjs ./
RUN chmod +x entrypoint.sh

# with-env.shを/usr/local/binにコピー
COPY docker/apps/with-env.sh /usr/local/bin/with-env
RUN chmod +x /usr/local/bin/with-env

EXPOSE 3000 4000

CMD ["bash", "./entrypoint.sh"]

# ============================================================
# Builder Stage: 本番用ビルド
# ============================================================
FROM base AS builder

# 依存関係定義ファイルのコピー
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/

# TypeScript設定ファイルのコピー
COPY tsconfig*.json ./
COPY apps/frontend/tsconfig*.json ./apps/frontend/
COPY apps/backend/tsconfig*.json ./apps/backend/

# ソースコードのコピー
COPY apps/shared ./apps/shared
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

# 全依存関係インストール（ビルドに必要）
RUN npm ci --frozen-lockfile

# バックエンドビルド
RUN cd apps/backend && npm run build

# フロントエンドビルド
RUN cd apps/frontend && npm run build

# 本番用依存関係のみを別ディレクトリにインストール
RUN mkdir -p /prod-deps/backend /prod-deps/frontend
COPY apps/backend/package*.json /prod-deps/backend/
COPY apps/frontend/package*.json /prod-deps/frontend/
RUN cd /prod-deps/backend && npm ci --omit=dev --frozen-lockfile
RUN cd /prod-deps/frontend && npm ci --omit=dev --frozen-lockfile

# ============================================================
# Production Stage: 本番環境用
# ============================================================
FROM node:22.18-slim AS production

WORKDIR /usr/src

# 非rootユーザー作成
RUN addgroup --gid 1001 --system nodejs && \
    adduser --uid 1001 --system --ingroup nodejs nodejs

# 必要最小限のシステムパッケージインストール
RUN apt-get update && apt-get install -y curl unzip jq ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# AWS CLI v2のインストール
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# PM2をグローバルインストール
RUN npm install -g pm2@6.0.8

# ログディレクトリ作成
RUN mkdir -p /apps/logs && chown -R nodejs:nodejs /apps/logs

# ビルド成果物と本番用依存関係のコピー
COPY --from=builder --chown=nodejs:nodejs /usr/src/apps/backend/dist ./apps/backend/dist
COPY --from=builder --chown=nodejs:nodejs /prod-deps/backend/node_modules ./apps/backend/node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/apps/backend/package.json ./apps/backend/package.json

COPY --from=builder --chown=nodejs:nodejs /usr/src/apps/frontend/.output ./apps/frontend/.output
COPY --from=builder --chown=nodejs:nodejs /prod-deps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=builder --chown=nodejs:nodejs /usr/src/apps/frontend/package.json ./apps/frontend/package.json

# 設定ファイルのコピー
COPY --chown=nodejs:nodejs ecosystem.config.cjs ./
COPY --chown=nodejs:nodejs docker/apps/entrypoint.sh ./
COPY --chown=nodejs:nodejs docker/apps/with-env.sh /usr/local/bin/with-env

# 実行権限付与
RUN chmod +x entrypoint.sh /usr/local/bin/with-env

# 非rootユーザーに切り替え
USER nodejs

EXPOSE 3000 4000

CMD ["bash", "./entrypoint.sh"]