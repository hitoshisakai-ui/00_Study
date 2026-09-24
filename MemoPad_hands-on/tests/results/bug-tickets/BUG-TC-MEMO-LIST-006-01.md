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

## 対応内容

- 対象ファイル: `tests/test-cases/viewpoint-table.spec.ts`
- タイトル生成を仕様上限100文字以内に収めるよう変更した。
  - 変更前: `TC-MEMO-LIST-006-${'LongTitle'.repeat(10)}` は108文字となり、APIバリデーションで `400 Bad Request` になる。
  - 変更後: `TC-MEMO-LIST-006-${Date.now().toString(36)}-${'LongTitle'.repeat(8)}` とし、100文字以内かつ実行ごとに一意な値にした。
- 検索語を固定プレフィックスではなく作成したタイトル全体に変更し、過去実行で残った同名データと衝突しないようにした。
- 一覧表示確認をページ全体の `getByText(title)` ではなく、対象メモ行 `.memo-item` に限定した。
- テスト失敗時にも作成メモを削除できるよう、削除処理を `finally` に移動した。
- `toHaveScreenshot` 用の基準画像を追加した。

## 対応後の確認

```bash
node node_modules\@playwright\test\cli.js test viewpoint-table.spec.ts --grep TC-MEMO-LIST-006-01
```

- 結果: passed
- 判定: テストコード不備として修正済み
