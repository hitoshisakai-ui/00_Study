import { test, expect } from '@playwright/test';
import { createMemoByApi, createUserByApi, loginByApi, uniqueId } from '../helpers/api';
import { loginByUi } from '../helpers/auth';

test.describe('メモ一覧・検索 / メモ一覧画面', () => {
  test('TC-MEMO-LIST-001-01 / VP-MEMO-LIST-001 登録済みメモが一覧表示される', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-list-001');
    await createUserByApi(request, admin.token, { userId });
    const user = await loginByApi(request, userId, 'password123');
    const memo = await createMemoByApi(request, user.token, { title: `TC-MEMO-LIST-001-${Date.now()}` });

    await loginByUi(page, userId, 'password123');

    await expect(page.getByText(memo.title)).toBeVisible();
  });

  test('TC-MEMO-LIST-004-01 / VP-MEMO-LIST-004 メモ0件時にメッセージが表示される', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-list-004');
    await createUserByApi(request, admin.token, { userId });

    await loginByUi(page, userId, 'password123');

    await expect(page.getByText('メモが登録されていません。')).toBeVisible();
  });

  test('TC-SEARCH-001-01 / VP-SEARCH-001 タイトルを対象に部分一致検索できる', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-search-001');
    await createUserByApi(request, admin.token, { userId });
    const user = await loginByApi(request, userId, 'password123');
    const hitTitle = `TC-SEARCH-001-hit-${Date.now()}`;
    const missTitle = `TC-SEARCH-001-miss-${Date.now()}`;
    await createMemoByApi(request, user.token, { title: hitTitle });
    await createMemoByApi(request, user.token, { title: missTitle });

    await loginByUi(page, userId, 'password123');
    await page.getByLabel('検索').fill('hit');

    await expect(page.getByText(hitTitle)).toBeVisible();
    await expect(page.getByText(missTitle)).not.toBeVisible();
  });

  test('TC-SEARCH-005-01 / VP-SEARCH-005 検索結果0件時にメッセージが表示される', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-search-005');
    await createUserByApi(request, admin.token, { userId });
    const user = await loginByApi(request, userId, 'password123');
    await createMemoByApi(request, user.token, { title: `TC-SEARCH-005-${Date.now()}` });

    await loginByUi(page, userId, 'password123');
    await page.getByLabel('検索').fill('not-found-keyword');

    await expect(page.getByText('条件に一致するメモがありません。')).toBeVisible();
  });
});
