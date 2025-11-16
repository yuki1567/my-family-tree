# ============================================================
# Builder Stage: ビルドステージ
# ============================================================
FROM node:22.18-slim AS builder

ARG BUILD_ENV=production

WORKDIR /usr/src

RUN npm install -g npm@10.9.3

# モノレポ対応:依存関係定義ファイルのコピー
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/

# TypeScript設定ファイルのコピー
COPY tsconfig*.json ./
COPY apps/frontend/tsconfig*.json ./apps/frontend/
COPY apps/backend/tsconfig*.json ./apps/backend/

# ESLint/Prettier設定ファイルのコピー
COPY eslint.config.js ./
COPY .prettierrc ./
COPY .prettierignore ./

# 全依存関係インストール
RUN npm ci --frozen-lockfile

# ソースコードのコピー
COPY apps/shared ./apps/shared
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend

# 本番環境の場合のみビルド実行
RUN if [ "$BUILD_ENV" = "production" ]; then \
    cd apps/backend && npm run build && \
    cd ../frontend && npm run build; \
    fi

# 本番環境の場合のみ本番用依存関係を別ディレクトリにインストール
RUN if [ "$BUILD_ENV" = "production" ]; then \
    mkdir -p /prod-deps/backend /prod-deps/frontend && \
    cp apps/backend/package*.json /prod-deps/backend/ && \
    cp apps/frontend/package*.json /prod-deps/frontend/ && \
    cd /prod-deps/backend && npm ci --omit=dev --frozen-lockfile && \
    cd /prod-deps/frontend && npm ci --omit=dev --frozen-lockfile; \
    fi

# ============================================================
# Runner Stage: 実行ステージ
# ============================================================
FROM node:22.18-slim AS runner

ARG BUILD_ENV=production

WORKDIR /usr/src

# 本番環境の場合のみ非rootユーザー作成
RUN if [ "$BUILD_ENV" = "production" ]; then \
    addgroup --gid 1001 --system node && \
    adduser --uid 1001 --system --ingroup node node; \
    fi

# 必要なシステムパッケージインストール
RUN apt-get update && \
    if [ "$BUILD_ENV" = "development" ]; then \
        apt-get install -y curl postgresql-client vim procps unzip jq; \
    else \
        apt-get install -y curl unzip jq; \
    fi && \
    rm -rf /var/lib/apt/lists/*

# AWS CLI v2のインストール
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# PM2をグローバルインストール
RUN npm install -g pm2@6.0.8

# ログディレクトリ作成
RUN mkdir -p /apps/logs && chown -R nodejs:nodejs /apps/logs

# 開発環境: ソースコード全体をコピー
# 本番環境: ビルド成果物のみをコピー
COPY --from=builder /usr/src/package*.json ./
COPY --from=builder /usr/src/tsconfig*.json ./
COPY --from=builder /usr/src/eslint.config.js ./
COPY --from=builder /usr/src/.prettierrc ./
COPY --from=builder /usr/src/.prettierignore ./

COPY --from=builder /usr/src/apps/shared ./apps/shared/

# 本番環境の場合は開発用設定ファイルを削除
RUN if [ "$BUILD_ENV" = "production" ]; then \
    rm -f tsconfig*.json eslint.config.js .prettierrc .prettierignore && \
    rm -rf ./apps/shared; \
    fi

# バックエンドのコピー
COPY --from=builder /usr/src/apps/backend/package*.json ./apps/backend/
COPY --from=builder /usr/src/apps/backend/tsconfig*.json ./apps/backend/
COPY --from=builder /usr/src/apps/backend ./apps/backend/

# 本番環境の場合はソースファイルを削除(distのみ残す)
RUN if [ "$BUILD_ENV" = "production" ]; then \
    find ./apps/backend -maxdepth 1 -name "*.ts" -delete && \
    rm -rf ./apps/backend/config ./apps/backend/routes ./apps/backend/services \
           ./apps/backend/repositories ./apps/backend/middlewares ./apps/backend/errors \
           ./apps/backend/utils ./apps/backend/tests ./apps/backend/database; \
    fi

# フロントエンドのコピー
COPY --from=builder /usr/src/apps/frontend/package*.json ./apps/frontend/
COPY --from=builder /usr/src/apps/frontend/tsconfig*.json ./apps/frontend/
COPY --from=builder /usr/src/apps/frontend ./apps/frontend/

# 本番環境の場合はソースファイルを削除(.outputのみ残す)
RUN if [ "$BUILD_ENV" = "production" ]; then \
    find ./apps/frontend -maxdepth 1 \( -name "*.vue" -o -name "*.ts" -o -name "*.js" \) -delete && \
    rm -rf ./apps/frontend/pages ./apps/frontend/components ./apps/frontend/composables \
           ./apps/frontend/layouts ./apps/frontend/assets ./apps/frontend/types \
           ./apps/frontend/utils ./apps/frontend/tests ./apps/frontend/.nuxt; \
    fi

# node_modulesのコピー
# 開発環境: 開発用依存関係含む、本番環境: 本番用依存関係のみ
COPY --from=builder /usr/src/node_modules ./node_modules/

# 本番環境の場合は開発用node_modulesを削除
RUN if [ "$BUILD_ENV" = "production" ]; then \
    rm -rf ./node_modules ./apps/backend/node_modules ./apps/frontend/node_modules; \
    fi

# 本番用node_modulesをコピー
COPY --from=builder /prod-deps/ /tmp/prod-deps/

# 本番環境の場合は本番用node_modulesを配置
RUN if [ "$BUILD_ENV" = "production" ]; then \
    mv /tmp/prod-deps/backend/node_modules ./apps/backend/node_modules && \
    mv /tmp/prod-deps/frontend/node_modules ./apps/frontend/node_modules && \
    rm -rf /tmp/prod-deps; \
    fi

# 設定ファイルのコピー
COPY ecosystem.config.cjs ./
COPY docker/apps/entrypoint.sh ./
COPY docker/apps/with-env.sh /usr/local/bin/with-env

# 実行権限付与
RUN chmod +x entrypoint.sh /usr/local/bin/with-env

# 本番環境の場合のみファイル所有者を変更
RUN if [ "$BUILD_ENV" = "production" ]; then \
    chown -R node:node /usr/src; \
    fi

# entrypoint.shでユーザー切り替えを行うためrootのまま起動
EXPOSE 3000 4000

CMD ["bash", "./entrypoint.sh"]
