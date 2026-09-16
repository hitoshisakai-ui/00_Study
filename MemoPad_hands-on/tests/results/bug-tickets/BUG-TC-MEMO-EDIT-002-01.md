# 不具合: TC-MEMO-EDIT-002-01 タイトル項目が select として解決され fill できない

## 概要
タイトルと本文を更新できることを確認するテストで、タイトル入力欄の locator が期待したテキスト入力欄ではなく `select` 要素として解決され、`.fill()` が実行できず Playwrightテストが失敗した。

## 対象テスト
- ケースID: TC-MEMO-EDIT-002-01
- 観点ID: VP-MEMO-EDIT-002
- 観点名: タイトルと本文を更新できる
- テストファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 発生箇所: `getByLabel('タイトル').fill(updatedTitle)` 付近
- 実行ブラウザ: Chromium
- 実行日時: 2026-09-15

## 期待結果
編集画面でタイトル入力欄と本文入力欄を更新し、更新後のタイトル・本文が保存される。

## 実際結果
`getByLabel('タイトル')` が `select` 要素に解決され、テキスト入力操作 `.fill()` ができない。

## 再現手順
1. `C:\ai-Coding-traning\MemoPad_hands-on` に移動する
2. Playwrightテストを実行する
   ```bash
   npx playwright test --config ..\..\playwright.config.ts
   ```
3. 対象ケース `TC-MEMO-EDIT-002-01` が NG になることを確認する

## エラー内容
```text
getByLabel('タイトル') が select に解決され、fill() できない。
```

## 証跡
- 実行結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\playwright-execution-report.md`
- JSON結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\results.json`
- HTMLレポート: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\html-report`
- Trace / artifact: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\artifacts`

## 優先度
Medium

## 備考
ラベル文言の重複、`for` 属性の紐付け、または編集画面内のフォーム要素のアクセシブルネームが意図通りか確認が必要。現在の `stderr.log` には本ケースの詳細スタックが出力されていないため、HTMLレポートまたは trace で追加確認する。

## 対応内容

- 対象ファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 編集画面での `タイトル` / `本文` 入力をフォーム内に限定した。
  - 変更前: `page.getByLabel('タイトル')` / `page.getByLabel('本文')`
  - 変更後: `const form = page.locator('form')` を使用し、`form.getByLabel('タイトル')` / `form.getByLabel('本文')`
- 一覧画面側のフィルタや select と誤一致するリスクを下げ、編集フォームの入力欄だけを対象にした。

## 対応後の確認

```bash
node node_modules\@playwright\test\cli.js test viewpoint-table.spec.ts --grep "TC-MEMO-EDIT-002-01|TC-TAG-CREATE-001-01|TC-USER-CREATE-001-01"
```

- 結果: passed
- 判定: 再発防止としてテスト locator を修正済み
