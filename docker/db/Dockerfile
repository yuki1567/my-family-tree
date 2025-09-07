FROM mysql:8.4.6

# MySQL設定ファイルをコピー
COPY docker/db/my.cnf /etc/mysql/conf.d/

# 文字エンコーディング設定（日本語対応・絵文字サポート）
ENV MYSQL_CHARSET=utf8mb4
ENV MYSQL_COLLATION=utf8mb4_unicode_ci