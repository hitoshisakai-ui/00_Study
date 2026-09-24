# 不具合: TC-TAG-CREATE-001-01 タグ入力欄の locator が複数要素に一致する

## 概要
タグ付きメモを登録できることを確認するテストで、`getByLabel('タグ')` が複数の要素に一致し、Playwright strict mode violation によりテストが失敗した。

## 対象テスト
- ケースID: TC-TAG-CREATE-001-01
- 観点ID: VP-TAG-CREATE-001
- 観点名: タグ付きメモを登録できる
- テストファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 発生箇所: `viewpoint-table.spec.ts:408`
- 実行ブラウザ: Chromium
- 実行日時: 2026-09-15

## 期待結果
タグ入力欄に `仕事, 重要` を入力し、メモ登録後にタイトルおよびタグ `仕事`、`重要` が表示される。

## 実際結果
`getByLabel('タグ')` が本文テキストエリアとタグ入力欄の2要素に一致し、タグ入力欄を一意に特定できない。

## 再現手順
1. `C:\ai-Coding-traning\MemoPad_hands-on` に移動する
2. Playwrightテストを実行する
   ```bash
   npx playwright test --config ..\..\playwright.config.ts
   ```
3. 対象ケース `TC-TAG-CREATE-001-01` が NG になることを確認する

## エラー内容
```text
Error: locator.fill: Error: strict mode violation: getByLabel('タグ') resolved to 2 elements:
    1) textarea
    2) input

    at C:\ai-Coding-traning\MemoPad_hands-on\tests\test-cases\viewpoint-table.spec.ts:408:33
```

## 証跡
- 実行結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\playwright-execution-report.md`
- JSON結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\results.json`
- stderrログ: `C:\ai-Coding-traning\MemoPad_hands-on\tests\logs\viewpoint-table.stderr.log`
- HTMLレポート: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\html-report`
- Trace / artifact: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\artifacts`

## 優先度
Medium

## 備考
本文ラベルやタグラベルのアクセシブルネームが重複・部分一致している可能性がある。タグ入力欄を一意に識別できるラベル、`id` / `for`、またはテスト側 locator の見直しが必要。

## 対応内容

- 対象ファイル: `tests/test-cases/viewpoint-table.spec.ts`
- タグ入力の locator をフォーム内に限定した。
  - 変更前: `page.getByLabel('タグ').fill('仕事, 重要')`
  - 変更後: `const form = page.locator('form')` を使用し、`form.getByRole('textbox', { name: /^タグ/ }).fill('仕事, 重要')`
- タグ登録後の確認も、ページ全体の `getByText('仕事')` / `getByText('重要')` ではなく、作成したメモ行内の `.tag-chip` に限定した。
- これにより、一覧フィルタのタグ `select` や過去データのタグ表示との strict mode violation を回避した。

## 対応後の確認

```bash
node node_modules\@playwright\test\cli.js test viewpoint-table.spec.ts --grep TC-TAG-CREATE-001-01
```

- 結果: passed
- 判定: テスト locator 不備として修正済み
