FROM postgres:18

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y curl jq unzip \
    && rm -rf /var/lib/apt/lists/*

# AWS CLI v2のインストール
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "/tmp/awscliv2.zip" \
    && cd /tmp \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf /tmp/aws /tmp/awscliv2.zip

# entrypoint.shをコピー
COPY docker/db/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# カスタムentrypointを使用
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["postgres"]
