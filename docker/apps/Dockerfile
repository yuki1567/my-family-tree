FROM node:22.18-slim

# 作業ディレクトリ設定
WORKDIR /usr/src

RUN npm install -g npm@10.9.3 pm2@6.0.8

# 必要なシステムパッケージのインストール
RUN apt-get update && apt-get install -y curl postgresql-client vim procps unzip jq \
    && rm -rf /var/lib/apt/lists/*

# AWS CLI v2のインストール
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

# モノレポ対応：依存関係定義ファイルのコピー（レイヤーキャッシュ最適化）
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/

# ワークスペース全体の依存関係を一括インストール
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

# ポート公開
EXPOSE 3000 4000

# entrypoint.shで起動
CMD ["bash", "./entrypoint.sh"]