# 不具合: TC-USER-CREATE-001-01 作成ユーザーID表示確認で locator が複数要素に一致する

## 概要
管理者がユーザーを作成できることを確認するテストで、作成したユーザーIDの表示確認に使用した `getByText(userId)` が3要素に一致し、Playwright strict mode violation によりテストが失敗した。

## 対象テスト
- ケースID: TC-USER-CREATE-001-01
- 観点ID: VP-USER-CREATE-001
- 観点名: 管理者がユーザーを作成できる
- テストファイル: `tests/test-cases/viewpoint-table.spec.ts`
- 発生箇所: `viewpoint-table.spec.ts:480`
- 実行ブラウザ: Chromium
- 実行日時: 2026-09-15

## 期待結果
ユーザー登録後、登録完了メッセージと作成したユーザーIDがユーザー一覧に表示される。

## 実際結果
作成したユーザーID文字列が、ユーザーID、表示名、メールアドレスの3要素に含まれており、`getByText(userId)` が一意に解決できない。

## 再現手順
1. `C:\ai-Coding-traning\MemoPad_hands-on` に移動する
2. Playwrightテストを実行する
   ```bash
   npx playwright test --config ..\..\playwright.config.ts
   ```
3. 対象ケース `TC-USER-CREATE-001-01` が NG になることを確認する

## エラー内容
```text
Locator: getByText('user-1789445785642-0')
Expected: visible
Error: strict mode violation: getByText('user-1789445785642-0') resolved to 3 elements:
    1) <span>user-1789445785642-0</span>
    2) <span>表示名 user-1789445785642-0</span>
    3) <span>user-1789445785642-0@example.test</span>

    at C:\ai-Coding-traning\MemoPad_hands-on\tests\test-cases\viewpoint-table.spec.ts:480:42
```

## 証跡
- 実行結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\playwright-execution-report.md`
- JSON結果: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\results.json`
- stderrログ: `C:\ai-Coding-traning\MemoPad_hands-on\tests\logs\viewpoint-table.stderr.log`
- HTMLレポート: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\html-report`
- Trace / artifact: `C:\ai-Coding-traning\MemoPad_hands-on\tests\results\artifacts`

## 優先度
Low

## 備考
アプリ本体の不具合というより、テスト locator が曖昧な可能性が高い。ユーザーID列や行単位に locator を絞る、または exact match を利用するなどの見直しが必要。
