# AWS Systems Manager Parameter Store セットアップガイド

## 概要

このドキュメントでは、Family Tree Appで使用するAWS Systems Manager Parameter Storeの環境構築手順を説明します。Parameter Storeを使用することで、開発・テスト・CI・本番の全環境で環境変数を一元管理し、KMS暗号化により機密情報を安全に保存します。

## 前提条件

### 必須ツール

- **AWS CLI**: バージョン2.x以上
- **AWS アカウント**: 管理者権限を持つIAMユーザー
- **jq**: JSON処理用（オプション、確認作業で便利）

### AWS CLIのインストール

```bash
# macOS
brew install awscli

# Linux (aarch64)
curl "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# バージョン確認
aws --version
```

### AWS認証情報の設定

```bash
aws configure

# 入力項目:
# AWS Access Key ID: (IAMユーザーのアクセスキー)
# AWS Secret Access Key: (IAMユーザーのシークレットキー)
# Default region name: ap-northeast-1
# Default output format: json
```

---

## ステップ1: KMSキーの作成

Parameter Storeで機密情報（`SecureString`）を暗号化するためのKMSキーを作成します。

### AWS CLIでの作成

```bash
aws kms create-key \
  --description "Family Tree App Parameter Store Encryption Key" \
  --key-usage ENCRYPT_DECRYPT \
  --origin AWS_KMS \
  --region ap-northeast-1

# 出力例:
# {
#   "KeyMetadata": {
#     "KeyId": "12345678-1234-1234-1234-123456789012",
#     ...
#   }
# }
```

### エイリアスの作成（推奨）

KMSキーにエイリアスを設定すると、キーIDを覚える必要がなくなります。

```bash
# KeyIdは上記コマンドの出力から取得
aws kms create-alias \
  --alias-name alias/family-tree-parameter-store \
  --target-key-id 12345678-1234-1234-1234-123456789012 \
  --region ap-northeast-1
```

### 環境変数への設定

```bash
# ~/.bashrc または ~/.zshrc に追加
export AWS_KMS_KEY_ID="12345678-1234-1234-1234-123456789012"
# またはエイリアスを使用
export AWS_KMS_KEY_ID="alias/family-tree-parameter-store"
```

---

## ステップ2: IAMロールとポリシーの作成

環境ごとに適切な権限を持つIAMロールを作成します。

### 2.1 開発環境用IAMロール

#### ポリシードキュメント作成

`iam-policy-development.json`を作成:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath",
        "ssm:PutParameter",
        "ssm:DeleteParameter"
      ],
      "Resource": [
        "arn:aws:ssm:ap-northeast-1:*:parameter/family-tree/development/*",
        "arn:aws:ssm:ap-northeast-1:*:parameter/family-tree/worktree/*",
        "arn:aws:ssm:ap-northeast-1:*:parameter/family-tree/test/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:Encrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:ap-northeast-1:*:key/*"
    }
  ]
}
```

**注**: 開発環境では、開発・Worktree・テスト環境のパラメータにアクセス可能です。これは、開発者がローカル環境でテストを実行するために必要です。

#### ポリシー作成

```bash
aws iam create-policy \
  --policy-name FamilyTreeDevelopmentParameterStorePolicy \
  --policy-document file://iam-policy-development.json \
  --region ap-northeast-1
```

#### ロール作成と信頼ポリシー

`trust-policy-development.json`を作成:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::YOUR_ACCOUNT_ID:user/YOUR_IAM_USER"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
aws iam create-role \
  --role-name FamilyTreeDevelopmentRole \
  --assume-role-policy-document file://trust-policy-development.json \
  --region ap-northeast-1

# ポリシーをロールにアタッチ
aws iam attach-role-policy \
  --role-name FamilyTreeDevelopmentRole \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/FamilyTreeDevelopmentParameterStorePolicy
```

#### 環境変数への設定

```bash
# ~/.bashrc または ~/.zshrc に追加
export AWS_ROLE_ARN="arn:aws:iam::YOUR_ACCOUNT_ID:role/FamilyTreeDevelopmentRole"
```

---

### 2.2 CI環境用IAMロール（GitHub Actions）

#### ポリシードキュメント作成

`iam-policy-ci.json`を作成:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:ap-northeast-1:*:parameter/family-tree/test/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:ap-northeast-1:*:key/*"
    }
  ]
}
```

**注**: CI環境では、テスト環境のパラメータのみ読み取り可能です。書き込み権限は不要です。

#### ポリシー作成

```bash
aws iam create-policy \
  --policy-name FamilyTreeCIParameterStorePolicy \
  --policy-document file://iam-policy-ci.json \
  --region ap-northeast-1
```

#### OIDC信頼ポリシー（GitHub Actions用）

`trust-policy-ci.json`を作成:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_ORG/YOUR_REPO:*"
        }
      }
    }
  ]
}
```

```bash
aws iam create-role \
  --role-name FamilyTreeCIRole \
  --assume-role-policy-document file://trust-policy-ci.json \
  --region ap-northeast-1

aws iam attach-role-policy \
  --role-name FamilyTreeCIRole \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/FamilyTreeCIParameterStorePolicy
```

---

### 2.3 本番環境用IAMロール（EC2インスタンスロール）

#### ポリシードキュメント作成

`iam-policy-production.json`を作成:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:GetParametersByPath"
      ],
      "Resource": [
        "arn:aws:ssm:ap-northeast-1:*:parameter/family-tree/production/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "kms:Decrypt",
        "kms:DescribeKey"
      ],
      "Resource": "arn:aws:kms:ap-northeast-1:*:key/*"
    }
  ]
}
```

**注**: 本番環境では、本番環境のパラメータのみ読み取り可能です。開発・テスト環境のパラメータへのアクセスは不要です。

#### ポリシー作成

```bash
aws iam create-policy \
  --policy-name FamilyTreeProductionParameterStorePolicy \
  --policy-document file://iam-policy-production.json \
  --region ap-northeast-1
```

#### EC2信頼ポリシー

`trust-policy-production.json`を作成:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

```bash
aws iam create-role \
  --role-name FamilyTreeProductionRole \
  --assume-role-policy-document file://trust-policy-production.json \
  --region ap-northeast-1

aws iam attach-role-policy \
  --role-name FamilyTreeProductionRole \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/FamilyTreeProductionParameterStorePolicy

# EC2インスタンスプロファイル作成
aws iam create-instance-profile \
  --instance-profile-name FamilyTreeProductionInstanceProfile

aws iam add-role-to-instance-profile \
  --instance-profile-name FamilyTreeProductionInstanceProfile \
  --role-name FamilyTreeProductionRole
```

---

## ステップ3: パラメータの登録

### 3.1 スクリプトの実行権限付与

```bash
chmod +x scripts/ssm/register-params.sh
```

### 3.2 開発環境パラメータの登録

```bash
# 開発環境用パラメータ登録
./scripts/ssm/register-params.sh development .env

# 登録確認
aws ssm get-parameters-by-path \
  --path /family-tree/development \
  --region ap-northeast-1 \
  --query "Parameters[].Name"
```

### 3.3 テスト環境パラメータの登録

```bash
# テスト環境用.envファイルを作成（または既存ファイルを使用）
cp .env .env.test
# 必要に応じて.env.testを編集

./scripts/ssm/register-params.sh test .env.test

# 登録確認
aws ssm get-parameters-by-path \
  --path /family-tree/test \
  --region ap-northeast-1 \
  --query "Parameters[].Name"
```

### 3.4 本番環境パラメータの登録

```bash
# 本番環境用.envファイルを作成
cp .env .env.production
# 本番環境用の値に編集（重要: 本番用の機密情報を設定）

./scripts/ssm/register-params.sh production .env.production

# 登録確認
aws ssm get-parameters-by-path \
  --path /family-tree/production \
  --region ap-northeast-1 \
  --query "Parameters[].Name"
```

---

## ステップ4: 動作確認

### パラメータ取得テスト

```bash
# 開発環境のパラメータ取得
aws ssm get-parameter \
  --name /family-tree/development/database-url \
  --with-decryption \
  --region ap-northeast-1

# すべてのパラメータを一括取得
aws ssm get-parameters-by-path \
  --path /family-tree/development \
  --with-decryption \
  --region ap-northeast-1
```

### Docker環境での動作確認

```bash
# Dockerコンテナ起動
docker compose --profile development up -d --no-deps apps

# コンテナログで環境変数取得を確認
docker logs app-XXXXX

# 期待される出力:
# [entrypoint] AWS Parameter Store から環境変数を取得中...
# [entrypoint] 環境変数設定完了
```

---

## トラブルシューティング

### エラー: An error occurred (AccessDeniedException)

**原因**: IAMロールの権限不足、またはAssumeRoleの失敗

**対処法**:
1. IAMロールのポリシーを確認
2. `AWS_ROLE_ARN`環境変数が正しく設定されているか確認
3. IAMユーザーにAssumeRole権限があるか確認

```bash
# AssumeRoleのテスト
aws sts assume-role \
  --role-arn "$AWS_ROLE_ARN" \
  --role-session-name test-session
```

---

### エラー: Parameter not found

**原因**: パラメータが存在しない、またはパス指定が間違っている

**対処法**:
1. パラメータ一覧を確認
```bash
aws ssm describe-parameters \
  --region ap-northeast-1 \
  --query "Parameters[?contains(Name, 'family-tree')].Name"
```

2. パラメータ名の大文字小文字、ハイフンの有無を確認

---

### エラー: KMS key not found

**原因**: KMSキーIDが間違っている、または権限不足

**対処法**:
1. KMSキー一覧を確認
```bash
aws kms list-keys --region ap-northeast-1
```

2. KMSキーの詳細確認
```bash
aws kms describe-key \
  --key-id "$AWS_KMS_KEY_ID" \
  --region ap-northeast-1
```

---

### Docker環境でParameter Store取得に失敗

**原因**: AWS認証情報がDockerコンテナにマウントされていない

**対処法**:
1. `~/.aws`ディレクトリが存在するか確認
2. `docker-compose.yml`でボリュームマウントが設定されているか確認
```yaml
volumes:
  - ~/.aws:/root/.aws:ro
```

---

## セキュリティのベストプラクティス

### 1. 最小権限の原則

- 各環境のIAMロールは、必要最小限のパラメータにのみアクセス可能
- 開発環境: `/family-tree/development/*`, `/family-tree/worktree/*`, `/family-tree/test/*`
- CI環境: `/family-tree/test/*`（読み取りのみ）
- 本番環境: `/family-tree/production/*`（読み取りのみ）

### 2. 機密情報の暗号化

- `DATABASE_URL`, `JWT_SECRET`, `*_PASSWORD`, `*_TOKEN`などは必ず`SecureString`で登録
- KMS暗号化により、AWSコンソールからも平文では閲覧不可

### 3. 一時クレデンシャルの使用

- `entrypoint.sh`でAssumeRoleにより取得した一時クレデンシャルを使用
- 一時クレデンシャルはメモリにのみ保持、ファイル保存禁止

### 4. パラメータのバージョン管理

- Parameter Storeは自動的にパラメータのバージョン履歴を保持
- 誤って上書きした場合は、過去のバージョンから復元可能

```bash
# パラメータ履歴の確認
aws ssm get-parameter-history \
  --name /family-tree/development/database-url \
  --region ap-northeast-1
```

---

## メンテナンス

### パラメータの更新

```bash
# 単一パラメータの更新
aws ssm put-parameter \
  --name /family-tree/development/database-url \
  --value "新しい値" \
  --type SecureString \
  --overwrite \
  --region ap-northeast-1

# 一括更新（.envファイルから）
./scripts/ssm/register-params.sh development .env
```

### Worktree環境のクリーンアップ

Worktree環境のissueがクローズされた際、`post_merge.sh`が自動的にParameter Storeパラメータを削除します。

```bash
# post_merge.sh実行時に自動実行
./scripts/post_merge.sh 99
```

---

## 参考リンク

- [AWS Systems Manager Parameter Store ドキュメント](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html)
- [AWS KMS ドキュメント](https://docs.aws.amazon.com/kms/latest/developerguide/overview.html)
- [IAM ロールの使用](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use.html)
