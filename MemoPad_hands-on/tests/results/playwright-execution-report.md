# Playwrightテスト実行結果

## 実行概要

- 実行日時: 2026-09-15 11:57頃
- 実行場所: `C:\ai-Coding-traning\MemoPad_hands-on\tests\test-cases`
- 実行コマンド: `npx.cmd playwright test --config ..\..\playwright.config.ts`
- 対象ブラウザ: Chromium
- 実行件数: 32件
- 成功: 27件
- 失敗: 5件
- 判定: `NG`
- 実行時間: 約26.8秒

## 出力先

- stdoutログ: `C:\ai-Coding-traning\MemoPad_hands-on\tests\logs\viewpoint-table.stdout.log`
- stderrログ: `C:\ai-Coding-traning\MemoPad_hands-on\tests\logs\viewpoint-table.stderr.log`
- JSON結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\results.json`
- HTMLレポート: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\html-report`
- evidence/artifacts: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\artifacts`

## 失敗テスト

| ケースID | 観点ID | 概要 | 実際の結果 |
|---|---|---|---|
| TC-MEMO-LIST-006-01 | VP-MEMO-LIST-006 | 長いタイトルや本文でも一覧表示が崩れない | メモ作成APIが期待値 `201` に対して `400` を返却 |
| TC-MEMO-EDIT-002-01 | VP-MEMO-EDIT-002 | タイトルと本文を更新できる | `getByLabel('タイトル')` が `select` に解決され、`fill()` できない |
| TC-TAG-CREATE-001-01 | VP-TAG-CREATE-001 | タグ付きメモを登録できる | `getByLabel('タグ')` が2要素に一致し strict mode violation |
| TC-USER-CREATE-001-01 | VP-USER-CREATE-001 | 管理者がユーザーを作成できる | 作成ユーザーIDの表示確認が3要素に一致し strict mode violation |
| TC-USER-DISABLE-007-01 | VP-USER-DISABLE-007 | 無効化後の既存セッションは保護APIで拒否される | ユーザー作成APIが期待値 `201` に対して `400` を返却 |

## 補足

`tests/logs` が最初に更新されなかった原因は、カスタムreporterのログ出力パスが実行カレントディレクトリ基準で解決されていたためです。

現在は `playwright.config.ts` を修正し、`tests/logs/viewpoint-table.stdout.log` と `tests/logs/viewpoint-table.stderr.log` に出力されることを確認済みです。
