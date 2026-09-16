# MemoPad Playwright向けテストケース

## 1. 目的

`tests/test-spec/viewpoint-table.md` のテスト観点IDと、Playwrightで実装するテストケースIDを紐づけて管理する。

本書では、各テストケース名に `テストケースID / テスト観点ID` を含める方針とし、観点表からテストコードへの追跡を可能にする。

## 2. ID体系

| 項目 | 形式 | 例 |
| --- | --- | --- |
| テスト観点ID | `VP-{機能}-{画面}-{連番}` | `VP-MEMO-CREATE-001` |
| テストケースID | `TC-{機能}-{画面}-{観点連番}-{枝番}` | `TC-MEMO-CREATE-001-01` |
| Playwrightテスト名 | `TC-ID / VP-ID 観点名` | `TC-MEMO-CREATE-001-01 / VP-MEMO-CREATE-001 タイトルと本文を入力してメモを登録できる` |

1つの観点から複数のテストケースを作成する場合は、末尾の枝番を `-01`, `-02` のように増やす。

## 3. 推奨ディレクトリ構成

```text
tests/
  e2e/
    auth.spec.ts
    memo-list.spec.ts
    memo-create.spec.ts
    memo-detail.spec.ts
    memo-edit.spec.ts
    memo-delete.spec.ts
    search.spec.ts
    tag-favorite.spec.ts
    draft.spec.ts
    conflict.spec.ts
    attachment-image.spec.ts
    user-permission.spec.ts
    common-api.spec.ts
  fixtures/
    test-data.ts
    files/
      sample.pdf
      sample.txt
      sample.png
  helpers/
    auth.ts
    memo.ts
    api.ts
    db.ts
    assertions.ts
```

## 4. 実装方針

| 項目 | 方針 |
| --- | --- |
| テスト名 | `TC-ID / VP-ID 日本語の観点名` を必ず含める |
| spec分割 | 画面または機能単位で分割する |
| ログイン | `helpers/auth.ts` に `loginAsUser(page, role)` を作成して共通化する |
| テストデータ | `TC-` 接頭辞とタイムスタンプ等を使い一意にする |
| 前処理 | APIまたはDB seedで管理者、一般ユーザー、無効化ユーザーを準備する |
| 後処理 | 作成データは `afterEach` で削除または論理削除する |
| API確認 | フロントの `baseURL` とAPIのURLを混同しないように設定する |
| DB確認 | 重要度「高」のDB観点のみDBヘルパーで確認する |
| 非同期待機 | `expect`、`waitForResponse`、状態表示の待機を使用する |
| 自動保存 | 3秒待機や復元確認は専用specに分ける |
| 権限制御 | 複数ユーザー操作は `browser.newContext()` または `storageState` を使う |

## 5. テストケース一覧

| テストケースID | テスト観点ID | spec案 | 機能 | 画面 | 種別 | 重要度 | テスト目的 | 前提条件 | テストデータ | 操作概要 | 期待結果 | 確認対象 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `TC-LOGIN-001-01` | `VP-LOGIN-001` | `auth.spec.ts` | 認証 | ログイン画面 | 正常系 | 高 | 正しい認証情報でログインできることを確認する | 有効な一般ユーザーが存在する | 一般ユーザーID、パスワード | ログイン画面で認証情報を入力しログインする | メモ一覧画面へ遷移する | 画面 / API |
| `TC-LOGIN-003-01` | `VP-LOGIN-003` | `auth.spec.ts` | 認証 | ログイン画面 | 異常系 | 高 | 誤った認証情報でログインできないことを確認する | 有効な一般ユーザーが存在する | 誤ったパスワード | ログイン画面で誤った認証情報を入力する | ログインできずログイン画面に留まる | 画面 / API |
| `TC-LOGIN-004-01` | `VP-LOGIN-004` | `auth.spec.ts` | 認証 | ログイン画面 | 異常系 | 高 | ログイン失敗時のメッセージを確認する | 有効な一般ユーザーが存在する | 誤った認証情報 | ログインに失敗させる | 「ユーザーIDまたはパスワードが正しくありません。」が表示される | 画面 |
| `TC-LOGIN-010-01` | `VP-LOGIN-010` | `auth.spec.ts` | 認証 | ログイン画面 | 権限 | 高 | 無効化ユーザーがログインできないことを確認する | 無効化ユーザーが存在する | 無効化ユーザーID、パスワード | 無効化ユーザーでログインする | ログインできない | 画面 / API |
| `TC-LOGOUT-001-01` | `VP-LOGOUT-001` | `auth.spec.ts` | 認証 | ログアウト操作 | 正常系 | 高 | ログアウトできることを確認する | 一般ユーザーでログイン済み | なし | ログアウト操作を行う | セッションが終了する | 画面 / API |
| `TC-AUTH-GUARD-001-01` | `VP-AUTH-GUARD-001` | `auth.spec.ts` | 認証 | 保護画面共通 | 権限 | 高 | 未ログイン状態でメモ一覧へアクセスできないことを確認する | 未ログイン | なし | メモ一覧URLへ直接アクセスする | ログイン画面へ遷移する | 画面 / API |
| `TC-MEMO-LIST-001-01` | `VP-MEMO-LIST-001` | `memo-list.spec.ts` | メモ管理 | メモ一覧画面 | 正常系 | 高 | 登録済みメモが一覧表示されることを確認する | 一般ユーザーでログイン済み、メモあり | `TC-MEMO-LIST`付きメモ | メモ一覧を開く | 対象メモが表示される | 画面 / API |
| `TC-MEMO-LIST-002-01` | `VP-MEMO-LIST-002` | `memo-list.spec.ts` | メモ管理 | メモ一覧画面 | 正常系 | 中 | 初期表示順が更新日時降順であることを確認する | 複数メモが存在する | 更新日時が異なる複数メモ | メモ一覧を開く | 更新日時が新しい順に表示される | 画面 / API |
| `TC-MEMO-LIST-004-01` | `VP-MEMO-LIST-004` | `memo-list.spec.ts` | メモ管理 | メモ一覧画面 | 準正常系 | 中 | メモ0件時の表示を確認する | メモが0件のユーザーでログイン済み | メモなし | メモ一覧を開く | 「メモが登録されていません。」が表示される | 画面 |
| `TC-MEMO-CREATE-001-01` | `VP-MEMO-CREATE-001` | `memo-create.spec.ts` | メモ管理 | メモ新規作成画面 | 正常系 | 高 | タイトルと本文を入力してメモ登録できることを確認する | 一般ユーザーでログイン済み | 一意なタイトル、本文 | 作成画面でタイトルと本文を入力し登録する | 登録成功し一覧に表示される | 画面 / API / DB |
| `TC-MEMO-CREATE-004-01` | `VP-MEMO-CREATE-004` | `memo-create.spec.ts` | メモ管理 | メモ新規作成画面 | 境界値正常 | 高 | タイトル100文字ちょうどで登録できることを確認する | 一般ユーザーでログイン済み | 100文字タイトル | 作成画面で入力し登録する | 登録成功する | 画面 / API / DB |
| `TC-MEMO-CREATE-005-01` | `VP-MEMO-CREATE-005` | `memo-create.spec.ts` | メモ管理 | メモ新規作成画面 | 境界値異常 | 高 | タイトル101文字で登録できないことを確認する | 一般ユーザーでログイン済み | 101文字タイトル | 作成画面で入力し登録する | エラー表示、入力内容保持 | 画面 / API |
| `TC-MEMO-CREATE-006-01` | `VP-MEMO-CREATE-006` | `memo-create.spec.ts` | メモ管理 | メモ新規作成画面 | 境界値正常 | 高 | 本文2000文字ちょうどで登録できることを確認する | 一般ユーザーでログイン済み | 2000文字本文 | 作成画面で入力し登録する | 登録成功する | 画面 / API / DB |
| `TC-MEMO-CREATE-007-01` | `VP-MEMO-CREATE-007` | `memo-create.spec.ts` | メモ管理 | メモ新規作成画面 | 境界値異常 | 高 | 本文2001文字で登録できないことを確認する | 一般ユーザーでログイン済み | 2001文字本文 | 作成画面で入力し登録する | エラー表示、入力内容保持 | 画面 / API |
| `TC-MEMO-CREATE-012-01` | `VP-MEMO-CREATE-012` | `memo-create.spec.ts` | メモ管理 | メモ新規作成画面 | 異常系 | 高 | 登録ボタン連続押下で二重登録されないことを確認する | 一般ユーザーでログイン済み | 一意なタイトル、本文 | 登録ボタンを連続押下する | 同一メモが複数登録されない | 画面 / API / DB |
| `TC-MEMO-DETAIL-001-01` | `VP-MEMO-DETAIL-001` | `memo-detail.spec.ts` | メモ管理 | メモ詳細画面 | 正常系 | 中 | メモ詳細の表示項目を確認する | 一般ユーザーでログイン済み、メモあり | 対象メモ | 詳細画面を開く | タイトル、本文、作成日時、更新日時が表示される | 画面 / API |
| `TC-MEMO-DETAIL-003-01` | `VP-MEMO-DETAIL-003` | `memo-detail.spec.ts` | メモ管理 | メモ詳細画面 | 異常系 | 高 | 存在しないメモIDへの直接アクセスを確認する | 一般ユーザーでログイン済み | 存在しないメモID | 詳細URLへ直接アクセスする | 存在しない旨が表示される | 画面 / API |
| `TC-MEMO-EDIT-001-01` | `VP-MEMO-EDIT-001` | `memo-edit.spec.ts` | メモ管理 | メモ編集画面 | 正常系 | 中 | 登録済みタイトルと本文が初期表示されることを確認する | 一般ユーザーでログイン済み、メモあり | 対象メモ | 編集画面を開く | 登録済み値が入力欄に表示される | 画面 / API |
| `TC-MEMO-EDIT-002-01` | `VP-MEMO-EDIT-002` | `memo-edit.spec.ts` | メモ管理 | メモ編集画面 | 正常系 | 高 | タイトルと本文を更新できることを確認する | 一般ユーザーでログイン済み、メモあり | 更新後タイトル、本文 | 編集画面で値を変更し更新する | 更新成功しDBへ反映される | 画面 / API / DB |
| `TC-MEMO-EDIT-004-01` | `VP-MEMO-EDIT-004` | `memo-edit.spec.ts` | メモ管理 | メモ編集画面 | 正常系 | 高 | 更新時にメモIDと作成日時が変わらないことを確認する | 一般ユーザーでログイン済み、メモあり | 対象メモ | メモを更新する | メモID、作成日時は変更されない | API / DB |
| `TC-MEMO-DELETE-003-01` | `VP-MEMO-DELETE-003` | `memo-delete.spec.ts` | メモ管理 | メモ削除確認画面 | 正常系 | 高 | メモが論理削除されることを確認する | 一般ユーザーでログイン済み、メモあり | 削除対象メモ | 削除確認で削除するを選択する | 一覧に表示されずDBで削除日時が設定される | 画面 / API / DB |
| `TC-MEMO-DELETE-005-01` | `VP-MEMO-DELETE-005` | `memo-delete.spec.ts` | メモ管理 | メモ削除確認画面 | 準正常系 | 高 | 削除キャンセル時にメモが削除されないことを確認する | 一般ユーザーでログイン済み、メモあり | 削除対象メモ | 削除確認でキャンセルする | メモは削除されない | 画面 / API / DB |
| `TC-SEARCH-001-01` | `VP-SEARCH-001` | `search.spec.ts` | 検索 | メモ一覧画面 | 正常系 | 中 | タイトルの部分一致検索を確認する | 一般ユーザーでログイン済み、検索対象メモあり | 検索語 | 検索欄へ文字列を入力する | 一致するメモのみ表示される | 画面 / API |
| `TC-SEARCH-003-01` | `VP-SEARCH-003` | `search.spec.ts` | 検索 | メモ一覧画面 | 正常系 | 中 | 大文字小文字を区別しない検索を確認する | 一般ユーザーでログイン済み | `Test`を含むメモ、検索語`test` | 検索する | 大文字小文字違いでも一致する | 画面 / API |
| `TC-SEARCH-005-01` | `VP-SEARCH-005` | `search.spec.ts` | 検索 | メモ一覧画面 | 準正常系 | 中 | 検索結果0件時の表示を確認する | 一般ユーザーでログイン済み | 一致しない検索語 | 検索する | 「条件に一致するメモがありません。」が表示される | 画面 |
| `TC-PAGING-003-01` | `VP-PAGING-003` | `memo-list.spec.ts` | ページング | メモ一覧画面 | 境界値正常 | 中 | メモ10件ちょうどのページング表示を確認する | 一般ユーザーでログイン済み、メモ10件 | 10件のメモ | 一覧を開く | 1ページ内に10件表示される | 画面 / API |
| `TC-PAGING-004-01` | `VP-PAGING-004` | `memo-list.spec.ts` | ページング | メモ一覧画面 | 境界値正常 | 中 | メモ11件時のページング表示を確認する | 一般ユーザーでログイン済み、メモ11件 | 11件のメモ | 一覧を開く | 2ページ目へ移動できる | 画面 / API |
| `TC-SORT-002-01` | `VP-SORT-002` | `memo-list.spec.ts` | 並び替え | メモ一覧画面 | 正常系 | 中 | 更新日時で並び替えできることを確認する | 一般ユーザーでログイン済み、複数メモあり | 更新日時が異なるメモ | 並び替え条件を更新日時にする | 指定順に並ぶ | 画面 / API |
| `TC-TAG-CREATE-001-01` | `VP-TAG-CREATE-001` | `tag-favorite.spec.ts` | タグ | メモ新規作成画面 | 正常系 | 中 | タグ付きメモを登録できることを確認する | 一般ユーザーでログイン済み | タグ付きメモ | 作成画面でタグを入力し登録する | メモとタグが紐づく | 画面 / API / DB |
| `TC-TAG-CREATE-007-01` | `VP-TAG-CREATE-007` | `tag-favorite.spec.ts` | タグ | メモ新規作成画面 | 準正常系 | 中 | 重複タグが1件にまとめられることを確認する | 一般ユーザーでログイン済み | 重複タグ | 重複タグを入力して登録する | 同一メモ内のタグが重複しない | 画面 / API / DB |
| `TC-FAVORITE-LIST-001-01` | `VP-FAVORITE-LIST-001` | `tag-favorite.spec.ts` | お気に入り | メモ一覧画面 | 正常系 | 中 | お気に入り登録できることを確認する | 一般ユーザーでログイン済み、メモあり | 対象メモ | お気に入りボタンを押す | お気に入り状態になる | 画面 / API / DB |
| `TC-DRAFT-CREATE-001-01` | `VP-DRAFT-CREATE-001` | `draft.spec.ts` | 自動保存 | メモ新規作成画面 | 正常系 | 高 | 入力変更後3秒で下書き保存されることを確認する | 一般ユーザーでログイン済み | 下書きタイトル、本文 | 入力後3秒以上待つ | 下書き保存成功表示、DBに下書き保存 | 画面 / API / DB |
| `TC-DRAFT-COMMON-006-01` | `VP-DRAFT-COMMON-006` | `draft.spec.ts` | 自動保存 | 自動保存共通 | 異常系 | 高 | 自動保存失敗時も手動保存できることを確認する | 一般ユーザーでログイン済み | 下書き保存失敗状態 | 自動保存APIを失敗させた後に登録する | 手動登録は成功する | 画面 / API |
| `TC-CONFLICT-EDIT-001-01` | `VP-CONFLICT-EDIT-001` | `conflict.spec.ts` | 同時編集 | メモ編集画面 | 異常系 | 高 | 同時編集競合を検知できることを確認する | 2ユーザーまたは2コンテキストで同一メモを編集可能 | 対象メモ | 一方で更新後、もう一方で保存する | 競合を検知する | 画面 / API / DB |
| `TC-CONFLICT-EDIT-002-01` | `VP-CONFLICT-EDIT-002` | `conflict.spec.ts` | 同時編集 | メモ編集画面 | 異常系 | 高 | 競合時に409 Conflictを返すことを確認する | 同時編集競合状態 | 対象メモ | 古い更新日時で更新APIを送る | 409を返す | API |
| `TC-ATTACHMENT-CREATE-001-01` | `VP-ATTACHMENT-CREATE-001` | `attachment-image.spec.ts` | 添付ファイル | メモ新規作成画面 | 正常系 | 高 | 添付ファイル付きメモを登録できることを確認する | 一般ユーザーでログイン済み | `sample.pdf` | 添付ファイルを選択し登録する | 詳細画面に添付が表示される | 画面 / API / DB |
| `TC-ATTACHMENT-CREATE-004-01` | `VP-ATTACHMENT-CREATE-004` | `attachment-image.spec.ts` | 添付ファイル | メモ新規作成画面 | 境界値異常 | 高 | 添付ファイル6件で登録できないことを確認する | 一般ユーザーでログイン済み | 6ファイル | 添付ファイルを6件選択し登録する | 件数エラーが表示される | 画面 / API |
| `TC-ATTACHMENT-DETAIL-002-01` | `VP-ATTACHMENT-DETAIL-002` | `attachment-image.spec.ts` | 添付ファイル | メモ詳細画面 | 正常系 | 高 | 添付ファイルを元ファイル名でダウンロードできることを確認する | 添付付きメモが存在する | 添付ファイル | 詳細画面からダウンロードする | ファイルを取得できる | 画面 / API |
| `TC-IMAGE-CREATE-001-01` | `VP-IMAGE-CREATE-001` | `attachment-image.spec.ts` | 画像 | メモ新規作成画面 | 正常系 | 高 | 画像付きメモを登録できることを確認する | 一般ユーザーでログイン済み | `sample.png` | 画像を選択し登録する | 詳細画面で画像プレビューが表示される | 画面 / API / DB |
| `TC-IMAGE-CREATE-004-01` | `VP-IMAGE-CREATE-004` | `attachment-image.spec.ts` | 画像 | メモ新規作成画面 | 境界値異常 | 高 | 画像11枚で登録できないことを確認する | 一般ユーザーでログイン済み | 11画像 | 画像を11枚選択し登録する | 件数エラーが表示される | 画面 / API |
| `TC-USER-LIST-001-01` | `VP-USER-LIST-001` | `user-permission.spec.ts` | ユーザー管理 | ユーザー一覧画面 | 正常系 | 高 | 管理者がユーザー一覧を表示できることを確認する | 管理者でログイン済み | なし | ユーザー一覧画面を開く | ユーザー一覧が表示される | 画面 / API |
| `TC-USER-LIST-002-01` | `VP-USER-LIST-002` | `user-permission.spec.ts` | ユーザー管理 | ユーザー一覧画面 | 権限 | 高 | 一般ユーザーがユーザー一覧へアクセスできないことを確認する | 一般ユーザーでログイン済み | なし | ユーザー一覧URLへ直接アクセスする | アクセス権限なしになる | 画面 / API |
| `TC-USER-CREATE-001-01` | `VP-USER-CREATE-001` | `user-permission.spec.ts` | ユーザー管理 | ユーザー作成画面 | 正常系 | 高 | 管理者がユーザーを作成できることを確認する | 管理者でログイン済み | 新規ユーザー情報 | 作成画面でユーザー情報を入力し登録する | ユーザーが登録される | 画面 / API / DB |
| `TC-USER-EDIT-005-01` | `VP-USER-EDIT-005` | `user-permission.spec.ts` | ユーザー管理 | ユーザー編集画面 | 準正常系 | 高 | パスワード未入力時にパスワードが変更されないことを確認する | 管理者でログイン済み、対象ユーザーあり | パスワード未入力 | パスワードを空のまま更新する | 既存パスワードでログインできる | 画面 / API / DB |
| `TC-USER-DISABLE-005-01` | `VP-USER-DISABLE-005` | `user-permission.spec.ts` | ユーザー管理 | ユーザー無効化確認画面 | 権限 | 高 | 無効化されたユーザーがログインできないことを確認する | 管理者で対象ユーザーを無効化済み | 無効化ユーザー | 無効化ユーザーでログインする | ログインできない | 画面 / API |
| `TC-PERMISSION-MEMO-002-01` | `VP-PERMISSION-MEMO-002` | `user-permission.spec.ts` | 権限管理 | メモ詳細画面 | 権限 | 高 | 一般ユーザーが他ユーザーのメモを閲覧できないことを確認する | 一般ユーザーA/B、Bのメモあり | 他ユーザーのメモID | AでBのメモ詳細URLへアクセスする | 閲覧できない | 画面 / API |
| `TC-PERMISSION-MEMO-003-01` | `VP-PERMISSION-MEMO-003` | `user-permission.spec.ts` | 権限管理 | メモ編集画面 | 権限 | 高 | 一般ユーザーが他ユーザーのメモを編集できないことを確認する | 一般ユーザーA/B、Bのメモあり | 他ユーザーのメモID | AでBのメモ編集URLへアクセスする | 編集できない | 画面 / API |
| `TC-COMMON-API-001-01` | `VP-COMMON-API-001` | `common-api.spec.ts` | 共通 | API共通 | 権限 | 高 | 未認証時に401を返すことを確認する | 未ログイン | なし | 保護APIへ未認証でリクエストする | 401を返す | API |
| `TC-COMMON-API-002-01` | `VP-COMMON-API-002` | `common-api.spec.ts` | 共通 | API共通 | 権限 | 高 | 権限不足時に403を返すことを確認する | 一般ユーザーでログイン済み | ユーザー管理API | 権限が必要なAPIへリクエストする | 403を返す | API |
| `TC-COMMON-SECURITY-002-01` | `VP-COMMON-SECURITY-002` | `common-api.spec.ts` | 共通 | セキュリティ共通 | セキュリティ | 高 | APIレスポンスにパスワード情報を含めないことを確認する | 管理者でログイン済み | ユーザー一覧API | ユーザー一覧APIを取得する | パスワードまたはハッシュが含まれない | API |
| `TC-COMMON-SECURITY-005-01` | `VP-COMMON-SECURITY-005` | `attachment-image.spec.ts` | 共通 | ファイル操作共通 | セキュリティ | 高 | パストラバーサルを含むファイル名で不正アクセスできないことを確認する | 一般ユーザーでログイン済み | `../evil.txt` 相当 | ファイルアップロードまたは取得を試行する | 不正アクセスできない | API |

## 6. Playwrightコード雛形

### 6.1 認証ヘルパー

```ts
import { Page, expect } from '@playwright/test';

export type TestRole = 'admin' | 'general' | 'disabled';

const users = {
  admin: { userId: 'test_admin', password: 'Password123' },
  general: { userId: 'test_user', password: 'Password123' },
  disabled: { userId: 'test_disabled', password: 'Password123' },
} satisfies Record<TestRole, { userId: string; password: string }>;

export async function loginAsUser(page: Page, role: TestRole = 'general') {
  const user = users[role];

  await page.goto('/login');
  await page.getByLabel('ユーザーID').fill(user.userId);
  await page.getByLabel('パスワード').fill(user.password);
  await page.getByRole('button', { name: 'ログイン' }).click();

  if (role !== 'disabled') {
    await expect(page.getByRole('heading', { name: 'メモ一覧' })).toBeVisible();
  }
}
```

### 6.2 ログインテスト例

```ts
import { test, expect } from '@playwright/test';

test.describe('認証 / ログイン画面', () => {
  test('TC-LOGIN-001-01 / VP-LOGIN-001 正しいユーザーID・パスワードでログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('ユーザーID').fill('test_user');
    await page.getByLabel('パスワード').fill('Password123');

    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/login') &&
        response.request().method() === 'POST' &&
        response.ok()
      ),
      page.getByRole('button', { name: 'ログイン' }).click(),
    ]);

    await expect(page.getByRole('heading', { name: 'メモ一覧' })).toBeVisible();
  });

  test('TC-LOGIN-003-01 / VP-LOGIN-003 誤った認証情報でログインできない', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('ユーザーID').fill('test_user');
    await page.getByLabel('パスワード').fill('wrong-password');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('ユーザーIDまたはパスワードが正しくありません。')).toBeVisible();
    await expect(page).toHaveURL(/.*\/login/);
  });
});
```

### 6.3 メモ作成テスト例

```ts
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test.describe('メモ管理 / メモ新規作成画面', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page, 'general');
  });

  test('TC-MEMO-CREATE-001-01 / VP-MEMO-CREATE-001 タイトルと本文を入力してメモを登録できる', async ({ page }) => {
    const title = `TC-MEMO-CREATE-001-${Date.now()}`;

    await page.goto('/memos/new');
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('メモ本文のテストです。');

    await Promise.all([
      page.waitForResponse(response =>
        response.url().includes('/api/todos') &&
        response.request().method() === 'POST' &&
        response.status() === 201
      ),
      page.getByRole('button', { name: '登録' }).click(),
    ]);

    await expect(page.getByText('メモを登録しました。')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'メモ一覧' })).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('TC-MEMO-CREATE-004-01 / VP-MEMO-CREATE-004 タイトル100文字ちょうどで登録できる', async ({ page }) => {
    const title = 'あ'.repeat(100);

    await page.goto('/memos/new');
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('本文あり');
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('メモを登録しました。')).toBeVisible();
  });
});
```

### 6.4 API単体テスト例

```ts
import { test, expect } from '@playwright/test';

test.describe('共通 / API共通', () => {
  test('TC-COMMON-API-001-01 / VP-COMMON-API-001 未認証時に401を返す', async ({ request }) => {
    const response = await request.get('/api/todos');

    expect(response.status()).toBe(401);
  });
});
```

### 6.5 ファイルアップロードテスト例

```ts
import { test, expect } from '@playwright/test';
import { loginAsUser } from '../helpers/auth';

test('TC-ATTACHMENT-CREATE-001-01 / VP-ATTACHMENT-CREATE-001 添付ファイルを付けてメモを登録できる', async ({ page }) => {
  await loginAsUser(page, 'general');

  const title = `TC-ATTACHMENT-CREATE-001-${Date.now()}`;

  await page.goto('/memos/new');
  await page.getByLabel('タイトル').fill(title);
  await page.getByLabel('本文').fill('添付ファイルあり');
  await page.getByLabel('添付ファイル').setInputFiles('tests/fixtures/files/sample.pdf');
  await page.getByRole('button', { name: '登録' }).click();

  await expect(page.getByText('メモを登録しました。')).toBeVisible();
  await expect(page.getByText(title)).toBeVisible();
});
```

## 7. 実装前確認事項

Playwrightコード化の前に、以下を実アプリに合わせて確定する。

| 確認事項 | 理由 |
| --- | --- |
| 画面URL | `/login`、`/memos/new` などが実装と一致する必要がある |
| APIパス | `/api/login`、`/api/todos` などが実装と一致する必要がある |
| ラベル名 | `getByLabel('ユーザーID')` 等が実画面で取得できる必要がある |
| ボタン名 | `ログイン`、`登録`、`更新`、`削除する` 等が実画面と一致する必要がある |
| テストユーザー | 管理者、一般ユーザー、無効化ユーザーを安定して準備する必要がある |
| DB確認方法 | DBヘルパーで確認するか、API確認に寄せるか決める必要がある |
| 後処理 | 作成メモ、ユーザー、ファイル、下書きをテスト後に片付ける必要がある |
