# MemoPad 実装方針

## 1. 前提

React + Express + SQLite を使って、QA 演習用のメモ帳アプリを作成する。

要件は `docs/requirements.md` の内容を基準とする。ただし、今回指定されたリンク `C:\ai-Coding-traning\MemoPad\_hands-on\docs\requirements.md` は旧作成先であり、現在は削除済みである。実体がある要件定義は `C:\ai-Coding-traning\MemoPad_hands-on\docs\requirements.md` として扱う。

アプリコードはまだ実装しない。本ドキュメントでは実装方針のみを定義する。

## 2. 全体構成

想定する構成は以下とする。

```text
MemoPad_hands-on/
├─ client/
│  └─ React アプリ
├─ server/
│  └─ Express サーバ
├─ data/
│  └─ SQLite DB
├─ docs/
│  ├─ requirements.md
│  └─ implementation-plan.md
├─ package.json
└─ README.md
```

既存の `.github/`、`src/`、`tests/`、`node_modules/`、`package-lock.json` は残した状態で進める。

役割は以下とする。

| ディレクトリ | 役割 |
| --- | --- |
| `client/` | Vite + React によるフロントエンド |
| `server/` | Express による API サーバ |
| `data/` | SQLite DB ファイル、アップロードファイル格納先 |
| `docs/` | 要件定義、実装方針、作業メモ、手順書 |
| `tests/` | 動作確認メモまたは将来のテストコード |

## 3. React 側で作るコンポーネント

### 3.1 画面コンポーネント

| コンポーネント | 役割 |
| --- | --- |
| `LoginPage` | ユーザー ID とパスワードでログインする |
| `MemoListPage` | メモ一覧、検索、タグ絞り込み、お気に入り絞り込み、ページング、並び替えを表示する |
| `MemoCreatePage` | メモを新規作成する |
| `MemoDetailPage` | メモ詳細、添付ファイル、画像、タグを表示する |
| `MemoEditPage` | 既存メモを編集する |
| `MemoDeleteConfirmPage` | 削除前の確認を行う |
| `UserListPage` | 管理者がユーザー一覧を確認する |
| `UserFormPage` | 管理者がユーザーを作成・編集する |
| `NotFoundPage` | 存在しないメモや不正 URL の表示に使う |

### 3.2 共通コンポーネント

| コンポーネント | 役割 |
| --- | --- |
| `AppLayout` | ヘッダー、ナビゲーション、ログアウト導線を持つ共通レイアウト |
| `ProtectedRoute` | 未ログイン時のアクセス制御を行う |
| `AdminRoute` | 管理者権限が必要な画面のアクセス制御を行う |
| `MemoForm` | メモ作成・編集で共通利用する入力フォーム |
| `MemoCard` | 一覧上のメモ表示単位 |
| `SearchBar` | キーワード検索入力 |
| `TagFilter` | タグ絞り込み |
| `FavoriteToggle` | お気に入り登録・解除 |
| `Pagination` | ページング操作 |
| `SortControls` | 並び替え項目と昇順・降順の選択 |
| `FileAttachmentInput` | 添付ファイル選択、追加、削除 |
| `ImageUploadInput` | 画像選択、追加、削除、プレビュー |
| `ErrorMessage` | 入力エラー、通信エラー、サーバーエラーの表示 |
| `ConfirmDialog` | キャンセル確認、削除確認に使う確認 UI |
| `AutosaveStatus` | 自動保存状態の表示 |

### 3.3 React 側の状態管理方針

- 基本は `useState` と `useEffect` を利用する。
- ログインユーザー情報は Context で管理する。
- メモ一覧の検索条件、ページ番号、表示件数、並び替え条件は URL クエリまたは画面 state で管理する。
- 登録・更新・削除処理中はボタンを disabled にして二重送信を防ぐ。
- HTML タグ文字列は JSX の通常テキスト表示で扱い、危険な HTML 挿入は使わない。

## 4. Express 側で作る API

API は `/api` 配下にまとめる。

### 4.1 認証 API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `/api/login` | ユーザー ID とパスワードでログインする |
| `POST` | `/api/logout` | ログアウトする |
| `GET` | `/api/me` | 現在ログイン中のユーザー情報を取得する |

### 4.2 メモ API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/memos` | メモ一覧を取得する。検索、タグ、お気に入り、ページング、並び替えに対応する |
| `POST` | `/api/memos` | メモを新規登録する |
| `GET` | `/api/memos/:id` | メモ詳細を取得する |
| `PUT` | `/api/memos/:id` | メモを更新する |
| `DELETE` | `/api/memos/:id` | メモを論理削除する |

### 4.3 タグ API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/tags` | タグ一覧を取得する |
| `POST` | `/api/memos/:id/tags` | メモにタグを設定する |

### 4.4 お気に入り API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `/api/memos/:id/favorite` | メモをお気に入り登録する |
| `DELETE` | `/api/memos/:id/favorite` | メモのお気に入りを解除する |

### 4.5 添付ファイル・画像 API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `POST` | `/api/memos/:id/attachments` | 添付ファイルを追加する |
| `DELETE` | `/api/attachments/:id` | 添付ファイルを削除する |
| `GET` | `/api/attachments/:id/download` | 添付ファイルをダウンロードする |
| `POST` | `/api/memos/:id/images` | 画像を追加する |
| `DELETE` | `/api/images/:id` | 画像を削除する |
| `GET` | `/api/images/:id` | 画像を表示する |

ファイルアップロードには指定パッケージだけでは不足するため、実装時に `multer` などの追加導入を検討する。

### 4.6 自動保存 API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/drafts/:memoId` | 下書きを取得する |
| `POST` | `/api/drafts` | 下書きを保存する |
| `DELETE` | `/api/drafts/:id` | 下書きを削除する |

新規作成中の下書きは `memoId` なしでユーザー単位に保持する。

### 4.7 ユーザー管理 API

| メソッド | パス | 用途 |
| --- | --- | --- |
| `GET` | `/api/users` | ユーザー一覧を取得する |
| `POST` | `/api/users` | ユーザーを作成する |
| `GET` | `/api/users/:id` | ユーザー詳細を取得する |
| `PUT` | `/api/users/:id` | ユーザーを更新する |
| `PATCH` | `/api/users/:id/disable` | ユーザーを無効化する |

## 5. SQLite のテーブル定義

DB ファイルは `data/memopad.sqlite` とする。

### 5.1 users

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
  status TEXT NOT NULL CHECK (status IN ('active', 'disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 5.2 memos

```sql
CREATE TABLE memos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  FOREIGN KEY (owner_user_id) REFERENCES users(id)
);
```

### 5.3 attachments

```sql
CREATE TABLE attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memo_id INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (memo_id) REFERENCES memos(id)
);
```

### 5.4 images

```sql
CREATE TABLE images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memo_id INTEGER NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (memo_id) REFERENCES memos(id)
);
```

### 5.5 tags

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
```

### 5.6 memo_tags

```sql
CREATE TABLE memo_tags (
  memo_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  PRIMARY KEY (memo_id, tag_id),
  FOREIGN KEY (memo_id) REFERENCES memos(id),
  FOREIGN KEY (tag_id) REFERENCES tags(id)
);
```

### 5.7 favorites

```sql
CREATE TABLE favorites (
  user_id INTEGER NOT NULL,
  memo_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (user_id, memo_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (memo_id) REFERENCES memos(id)
);
```

### 5.8 drafts

```sql
CREATE TABLE drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  memo_id INTEGER,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  saved_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (memo_id) REFERENCES memos(id)
);
```

### 5.9 sessions

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 6. 起動方法

依存関係をインストール済みである前提で、プロジェクト直下から以下を実行する。

```bash
npm run dev
```

このコマンドで以下が同時に起動する。

- `npm run dev:server`: `nodemon server/index.js` で Express サーバを起動する。
- `npm run dev:client`: `npm --prefix client run dev` で Vite 開発サーバを起動する。

個別に起動する場合は以下を使う。

```bash
npm run dev:server
npm run dev:client
```

本番相当で Express サーバのみ起動する場合は以下を使う。

```bash
npm start
```

## 7. 動作確認方法

実装後は以下の観点で確認する。

### 7.1 起動確認

- `npm run dev` で React と Express が同時に起動すること。
- React 画面がブラウザで表示できること。
- Express API が `/api` 配下で応答すること。

### 7.2 ログイン確認

- 正しいユーザー ID とパスワードでログインできること。
- 誤った認証情報で「ユーザーIDまたはパスワードが正しくありません。」が表示されること。
- 未ログイン状態で保護画面へアクセスするとログイン画面へ遷移すること。
- 無効ユーザーがログインできないこと。

### 7.3 メモ CRUD 確認

- メモを作成できること。
- 一覧にタイトル、本文冒頭 50 文字、更新日時が表示されること。
- 詳細画面で全文、作成日時、更新日時が表示されること。
- メモを編集でき、作成日時は変わらず更新日時だけ変わること。
- 削除確認後にメモを削除でき、一覧・検索結果に表示されないこと。

### 7.4 入力チェック確認

- タイトル 0 文字、1 文字、100 文字、101 文字を確認する。
- 本文 0 文字、1 文字、2,000 文字、2,001 文字を確認する。
- 空白のみ、改行のみ、空白と改行のみの本文がエラーになること。
- 複数エラーが同時に表示されること。

### 7.5 検索・一覧確認

- タイトルと本文を対象に部分一致検索できること。
- 英字の大文字・小文字を区別せず検索できること。
- 検索結果 0 件時に「条件に一致するメモがありません。」が表示されること。
- 空欄検索で全件表示されること。
- ページング、表示件数変更、並び替えが検索条件と併用できること。

### 7.6 セキュリティ・表示確認

- `<script>alert(1)</script>` が実行されず、文字列として表示されること。
- 一般ユーザーが他ユーザーのメモを閲覧・編集・削除できないこと。
- 一般ユーザーがユーザー管理画面にアクセスできないこと。

### 7.7 追加機能確認

- 添付ファイルの件数、拡張子、サイズ制限が効くこと。
- 画像の件数、形式、サイズ制限が効き、詳細画面でプレビューできること。
- タグの追加、重複防止、タグ絞り込みができること。
- お気に入り登録・解除とお気に入り絞り込みができること。
- 入力変更後 3 秒で自動保存され、下書きを復元できること。
- 同時編集時に更新競合を検知し、入力中の内容が保持されること。

## 8. 実装順序

1. 依存関係と `package.json` scripts の整合性を確認する。
2. `server/index.js` を作成し、Express の基本起動、CORS、JSON パース、共通エラーハンドリングを実装する。
3. `data/memopad.sqlite` を使う SQLite 接続とテーブル初期化を実装する。
4. 初期管理者ユーザーの seed を実装する。
5. ログイン、ログアウト、ログイン状態確認 API を実装する。
6. React 側にログイン画面、認証状態管理、保護ルートを実装する。
7. メモ CRUD API を実装する。
8. React 側にメモ一覧、作成、詳細、編集、削除確認を実装する。
9. メモの入力チェック、エラー表示、二重送信防止を実装する。
10. 検索、ページング、並び替えを実装する。
11. タグとお気に入りを実装する。
12. ユーザー管理と権限管理を実装する。
13. 自動保存と下書き復元を実装する。
14. 同時編集制御を実装する。
15. ファイル添付と画像アップロードを実装する。
16. 要件定義に沿って動作確認を行い、必要に応じて確認手順を docs に追記する。

