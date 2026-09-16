# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: viewpoint-table.spec.ts >> MemoPad viewpoint-table mapped Playwright tests >> TC-TAG-CREATE-001-01 / VP-TAG-CREATE-001 タグ付きメモを登録できる
- Location: tests\test-cases\viewpoint-table.spec.ts:402:7

# Error details

```
Error: locator.fill: Error: strict mode violation: getByLabel('タグ') resolved to 2 elements:
    1) <textarea rows="12" maxlength="2100">タグ付き本文</textarea> aka getByRole('textbox', { name: '本文 6/' })
    2) <input value="" placeholder="例: 仕事, 重要"/> aka getByRole('textbox', { name: 'タグ カンマ区切り、最大10個、各30文字以内' })

Call log:
  - waiting for getByLabel('タグ')

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
  - generic [ref=f1e12]:
    - generic [ref=f1e13]:
      - heading "メモ新規作成" [level=2] [ref=f1e14]
      - button "キャンセル" [ref=f1e15] [cursor=pointer]
    - generic [ref=f1e16]:
      - generic [ref=f1e17]:
        - generic [ref=f1e18]: タイトル
        - textbox "タイトル 33/100" [ref=f1e19]: TC-TAG-CREATE-001-1789445779801-0
        - generic [ref=f1e20]: 33/100
      - generic [ref=f1e21]:
        - generic [ref=f1e22]: 本文
        - textbox "本文 6/2000" [active] [ref=f1e23]: タグ付き本文
        - generic [ref=f1e24]: 6/2000
      - generic [ref=f1e25]:
        - generic [ref=f1e26]: タグ
        - textbox "タグ カンマ区切り、最大10個、各30文字以内" [ref=f1e27]:
          - /placeholder: "例: 仕事, 重要"
        - generic [ref=f1e28]: カンマ区切り、最大10個、各30文字以内
      - generic [ref=f1e29]:
        - generic [ref=f1e30]:
          - generic [ref=f1e31]: 添付ファイル
          - button "添付ファイル 最大5件、1ファイル10MB以内" [ref=f1e32]
          - generic [ref=f1e33]: 最大5件、1ファイル10MB以内
        - generic [ref=f1e34]:
          - generic [ref=f1e35]: 画像
          - button "画像 最大10枚、1ファイル5MB以内" [ref=f1e36]
          - generic [ref=f1e37]: 最大10枚、1ファイル5MB以内
      - generic [ref=f1e38]:
        - button "登録" [ref=f1e39] [cursor=pointer]
        - button "キャンセル" [ref=f1e40] [cursor=pointer]
```

# Test source

```ts
  308 |       headers: { Authorization: `Bearer ${token}` },
  309 |     });
  310 |     expect(response.status()).toBe(200);
  311 | 
  312 |     await deleteMemo(request, token, memo.id);
  313 |   });
  314 | 
  315 |   test('TC-SEARCH-001-01 / VP-SEARCH-001 タイトルの部分一致検索ができる', async ({ page, request }) => {
  316 |     const token = await loginByApi(request);
  317 |     const keyword = unique('SearchTitle');
  318 |     const hit = await createMemo(request, token, { title: `${keyword}-hit`, body: '検索対象' });
  319 |     const miss = await createMemo(request, token, { title: unique('SearchTitle-miss'), body: '検索対象外' });
  320 |     await openLoggedInPage(page, request);
  321 | 
  322 |     await page.getByLabel('検索').fill(keyword);
  323 |     await expect(page.getByText(`${keyword}-hit`)).toBeVisible();
  324 |     await expect(page.getByText(miss.title)).toHaveCount(0);
  325 | 
  326 |     await deleteMemo(request, token, hit.id);
  327 |     await deleteMemo(request, token, miss.id);
  328 |   });
  329 | 
  330 |   test('TC-SEARCH-005-01 / VP-SEARCH-005 検索結果0件時の表示を確認する', async ({ page, request }) => {
  331 |     await openLoggedInPage(page, request);
  332 |     await page.getByLabel('検索').fill(unique('no-match-keyword'));
  333 |     await expect(page.getByText('条件に一致するメモがありません。')).toBeVisible();
  334 |   });
  335 | 
  336 |   test('TC-PAGING-004-01 / VP-PAGING-004 メモ11件時に2ページ目へ移動できる', async ({ page, request }) => {
  337 |     const token = await loginByApi(request);
  338 |     const prefix = unique('TC-PAGING-004');
  339 |     const created = [];
  340 |     for (let i = 0; i < 11; i += 1) {
  341 |       created.push(await createMemo(request, token, { title: `${prefix}-${String(i).padStart(2, '0')}`, body: 'ページング本文' }));
  342 |     }
  343 |     await openLoggedInPage(page, request);
  344 | 
  345 |     await page.getByLabel('検索').fill(prefix);
  346 |     await expect(page.getByText('1 / 2')).toBeVisible();
  347 |     await page.getByRole('button', { name: '次へ' }).click();
  348 |     await expect(page.getByText('2 / 2')).toBeVisible();
  349 | 
  350 |     for (const memo of created) await deleteMemo(request, token, memo.id);
  351 |   });
  352 | 
  353 |   test('TC-REFRESH-FILTER-001-01 / VP-REFRESH-FILTER-001 リフレッシュ後は一覧条件が初期状態に戻る', async ({ page, request }) => {
  354 |     const token = await loginByApi(request);
  355 |     const prefix = unique('TC-REFRESH-FILTER-001');
  356 |     const created = [];
  357 |     for (let i = 0; i < 11; i += 1) {
  358 |       created.push(await createMemo(request, token, {
  359 |         title: `${prefix}-${String(i).padStart(2, '0')}`,
  360 |         body: 'refresh filter',
  361 |         tags: 'refresh-tag',
  362 |       }));
  363 |     }
  364 |     await request.post(`${API_BASE}/todos/${created[0].id}/favorite`, {
  365 |       headers: { Authorization: `Bearer ${token}` },
  366 |     });
  367 |     await openLoggedInPage(page, request);
  368 | 
  369 |     await page.getByLabel('検索').fill(prefix);
  370 |     await page.getByLabel('タグ').selectOption('refresh-tag');
  371 |     await page.getByLabel('お気に入りのみ').check();
  372 |     await page.getByLabel('並び替え').selectOption('title');
  373 |     await page.getByRole('button', { name: '昇順' }).click();
  374 |     await page.reload();
  375 | 
  376 |     await expect(page.getByLabel('検索')).toHaveValue('');
  377 |     await expect(page.getByLabel('お気に入りのみ')).not.toBeChecked();
  378 |     await expect(page.getByLabel('並び替え')).toHaveValue('updatedAt');
  379 |     await expect(page.getByRole('button', { name: '降順' })).toHaveClass(/active/);
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
> 408 |     await page.getByLabel('タグ').fill('仕事, 重要');
      |                                 ^ Error: locator.fill: Error: strict mode violation: getByLabel('タグ') resolved to 2 elements:
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
  480 |     await expect(page.getByText(userId)).toBeVisible();
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
```