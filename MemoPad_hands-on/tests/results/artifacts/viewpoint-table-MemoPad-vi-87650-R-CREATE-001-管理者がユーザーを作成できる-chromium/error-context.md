# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: viewpoint-table.spec.ts >> MemoPad viewpoint-table mapped Playwright tests >> TC-USER-CREATE-001-01 / VP-USER-CREATE-001 管理者がユーザーを作成できる
- Location: tests\test-cases\viewpoint-table.spec.ts:468:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('user-1789445785642-0')
Expected: visible
Error: strict mode violation: getByText('user-1789445785642-0') resolved to 3 elements:
    1) <span>user-1789445785642-0</span> aka getByText('user-1789445785642-0', { exact: true })
    2) <span>表示名 user-1789445785642-0</span> aka getByText('表示名 user-1789445785642-')
    3) <span>user-1789445785642-0@example.test</span> aka getByText('user-1789445785642-0@example.')

Call log:
  - Expect "toBeVisible" getByText('user-1789445785642-0') with timeout 5000ms
  - waiting for getByText('user-1789445785642-0')

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - paragraph [ref=f1e6]: 管理者 / 管理者
      - heading "MemoPad" [level=1] [ref=f1e7]
    - generic [ref=f1e8]:
      - button "新規作成" [ref=f1e9] [cursor=pointer]
      - button "ユーザー管理" [ref=f1e10] [cursor=pointer]
      - button "ログアウト" [ref=f1e11] [cursor=pointer]
  - generic [ref=f1e12]: ユーザーを登録しました。
  - generic [ref=f1e13]:
    - generic [ref=f1e14]:
      - heading "ユーザー管理" [level=2] [ref=f1e15]
      - generic [ref=f1e16]:
        - button "ユーザー作成" [ref=f1e17] [cursor=pointer]
        - button "メモ一覧へ戻る" [ref=f1e18] [cursor=pointer]
    - generic [ref=f1e19]:
      - generic [ref=f1e20]:
        - generic [ref=f1e21]: ユーザーID
        - generic [ref=f1e22]: 表示名
        - generic [ref=f1e23]: メール
        - generic [ref=f1e24]: 権限
        - generic [ref=f1e25]: 状態
        - generic [ref=f1e26]: 操作
      - generic [ref=f1e27]:
        - generic [ref=f1e28]: admin
        - generic [ref=f1e29]: 管理者
        - generic [ref=f1e30]: admin@example.com
        - generic [ref=f1e31]: 管理者
        - generic [ref=f1e32]: 有効
        - generic [ref=f1e33]:
          - button "編集" [ref=f1e34] [cursor=pointer]
          - button "無効化" [ref=f1e35] [cursor=pointer]
      - generic [ref=f1e36]:
        - generic [ref=f1e37]: user1789014004
        - generic [ref=f1e38]: "??????"
        - generic [ref=f1e39]: edit-user1789014004@example.com
        - generic [ref=f1e40]: 一般ユーザー
        - generic [ref=f1e41]: 無効
        - generic [ref=f1e42]:
          - button "編集" [ref=f1e43] [cursor=pointer]
          - button "無効化" [disabled] [ref=f1e44]
      - generic [ref=f1e45]:
        - generic [ref=f1e46]: "99999999"
        - generic [ref=f1e47]: 管理者2
        - generic [ref=f1e48]: hitoshi.sakai@asnet.co.jp
        - generic [ref=f1e49]: 管理者
        - generic [ref=f1e50]: 有効
        - generic [ref=f1e51]:
          - button "編集" [ref=f1e52] [cursor=pointer]
          - button "無効化" [ref=f1e53] [cursor=pointer]
      - generic [ref=f1e54]:
        - generic [ref=f1e55]: tc-login-c09jti
        - generic [ref=f1e56]: tc-login-c09jti
        - generic [ref=f1e57]: tc-login-c09jti@example.com
        - generic [ref=f1e58]: 一般ユーザー
        - generic [ref=f1e59]: 有効
        - generic [ref=f1e60]:
          - button "編集" [ref=f1e61] [cursor=pointer]
          - button "無効化" [ref=f1e62] [cursor=pointer]
      - generic [ref=f1e63]:
        - generic [ref=f1e64]: tc-login-3bzll5
        - generic [ref=f1e65]: tc-login-3bzll5
        - generic [ref=f1e66]: tc-login-3bzll5@example.com
        - generic [ref=f1e67]: 一般ユーザー
        - generic [ref=f1e68]: 無効
        - generic [ref=f1e69]:
          - button "編集" [ref=f1e70] [cursor=pointer]
          - button "無効化" [disabled] [ref=f1e71]
      - generic [ref=f1e72]:
        - generic [ref=f1e73]: tc-list--s4cyw4
        - generic [ref=f1e74]: tc-list--s4cyw4
        - generic [ref=f1e75]: tc-list--s4cyw4@example.com
        - generic [ref=f1e76]: 一般ユーザー
        - generic [ref=f1e77]: 有効
        - generic [ref=f1e78]:
          - button "編集" [ref=f1e79] [cursor=pointer]
          - button "無効化" [ref=f1e80] [cursor=pointer]
      - generic [ref=f1e81]:
        - generic [ref=f1e82]: tc-list--q1c3bp
        - generic [ref=f1e83]: tc-list--q1c3bp
        - generic [ref=f1e84]: tc-list--q1c3bp@example.com
        - generic [ref=f1e85]: 一般ユーザー
        - generic [ref=f1e86]: 有効
        - generic [ref=f1e87]:
          - button "編集" [ref=f1e88] [cursor=pointer]
          - button "無効化" [ref=f1e89] [cursor=pointer]
      - generic [ref=f1e90]:
        - generic [ref=f1e91]: tc-searc-8k5ti0
        - generic [ref=f1e92]: tc-searc-8k5ti0
        - generic [ref=f1e93]: tc-searc-8k5ti0@example.com
        - generic [ref=f1e94]: 一般ユーザー
        - generic [ref=f1e95]: 有効
        - generic [ref=f1e96]:
          - button "編集" [ref=f1e97] [cursor=pointer]
          - button "無効化" [ref=f1e98] [cursor=pointer]
      - generic [ref=f1e99]:
        - generic [ref=f1e100]: tc-searc-8qfwkp
        - generic [ref=f1e101]: tc-searc-8qfwkp
        - generic [ref=f1e102]: tc-searc-8qfwkp@example.com
        - generic [ref=f1e103]: 一般ユーザー
        - generic [ref=f1e104]: 有効
        - generic [ref=f1e105]:
          - button "編集" [ref=f1e106] [cursor=pointer]
          - button "無効化" [ref=f1e107] [cursor=pointer]
      - generic [ref=f1e108]:
        - generic [ref=f1e109]: tc-user--d1ppje
        - generic [ref=f1e110]: tc-user--d1ppje
        - generic [ref=f1e111]: tc-user--d1ppje@example.com
        - generic [ref=f1e112]: 一般ユーザー
        - generic [ref=f1e113]: 有効
        - generic [ref=f1e114]:
          - button "編集" [ref=f1e115] [cursor=pointer]
          - button "無効化" [ref=f1e116] [cursor=pointer]
      - generic [ref=f1e117]:
        - generic [ref=f1e118]: tc-commo-l5jcxf
        - generic [ref=f1e119]: tc-commo-l5jcxf
        - generic [ref=f1e120]: tc-commo-l5jcxf@example.com
        - generic [ref=f1e121]: 一般ユーザー
        - generic [ref=f1e122]: 有効
        - generic [ref=f1e123]:
          - button "編集" [ref=f1e124] [cursor=pointer]
          - button "無効化" [ref=f1e125] [cursor=pointer]
      - generic [ref=f1e126]:
        - generic [ref=f1e127]: tc-owner-bqxdi4
        - generic [ref=f1e128]: tc-owner-bqxdi4
        - generic [ref=f1e129]: tc-owner-bqxdi4@example.com
        - generic [ref=f1e130]: 一般ユーザー
        - generic [ref=f1e131]: 有効
        - generic [ref=f1e132]:
          - button "編集" [ref=f1e133] [cursor=pointer]
          - button "無効化" [ref=f1e134] [cursor=pointer]
      - generic [ref=f1e135]:
        - generic [ref=f1e136]: tc-other-n2r50g
        - generic [ref=f1e137]: tc-other-n2r50g
        - generic [ref=f1e138]: tc-other-n2r50g@example.com
        - generic [ref=f1e139]: 一般ユーザー
        - generic [ref=f1e140]: 有効
        - generic [ref=f1e141]:
          - button "編集" [ref=f1e142] [cursor=pointer]
          - button "無効化" [ref=f1e143] [cursor=pointer]
      - generic [ref=f1e144]:
        - generic [ref=f1e145]: user-1789368099707-3
        - generic [ref=f1e146]: 表示名 user-1789368099707-3
        - generic [ref=f1e147]: user-1789368099707-3@example.test
        - generic [ref=f1e148]: 一般ユーザー
        - generic [ref=f1e149]: 有効
        - generic [ref=f1e150]:
          - button "編集" [ref=f1e151] [cursor=pointer]
          - button "無効化" [ref=f1e152] [cursor=pointer]
      - generic [ref=f1e153]:
        - generic [ref=f1e154]: user-1789368540504-4
        - generic [ref=f1e155]: 表示名 user-1789368540504-4
        - generic [ref=f1e156]: user-1789368540504-4@example.test
        - generic [ref=f1e157]: 一般ユーザー
        - generic [ref=f1e158]: 有効
        - generic [ref=f1e159]:
          - button "編集" [ref=f1e160] [cursor=pointer]
          - button "無効化" [ref=f1e161] [cursor=pointer]
      - generic [ref=f1e162]:
        - generic [ref=f1e163]: user-1789368561120-4
        - generic [ref=f1e164]: 表示名 user-1789368561120-4
        - generic [ref=f1e165]: user-1789368561120-4@example.test
        - generic [ref=f1e166]: 一般ユーザー
        - generic [ref=f1e167]: 有効
        - generic [ref=f1e168]:
          - button "編集" [ref=f1e169] [cursor=pointer]
          - button "無効化" [ref=f1e170] [cursor=pointer]
      - generic [ref=f1e171]:
        - generic [ref=f1e172]: user-1789368574969-3
        - generic [ref=f1e173]: 表示名 user-1789368574969-3
        - generic [ref=f1e174]: user-1789368574969-3@example.test
        - generic [ref=f1e175]: 一般ユーザー
        - generic [ref=f1e176]: 有効
        - generic [ref=f1e177]:
          - button "編集" [ref=f1e178] [cursor=pointer]
          - button "無効化" [ref=f1e179] [cursor=pointer]
      - generic [ref=f1e180]:
        - generic [ref=f1e181]: user-1789372250444-3
        - generic [ref=f1e182]: 表示名 user-1789372250444-3
        - generic [ref=f1e183]: user-1789372250444-3@example.test
        - generic [ref=f1e184]: 一般ユーザー
        - generic [ref=f1e185]: 有効
        - generic [ref=f1e186]:
          - button "編集" [ref=f1e187] [cursor=pointer]
          - button "無効化" [ref=f1e188] [cursor=pointer]
      - generic [ref=f1e189]:
        - generic [ref=f1e190]: user-1789372273026-3
        - generic [ref=f1e191]: 表示名 user-1789372273026-3
        - generic [ref=f1e192]: user-1789372273026-3@example.test
        - generic [ref=f1e193]: 一般ユーザー
        - generic [ref=f1e194]: 有効
        - generic [ref=f1e195]:
          - button "編集" [ref=f1e196] [cursor=pointer]
          - button "無効化" [ref=f1e197] [cursor=pointer]
      - generic [ref=f1e198]:
        - generic [ref=f1e199]: user-1789372287893-1
        - generic [ref=f1e200]: 表示名 user-1789372287893-1
        - generic [ref=f1e201]: user-1789372287893-1@example.test
        - generic [ref=f1e202]: 一般ユーザー
        - generic [ref=f1e203]: 有効
        - generic [ref=f1e204]:
          - button "編集" [ref=f1e205] [cursor=pointer]
          - button "無効化" [ref=f1e206] [cursor=pointer]
      - generic [ref=f1e207]:
        - generic [ref=f1e208]: user-1789372464743-3
        - generic [ref=f1e209]: 表示名 user-1789372464743-3
        - generic [ref=f1e210]: user-1789372464743-3@example.test
        - generic [ref=f1e211]: 一般ユーザー
        - generic [ref=f1e212]: 有効
        - generic [ref=f1e213]:
          - button "編集" [ref=f1e214] [cursor=pointer]
          - button "無効化" [ref=f1e215] [cursor=pointer]
      - generic [ref=f1e216]:
        - generic [ref=f1e217]: user-1789372491900-1
        - generic [ref=f1e218]: 表示名 user-1789372491900-1
        - generic [ref=f1e219]: user-1789372491900-1@example.test
        - generic [ref=f1e220]: 一般ユーザー
        - generic [ref=f1e221]: 有効
        - generic [ref=f1e222]:
          - button "編集" [ref=f1e223] [cursor=pointer]
          - button "無効化" [ref=f1e224] [cursor=pointer]
      - generic [ref=f1e225]:
        - generic [ref=f1e226]: user-1789372508404-3
        - generic [ref=f1e227]: 表示名 user-1789372508404-3
        - generic [ref=f1e228]: user-1789372508404-3@example.test
        - generic [ref=f1e229]: 一般ユーザー
        - generic [ref=f1e230]: 有効
        - generic [ref=f1e231]:
          - button "編集" [ref=f1e232] [cursor=pointer]
          - button "無効化" [ref=f1e233] [cursor=pointer]
      - generic [ref=f1e234]:
        - generic [ref=f1e235]: user-1789434466319-0
        - generic [ref=f1e236]: 表示名 user-1789434466319-0
        - generic [ref=f1e237]: user-1789434466319-0@example.test
        - generic [ref=f1e238]: 一般ユーザー
        - generic [ref=f1e239]: 有効
        - generic [ref=f1e240]:
          - button "編集" [ref=f1e241] [cursor=pointer]
          - button "無効化" [ref=f1e242] [cursor=pointer]
      - generic [ref=f1e243]:
        - generic [ref=f1e244]: user-1789440618527-0
        - generic [ref=f1e245]: 表示名 user-1789440618527-0
        - generic [ref=f1e246]: user-1789440618527-0@example.test
        - generic [ref=f1e247]: 一般ユーザー
        - generic [ref=f1e248]: 有効
        - generic [ref=f1e249]:
          - button "編集" [ref=f1e250] [cursor=pointer]
          - button "無効化" [ref=f1e251] [cursor=pointer]
      - generic [ref=f1e252]:
        - generic [ref=f1e253]: disableuser-17894406
        - generic [ref=f1e254]: disableuser-17894406
        - generic [ref=f1e255]: disableuser-17894406@example.test
        - generic [ref=f1e256]: 一般ユーザー
        - generic [ref=f1e257]: 無効
        - generic [ref=f1e258]:
          - button "編集" [ref=f1e259] [cursor=pointer]
          - button "無効化" [disabled] [ref=f1e260]
      - generic [ref=f1e261]:
        - generic [ref=f1e262]: user-1789441008691-0
        - generic [ref=f1e263]: 表示名 user-1789441008691-0
        - generic [ref=f1e264]: user-1789441008691-0@example.test
        - generic [ref=f1e265]: 一般ユーザー
        - generic [ref=f1e266]: 有効
        - generic [ref=f1e267]:
          - button "編集" [ref=f1e268] [cursor=pointer]
          - button "無効化" [ref=f1e269] [cursor=pointer]
      - generic [ref=f1e270]:
        - generic [ref=f1e271]: disableuser-17894410
        - generic [ref=f1e272]: disableuser-17894410
        - generic [ref=f1e273]: disableuser-17894410@example.test
        - generic [ref=f1e274]: 一般ユーザー
        - generic [ref=f1e275]: 無効
        - generic [ref=f1e276]:
          - button "編集" [ref=f1e277] [cursor=pointer]
          - button "無効化" [disabled] [ref=f1e278]
      - generic [ref=f1e279]:
        - generic [ref=f1e280]: user-1789441072491-0
        - generic [ref=f1e281]: 表示名 user-1789441072491-0
        - generic [ref=f1e282]: user-1789441072491-0@example.test
        - generic [ref=f1e283]: 一般ユーザー
        - generic [ref=f1e284]: 有効
        - generic [ref=f1e285]:
          - button "編集" [ref=f1e286] [cursor=pointer]
          - button "無効化" [ref=f1e287] [cursor=pointer]
      - generic [ref=f1e288]:
        - generic [ref=f1e289]: user-1789445785642-0
        - generic [ref=f1e290]: 表示名 user-1789445785642-0
        - generic [ref=f1e291]: user-1789445785642-0@example.test
        - generic [ref=f1e292]: 一般ユーザー
        - generic [ref=f1e293]: 有効
        - generic [ref=f1e294]:
          - button "編集" [ref=f1e295] [cursor=pointer]
          - button "無効化" [ref=f1e296] [cursor=pointer]
```

# Test source

```ts
  380 |     await expect(page.getByText('1 /')).toBeVisible();
  381 | 
  382 |     for (const memo of created) await deleteMemo(request, token, memo.id);
  383 |   });
  384 | 
  385 |   test('TC-SORT-003-01 / VP-SORT-003 タイトルで並び替えできる', async ({ page, request }) => {
  386 |     const token = await loginByApi(request);
  387 |     const prefix = unique('TC-SORT-003');
  388 |     const a = await createMemo(request, token, { title: `${prefix}-A`, body: 'sort' });
  389 |     const b = await createMemo(request, token, { title: `${prefix}-B`, body: 'sort' });
  390 |     await openLoggedInPage(page, request);
  391 | 
  392 |     await page.getByLabel('検索').fill(prefix);
  393 |     await page.getByLabel('並び替え').selectOption('title');
  394 |     await page.getByRole('button', { name: '昇順' }).click();
  395 |     const titles = await page.locator('.memo-item h2').allTextContents();
  396 |     expect(titles.slice(0, 2)).toEqual([`${prefix}-A`, `${prefix}-B`]);
  397 | 
  398 |     await deleteMemo(request, token, a.id);
  399 |     await deleteMemo(request, token, b.id);
  400 |   });
  401 | 
  402 |   test('TC-TAG-CREATE-001-01 / VP-TAG-CREATE-001 タグ付きメモを登録できる', async ({ page, request }) => {
  403 |     const title = unique('TC-TAG-CREATE-001');
  404 |     await openLoggedInPage(page, request);
  405 |     await page.getByRole('button', { name: '新規作成' }).click();
  406 |     await page.getByLabel('タイトル').fill(title);
  407 |     await page.getByLabel('本文').fill('タグ付き本文');
  408 |     await page.getByLabel('タグ').fill('仕事, 重要');
  409 |     await page.getByRole('button', { name: '登録' }).click();
  410 |     await expect(page.getByText(title)).toBeVisible();
  411 |     await expect(page.getByText('仕事')).toBeVisible();
  412 |     await expect(page.getByText('重要')).toBeVisible();
  413 |   });
  414 | 
  415 |   test('TC-FAVORITE-LIST-001-01 / VP-FAVORITE-LIST-001 お気に入り登録できる', async ({ page, request }) => {
  416 |     const token = await loginByApi(request);
  417 |     const title = unique('TC-FAVORITE-LIST-001');
  418 |     const memo = await createMemo(request, token, { title, body: 'お気に入り本文' });
  419 |     await openLoggedInPage(page, request);
  420 | 
  421 |     await page.getByText(title).locator('..').locator('..').getByRole('button', { name: 'お気に入り', exact: true }).click();
  422 |     await page.getByLabel('お気に入りのみ').check();
  423 |     await expect(page.getByText(title)).toBeVisible();
  424 | 
  425 |     await deleteMemo(request, token, memo.id);
  426 |   });
  427 | 
  428 |   test('TC-ATTACHMENT-CREATE-001-01 / VP-ATTACHMENT-CREATE-001 添付ファイル付きメモを登録できる', async ({ request }) => {
  429 |     const token = await loginByApi(request);
  430 |     const title = unique('TC-ATTACHMENT-CREATE-001');
  431 |     const memo = await createMemo(request, token, {
  432 |       title,
  433 |       body: '添付ファイル本文',
  434 |       attachments: [uploadFile('sample.txt', 'text/plain', 'sample attachment')],
  435 |     });
  436 |     const detail = await request.get(`${API_BASE}/todos/${memo.id}`, {
  437 |       headers: { Authorization: `Bearer ${token}` },
  438 |     });
  439 |     const body = await detail.json();
  440 |     expect(body.attachments[0].originalName).toBe('sample.txt');
  441 |     await deleteMemo(request, token, memo.id);
  442 |   });
  443 | 
  444 |   test('TC-IMAGE-CREATE-001-01 / VP-IMAGE-CREATE-001 画像付きメモを登録できる', async ({ request }) => {
  445 |     const token = await loginByApi(request);
  446 |     const title = unique('TC-IMAGE-CREATE-001');
  447 |     const memo = await createMemo(request, token, {
  448 |       title,
  449 |       body: '画像本文',
  450 |       images: [uploadFile('sample.png', 'image/png', 'fake png content')],
  451 |     });
  452 |     const detail = await request.get(`${API_BASE}/todos/${memo.id}`, {
  453 |       headers: { Authorization: `Bearer ${token}` },
  454 |     });
  455 |     const body = await detail.json();
  456 |     expect(body.images[0].originalName).toBe('sample.png');
  457 |     await deleteMemo(request, token, memo.id);
  458 |   });
  459 | 
  460 |   test('TC-USER-LIST-001-01 / VP-USER-LIST-001 管理者がユーザー一覧を表示できる', async ({ page, request }) => {
  461 |     await openLoggedInPage(page, request);
  462 |     await page.getByRole('button', { name: 'ユーザー管理' }).click();
  463 |     await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible();
  464 |     await expect(page.getByText('ユーザーID')).toBeVisible();
  465 |     await expect(page.getByText('パスワード')).toHaveCount(0);
  466 |   });
  467 | 
  468 |   test('TC-USER-CREATE-001-01 / VP-USER-CREATE-001 管理者がユーザーを作成できる', async ({ page, request }) => {
  469 |     const userId = unique('user').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
  470 |     await openLoggedInPage(page, request);
  471 |     await page.getByRole('button', { name: 'ユーザー管理' }).click();
  472 |     await page.getByRole('button', { name: 'ユーザー作成' }).click();
  473 |     await page.getByLabel('ユーザーID').fill(userId);
  474 |     await page.getByLabel('表示名').fill(`表示名 ${userId}`);
  475 |     await page.getByLabel('メールアドレス').fill(`${userId}@example.test`);
  476 |     await page.getByLabel('パスワード').fill('password123');
  477 |     await page.getByLabel('権限').selectOption('user');
  478 |     await page.getByRole('button', { name: '登録' }).click();
  479 |     await expect(page.getByText('ユーザーを登録しました。')).toBeVisible();
> 480 |     await expect(page.getByText(userId)).toBeVisible();
      |                                          ^ Error: expect(locator).toBeVisible() failed
  481 |   });
  482 | 
  483 |   test('TC-USER-DISABLE-007-01 / VP-USER-DISABLE-007 無効化後の既存セッションは保護APIで拒否される', async ({ request }) => {
  484 |     const adminToken = await loginByApi(request);
  485 |     const userId = unique('disableuser').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
  486 |     const created = await createUser(request, adminToken, { userId, role: 'user' });
  487 |     const userToken = await loginByApi(request, { userId, password: 'password123' });
  488 | 
  489 |     await disableUser(request, adminToken, created.user.id);
  490 |     const response = await request.get(`${API_BASE}/me`, {
  491 |       headers: { Authorization: `Bearer ${userToken}` },
  492 |     });
  493 |     expect(response.status()).toBe(401);
  494 |   });
  495 | 
  496 |   test('TC-COMMON-API-001-01 / VP-COMMON-API-001 未認証時に401を返す', async ({ request }) => {
  497 |     const response = await request.get(`${API_BASE}/todos`);
  498 |     expect(response.status()).toBe(401);
  499 |   });
  500 | 
  501 |   test('TC-COMMON-UI-001-01 / VP-COMMON-UI-001 サーバーエラー時に指定メッセージを表示する', async ({ page, request }) => {
  502 |     await openLoggedInPage(page, request);
  503 |     await page.route('**/api/todos', async (route) => {
  504 |       await route.fulfill({
  505 |         status: 500,
  506 |         contentType: 'application/json',
  507 |         body: JSON.stringify({ message: 'server error' }),
  508 |       });
  509 |     });
  510 | 
  511 |     await page.getByRole('button', { name: '新規作成' }).click();
  512 |     await page.getByLabel('タイトル').fill(unique('TC-COMMON-UI-001'));
  513 |     await page.getByLabel('本文').fill('サーバーエラー確認本文');
  514 |     await page.getByRole('button', { name: '登録' }).click();
  515 |     await expect(page.getByText('処理中にエラーが発生しました。時間をおいて再度お試しください。')).toBeVisible();
  516 |   });
  517 | 
  518 |   test('TC-COMMON-UI-002-01 / VP-COMMON-UI-002 通信エラー時に指定メッセージを表示する', async ({ page, request }) => {
  519 |     await openLoggedInPage(page, request);
  520 |     await page.route('**/api/todos**', async (route) => {
  521 |       await route.abort();
  522 |     });
  523 | 
  524 |     await page.reload();
  525 |     await expect(page.getByText('通信に失敗しました。ネットワーク接続を確認してください。')).toBeVisible();
  526 |   });
  527 | 
  528 |   test('TC-COMMON-API-006-01 / VP-COMMON-API-006 サーバーエラー時に500を返す', async ({ request }) => {
  529 |     const token = await loginByApi(request);
  530 |     const response = await request.post(`${API_BASE}/todos`, {
  531 |       headers: {
  532 |         Authorization: `Bearer ${token}`,
  533 |         'Content-Type': 'application/json',
  534 |       },
  535 |       data: '{',
  536 |     });
  537 |     expect(response.status()).toBe(500);
  538 |   });
  539 | 
  540 |   test('TC-COMMON-SECURITY-002-01 / VP-COMMON-SECURITY-002 APIレスポンスにパスワード情報を含めない', async ({ request }) => {
  541 |     const token = await loginByApi(request);
  542 |     const response = await request.get(`${API_BASE}/users`, {
  543 |       headers: { Authorization: `Bearer ${token}` },
  544 |     });
  545 |     expect(response.status()).toBe(200);
  546 |     const bodyText = JSON.stringify(await response.json()).toLowerCase();
  547 |     expect(bodyText).not.toContain('password');
  548 |     expect(bodyText).not.toContain('hash');
  549 |   });
  550 | });
  551 | 
  552 | 
  553 | 
```