# TODO管理アプリ 作業手順書

この文書は、MemoPad_hands-on のTODO管理アプリを第三者が再現・起動・動作確認するための手順書です。

## 1. 環境構築

### 前提ソフトウェア

- Node.js（LTS推奨）
- npm
- Git

### セットアップ

1. リポジトリを取得し、プロジェクトへ移動します。

   ```powershell
   git clone <リポジトリURL>
   cd MemoPad_hands-on
   ```

2. クライアントとサーバーの依存パッケージをインストールします。

   ```powershell
   cd client
   npm install
   cd ..\server
   npm install
   ```

3. DB接続情報などの環境変数が必要な場合は、各ディレクトリの設定ファイルまたは `.env.example` を確認し、`.env` を作成します。

## 2. 使用技術

- フロントエンド: React / JavaScript / CSS
- バックエンド: Node.js / Express
- API通信: HTTP（JSON）
- データベース: サーバー側のDB実装および定義ファイルに従う
- パッケージ管理: npm

実際のバージョンは `client/package.json`、`server/package.json` の `dependencies` と `devDependencies` を確認してください。

## 3. インストールしたパッケージ

インストール済みパッケージは、次のファイルを正とします。

- `client/package.json`
- `server/package.json`
- `client/package-lock.json`
- `server/package-lock.json`

再現時は、プロジェクトルートで一括インストールするのではなく、`client` と `server` それぞれで `npm install` を実行します。ロックファイルを利用できる環境では、再現性を高めるため `npm ci` を使用してください。

## 4. フォルダ構成

```text
MemoPad_hands-on/
├─ client/
│  ├─ src/
│  │  ├─ App.*
│  │  └─ ...
│  ├─ package.json
│  └─ package-lock.json
├─ server/
│  ├─ index.js
│  ├─ package.json
│  └─ ...
├─ docs/
│  ├─ requirements.md
│  ├─ change-plan.md
│  └─ work-procedure.md
└─ ...
```

## 5. 起動方法

### サーバー

```powershell
cd MemoPad_hands-on\server
npm start
```

`npm start` が定義されていない場合は、`server/package.json` の `scripts` に定義された起動コマンドを使用してください。

### クライアント

別のターミナルを開き、次を実行します。

```powershell
cd MemoPad_hands-on\client
npm start
```

表示されたローカルURLをブラウザで開きます。クライアントとサーバーのポートが異なる場合は、クライアント側のAPI接続設定を確認してください。

## 6. API仕様

APIの正式なパス・メソッド・ポートは `server/index.js` のルーティング定義を正とします。実装確認時は、各エンドポイントについて次の項目を記録します。

| 項目 | 内容 |
|---|---|
| Method | GET / POST / PUT / PATCH / DELETE のいずれか |
| Path | ルート定義に記載されたAPIパス |
| Request | URLパラメータ、クエリ、JSONボディ |
| Response | HTTPステータス、JSON形式、エラー内容 |
| 備考 | バリデーション、未登録ID、空文字の扱い |

TODOの作成・一覧取得・更新・削除の各操作は、ブラウザの開発者ツールのNetworkタブでもリクエストとレスポンスを確認できます。

## 7. DB仕様

DBの接続先、テーブル名、カラム、型、主キー、制約、初期データはサーバー側のDB設定・マイグレーション・SQL定義を正とします。

TODOデータを確認する際は、少なくとも次の項目を確認します。

- TODOを一意に識別するID
- タイトルまたは本文
- 完了状態
- 作成日時・更新日時（実装されている場合）
- NULL可否とデフォルト値

DBを初期化する場合は、既存データを失う可能性があるため、対象環境とバックアップの有無を確認してから実施します。

## 8. 動作確認方法

1. サーバーとクライアントを起動します。
2. 画面が表示され、TODO一覧を取得できることを確認します。
3. TODOを1件追加し、一覧に表示されることを確認します。
4. 追加したTODOを編集し、変更内容が保持されることを確認します。
5. 完了状態を切り替え、画面表示とDBの値が一致することを確認します。
6. TODOを削除し、一覧から消えることを確認します。
7. ページを再読み込みし、登録・更新内容が保持されることを確認します。
8. 未入力値、存在しないID、サーバー停止時などのエラー表示を確認します。

## 9. 実施した改修内容

改修内容の詳細は `docs/requirements.md` と `docs/change-plan.md` を参照してください。作業記録には、少なくとも次の内容を残します。

- TODOの一覧表示、追加、編集、完了切り替え、削除に関する実装
- クライアントとサーバー間のAPI接続
- DBへの保存・取得・更新・削除
- 入力値およびエラーの扱い
- 画面レイアウトとスタイルの調整

## 10. 注意点

- `client` と `server` は別プロセスとして起動します。
- APIのポートとクライアントの接続先が一致している必要があります。
- `.env` やDBファイルなどの機密情報・ローカル情報はリポジトリへコミットしません。
- 依存パッケージのバージョンはロックファイルを優先します。
- DB初期化や削除操作は既存データを失うため、検証用DBで実施します。
- API仕様やDB仕様を変更した場合は、この手順書と関連ドキュメントを同時に更新します。
