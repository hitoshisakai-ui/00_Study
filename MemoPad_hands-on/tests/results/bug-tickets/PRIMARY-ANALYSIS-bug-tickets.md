# 一次解析: bug-tickets 不具合分析

## 対象

- 対象ディレクトリ: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\bug-tickets`
- 解析日: 2026-09-15
- 参照結果: `tests/results/results.json`
- 参照実装:
  - `tests/test-cases/viewpoint-table.spec.ts`
  - `server/index.js`
  - `client/src/App.jsx`

## 総評

bug-tickets は5件あるが、直近の `results.json` 上で失敗しているのは3件である。

- `TC-MEMO-LIST-006-01`
- `TC-TAG-CREATE-001-01`
- `TC-USER-CREATE-001-01`

`TC-MEMO-EDIT-002-01` と `TC-USER-DISABLE-007-01` はチケット上では不具合として記録されているが、直近結果では成功しているため、再現性確認またはチケット更新が必要である。

全体として、製品ロジックの明確な不具合というより、テストデータが仕様上限を超えている問題、および Playwright locator が曖昧な問題が中心である。

## 一覧

| チケット | 現象 | 一次判定 | 優先対応 |
|---|---|---|---|
| `TC-MEMO-LIST-006-01` | メモ作成APIが `400` を返す | テストデータ不備の可能性が高い | テストデータ修正 |
| `TC-TAG-CREATE-001-01` | `getByLabel('タグ')` が複数要素に一致 | locator/アクセシブルネーム衝突 | テスト locator 修正、可能ならUI改善 |
| `TC-USER-CREATE-001-01` | `getByText(userId)` が複数要素に一致 | locator が曖昧 | テスト locator 修正 |
| `TC-MEMO-EDIT-002-01` | タイトル欄が select として解決される | 直近結果では再現せず | 再現確認 |
| `TC-USER-DISABLE-007-01` | ユーザー作成APIが `400` を返す | 直近結果では再現せず。ID衝突リスクあり | 再現確認、テストID生成改善 |

## TC-MEMO-LIST-006-01

### 内容

長いタイトルや本文でも一覧表示が崩れないことを確認するテストで、事前データ作成用のメモ作成APIが期待値 `201` ではなく `400 Bad Request` を返している。

### 原因

テストデータのタイトルが仕様上限を超過している可能性が高い。

該当テストでは以下のタイトルを作成している。

```ts
const title = `TC-MEMO-LIST-006-${'LongTitle'.repeat(10)}`;
```

`TC-MEMO-LIST-006-` は18文字、`LongTitle` は9文字で10回繰り返しのため90文字、合計108文字となる。

一方、サーバー実装ではタイトルは100文字以内に制限されている。

```js
else if (title.length > 100) errors.title = messages.titleLength;
```

そのため、APIが `400` を返す挙動は仕様通りと判断できる。

### 不具合修正案

- テストデータのタイトルを100文字以内に収める。
- 「長いタイトル」の観点は100文字ちょうど、または仕様内の長い文字列で確認する。
- 本文の長文表示崩れ確認は本文側で実施する。ただし本文も2000文字以内に収める。
- 必要であれば `createMemo` 失敗時にレスポンス本文を出力し、原因を即時確認できるようにする。

### 影響箇所

- `tests/test-cases/viewpoint-table.spec.ts`
  - `TC-MEMO-LIST-006-01`
  - `createMemo`
- `server/index.js`
  - `validateTodo`
- 関連仕様
  - タイトル100文字以内
  - 本文2000文字以内

### 必要な事項

このチケットは製品不具合ではなく、テストデータ不備として扱うのが妥当である。

## TC-TAG-CREATE-001-01

### 内容

タグ付きメモ登録テストで、`getByLabel('タグ')` が本文テキストエリアとタグ入力欄の2要素に一致し、Playwright strict mode violation が発生している。

### 原因

Playwright の `getByLabel('タグ')` が部分一致で解決され、本文 textarea のアクセシブルネームにも一致している。

直近結果では以下の2要素に一致している。

- 本文 textarea
- タグ input

本文入力値が `タグ付き本文` であることも、アクセシブルネーム解決上の混乱を強めている。

### 不具合修正案

テスト側の修正案:

```ts
await page.getByRole('textbox', { name: /^タグ/ }).fill('仕事, 重要');
```

または、メモフォーム内に locator を限定する。

```ts
const form = page.locator('form');
await form.getByRole('textbox', { name: /^タグ/ }).fill('仕事, 重要');
```

アプリ側の改善案:

- 各フォーム要素に `id` を付与する。
- `label htmlFor` で入力欄とラベルを明示的に紐付ける。
- タグ入力欄に `aria-label="タグ"` またはより具体的なラベルを設定する。

### 影響箇所

- `tests/test-cases/viewpoint-table.spec.ts`
  - `TC-TAG-CREATE-001-01`
- `client/src/App.jsx`
  - メモ作成・編集フォーム
  - タグ入力欄
  - 本文入力欄

### 必要な事項

テストだけを通すなら locator 修正で足りる。ただし、フォームのアクセシビリティ品質を上げる観点ではアプリ側のラベル明示化も推奨する。

## TC-USER-CREATE-001-01

### 内容

管理者がユーザーを作成できることを確認するテストで、作成ユーザーIDの表示確認に使っている `getByText(userId)` が3要素に一致して失敗している。

### 原因

作成した `userId` が以下の複数箇所に含まれる。

- ユーザーID
- 表示名
- メールアドレス

そのため、`getByText(userId)` が一意に解決できない。

### 不具合修正案

最小修正:

```ts
await expect(page.getByText(userId, { exact: true })).toBeVisible();
```

より望ましい修正:

- 作成されたユーザー行に locator を絞る。
- ユーザーID列だけを検証対象にする。
- UIに `data-testid` を付与して、表示テキストの重複に依存しないテストにする。

### 影響箇所

- `tests/test-cases/viewpoint-table.spec.ts`
  - `TC-USER-CREATE-001-01`
- `client/src/App.jsx`
  - ユーザー一覧表示

### 必要な事項

アプリ本体の不具合ではなく、テスト locator の曖昧さが原因と判断する。

## TC-MEMO-EDIT-002-01

### 内容

チケットでは、タイトル入力欄の locator が期待した input ではなく select として解決され、`.fill()` できないと記録されている。

### 現状

直近の `results.json` では当該ケースは成功している。

### 原因候補

- 過去実行時点で画面状態が想定と異なっていた。
- `getByLabel('タイトル')` が別のフォームまたはフィルタUIに一致した。
- 実行順や画面遷移失敗により、編集フォームではなく一覧画面の select が残っていた。

### 不具合修正案

- 再現確認を行う。
- 再現する場合、編集フォーム内に locator を限定する。

```ts
const form = page.locator('form');
await form.getByLabel('タイトル').fill(updatedTitle);
```

または、ロールで入力種別を限定する。

```ts
await page.getByRole('textbox', { name: /^タイトル/ }).fill(updatedTitle);
```

### 影響箇所

- `tests/test-cases/viewpoint-table.spec.ts`
  - `TC-MEMO-EDIT-002-01`
- `client/src/App.jsx`
  - メモ編集フォーム
  - 一覧画面の並び替え select

### 必要な事項

最新結果とチケット内容に差分があるため、再実行結果を確認してチケットを更新またはクローズする。

## TC-USER-DISABLE-007-01

### 内容

無効化後の既存セッションが保護APIで拒否されることを確認するテストで、事前データ作成用のユーザー作成APIが `400` を返したと記録されている。

### 現状

直近の `results.json` では当該ケースは成功している。

### 原因候補

テストでは以下のようにユーザーIDを生成している。

```ts
const userId = unique('disableuser').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
```

サーバー実装ではユーザーIDが4文字以上20文字以内に制限されているため、20文字に切り詰めている。

ただし、`disableuser-` の接頭辞が長く、`Date.now()` の後半や `parallelIndex` が切り落とされやすい。そのため、短時間の再実行や残存データがある場合にユーザーID重複で `400` になる可能性がある。

### 不具合修正案

- 20文字以内に収めつつ、一意性が残るID生成に変更する。

例:

```ts
const userId = `du-${Date.now().toString(36)}-${test.info().parallelIndex}`.slice(0, 20);
```

- `createUser` 失敗時にレスポンス本文を出力し、`userIdDuplicate` なのか、他のバリデーションエラーなのかを確認できるようにする。

### 影響箇所

- `tests/test-cases/viewpoint-table.spec.ts`
  - `TC-USER-DISABLE-007-01`
  - `createUser`
- `server/index.js`
  - `validateUser`
  - `POST /api/users`

### 必要な事項

最新結果では成功しているため、チケット内容を再確認する。再発防止としてID生成ロジックの改善は有効である。

## 推奨対応順

1. `TC-MEMO-LIST-006-01` のテストデータを仕様内に修正する。
2. `TC-TAG-CREATE-001-01` の locator をタグ入力欄に限定する。
3. `TC-USER-CREATE-001-01` の locator を完全一致または行・列単位に限定する。
4. `TC-USER-DISABLE-007-01` のID生成を衝突しにくい形式へ変更する。
5. `TC-MEMO-EDIT-002-01` は再現確認後、必要ならフォーム内 locator に限定する。

## 追加確認事項

- API作成ヘルパーで `400` が返った場合、レスポンス本文をログ出力する。
- Playwright の `getByLabel` / `getByText` は部分一致で意図しない要素に一致することがあるため、重要箇所では `exact: true`、正規表現、ロール、フォーム・行単位のスコープを併用する。
- アプリ側のフォーム要素は `id` / `htmlFor` で明示的に紐付けると、テスト安定性とアクセシビリティの両方が改善する。

