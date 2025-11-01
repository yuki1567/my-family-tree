FROM amazon/aws-cli:2.31.27 AS aws-cli

FROM postgres:18

# 必要なパッケージのインストール
RUN apt-get update && apt-get install -y jq \
    && rm -rf /var/lib/apt/lists/*

# AWS CLI v2をコピー
COPY --from=aws-cli /usr/local/aws-cli/ /usr/local/aws-cli/
COPY --from=aws-cli /usr/local/bin/aws /usr/local/bin/aws

# entrypoint.shをコピー
COPY docker/db/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# カスタムentrypointを使用
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["postgres"]
