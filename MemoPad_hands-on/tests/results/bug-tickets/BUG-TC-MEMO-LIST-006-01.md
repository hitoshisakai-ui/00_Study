# 不具合: TC-MEMO-LIST-006-01 長いタイトル・本文のメモ作成APIが400を返す

## 概要
長いタイトルや本文でも一覧表示が崩れないことを確認するテストで、事前データ作成用のメモ作成APIが期待値 `201` ではなく `400` を返し、Playwrightテストが失敗した。

## 対象テスト
- ケースID: TC-MEMO-LIST-006-01
- 観点ID: VP-MEMO-LIST-006
- 観点名: 長いタイトルや本文でも一覧表示が崩れない
- テストファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 発生箇所: `createMemo` 呼び出し、`viewpoint-table.spec.ts:64`
- 実行ブラウザ: Chromium
- 実行日時: 2026-09-15

## 期待結果
長いタイトル・本文のメモ作成APIが `201 Created` を返し、一覧画面で該当メモが表示され、詳細・編集・削除ボタンを含む一覧表示が崩れない。

## 実際結果
メモ作成APIが `400 Bad Request` を返したため、一覧表示の検証に進めずテストが失敗した。

## 再現手順
1. `C:\ai-Coding-traning\MemoPad_hands-on` に移動する
2. Playwrightテストを実行する
   ```bash
   npx playwright test --config ..\..\playwright.config.ts
   ```
3. 対象ケース `TC-MEMO-LIST-006-01` が NG になることを確認する

## エラー内容
```text
Error: create memo API status

Expected: 201
Received: 400
    at createMemo (C:\ai-Coding-traning\MemoPad_hands-on\tests\test-cases\viewpoint-table.spec.ts:64:55)
    at C:\ai-Coding-traning\MemoPad_hands-on\tests\test-cases\viewpoint-table.spec.ts:214:18
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
長文入力に対するAPIバリデーション、またはテストデータの本文長が仕様上限を超過していないか確認が必要。
