# 不具合: TC-USER-DISABLE-007-01 ユーザー作成APIが期待値201に対して400を返す

## 概要
無効化後の既存セッションが保護APIで拒否されることを確認するテストで、事前データ作成用のユーザー作成APIが期待値 `201` ではなく `400` を返し、Playwrightテストが失敗した。

## 対象テスト
- ケースID: TC-USER-DISABLE-007-01
- 観点ID: VP-USER-DISABLE-007
- 観点名: 無効化後の既存セッションは保護APIで拒否される
- テストファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 発生箇所: `createUser` 呼び出し付近
- 実行ブラウザ: Chromium
- 実行日時: 2026-09-15

## 期待結果
ユーザー作成APIが `201 Created` を返し、作成ユーザーでログイン後、管理者により無効化された既存セッションで保護APIへアクセスすると `401 Unauthorized` が返る。

## 実際結果
ユーザー作成APIが `400 Bad Request` を返したため、ユーザー無効化後の既存セッション検証に進めずテストが失敗した。

## 再現手順
1. `C:\ai-Coding-traning\MemoPad_hands-on` に移動する
2. Playwrightテストを実行する
   ```bash
   npx playwright test --config ..\..\playwright.config.ts
   ```
3. 対象ケース `TC-USER-DISABLE-007-01` が NG になることを確認する

## エラー内容
```text
create user API status

Expected: 201
Received: 400
```

## 証跡
- 実行結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\playwright-execution-report.md`
- JSON結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\results.json`
- HTMLレポート: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\html-report`
- Trace / artifact: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\artifacts`

## 優先度
High

## 備考
ユーザー作成APIのバリデーション、テストデータの一意性、または既存データとの衝突を確認する。現在の `stderr.log` には本ケースの詳細スタックが出力されていないため、HTMLレポートまたは trace で追加確認する。

## 対応内容

- 対象ファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 無効化テスト用のユーザーID生成を、20文字以内かつ衝突しにくい形式に変更した。
  - 変更前: `unique('disableuser').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20)`
  - 変更後: `` `du-${Date.now().toString(36)}-${test.info().parallelIndex}`.slice(0, 20) ``
- 20文字制限で末尾が切られても一意性が残りやすい短い接頭辞にした。

## 対応後の確認

```bash
node node_modules\@playwright\test\cli.js test viewpoint-table.spec.ts --grep TC-USER-DISABLE-007-01
```

- 結果: passed
- 判定: テストデータ生成不備の予防修正として対応済み
