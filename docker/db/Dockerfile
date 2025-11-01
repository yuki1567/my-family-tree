FROM postgres:18

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    jq \
    && rm -rf /var/lib/apt/lists/*

# AWS CLI v2のインストール（アーキテクチャ自動判定）
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m)-2.31.27.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf aws awscliv2.zip

# entrypoint.shをコピー
COPY docker/db/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# カスタムentrypointを使用
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["postgres"]
