# Express.js プロジェクト - README.md

## はじめに

この README は、Express.js プロジェクトのセットアップと維持に関するガイドラインを提供します。開発環境と本番環境の両方での重要な設定やベストプラクティスについて説明します。

## システム要件

- Node.js のバージョン: 18.16.0

## 環境設定

1. ルートフォルダに`.env`ファイルと`.env.dev`ファイルを作成してください。これらのファイルには環境固有の変数を含めます。
2. RDS の認証情報は RDS コンソールで確認するか、[このドキュメント](https://www.notion.so/RDS-e556bb56c0194ac1851625fac91be7f0?pvs=4)を参照してください。不明な点があれば、大内に確認してください。

### `.env`ファイルの例 (本番環境)

```dotenv
RDS_HOST=<本番DBホスト>
RDS_USER=<DBユーザー>
RDS_PASSWORD=<DBパスワード>
RDS_DATABASE=<DB名>
RDS_PORT=<DBポート>
```

### `.env.dev`ファイルの例 (開発環境)

```dotenv
RDS_HOST=<開発DBホスト>
RDS_USER=<DBユーザー>
RDS_PASSWORD=<DBパスワード>
RDS_DATABASE=<DB名>
RDS_PORT=<DBポート>
```

## サーバーの起動

- **開発環境**: 最初に`dev-db`サーバーを起動し、次に以下を実行します：
  ```bash
  npm run dev
  ```
- **本番環境**: 最初に`prod-db`サーバーを起動し、次に以下を実行します：

  ```bash
  npm run start
  ```

### SSH キー設定 (本番環境)

- 本番環境では SSH キーを使用して RDS に接続する必要があります。以下のコマンド例を参考にして、必要な情報を編集して実行します。
  ```
  ssh -L 3307:prob-db.cn7rjsqtbrnm.ap-northeast-1.rds.amazonaws.com:3306 ec2-user@54.249.59.11 -i /path/to/your/pikatore-rds.pem
  ```

## ブランチルール

- 機能ブランチ: `feature/<機能名>`
- バグ修正: `bugfix/<バグ名>`
- 緊急修正: `hotfix/<問題点>`

## コミットルール

- 明確で説明的なコミットメッセージを使用する。
- 小さい変更ごとに頻繁にコミットする。
- 1 つのコミットに対する修正や改善を行うコミットはスカッシュする。

## プルリクエスト（PR）ルール

- 新機能やバグ修正の PR は`develop`ブランチに対して行う。
- 緊急修正の場合は`hotfix`ブランチを使用する。
- PR の説明に変更の概要とテスト結果を含める。
- PR は少なくとも 1 人の他のチームメンバーによってレビューされる。
