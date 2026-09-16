import { test, expect } from '@playwright/test';
import { API_BASE, createMemoByApi, createUserByApi, loginByApi, uniqueId } from '../helpers/api';
import { loginByUi } from '../helpers/auth';

test.describe('権限管理・ユーザー管理', () => {
  test('TC-USER-LIST-001-01 / VP-USER-LIST-001 管理者がユーザー一覧を表示できる', async ({ page }) => {
    await loginByUi(page);
    await page.getByRole('button', { name: 'ユーザー管理' }).click();

    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible();
    await expect(page.getByText('ユーザーID')).toBeVisible();
  });

  test('TC-USER-LIST-002-01 / VP-USER-LIST-002 一般ユーザーにはユーザー管理導線を表示しない', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-user-list-002');
    await createUserByApi(request, admin.token, { userId });

    await loginByUi(page, userId, 'password123');

    await expect(page.getByRole('button', { name: 'ユーザー管理' })).not.toBeVisible();
  });

  test('TC-COMMON-API-002-01 / VP-COMMON-API-002 権限不足時に403を返す', async ({ request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-common-api-002');
    await createUserByApi(request, admin.token, { userId });
    const user = await loginByApi(request, userId, 'password123');

    const response = await request.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    expect(response.status()).toBe(403);
  });

  test('TC-PERMISSION-MEMO-002-01 / VP-PERMISSION-MEMO-002 一般ユーザーが他ユーザーのメモを閲覧できない', async ({ request }) => {
    const admin = await loginByApi(request);
    const ownerId = uniqueId('tc-owner');
    const otherId = uniqueId('tc-other');
    await createUserByApi(request, admin.token, { userId: ownerId });
    await createUserByApi(request, admin.token, { userId: otherId });
    const owner = await loginByApi(request, ownerId, 'password123');
    const other = await loginByApi(request, otherId, 'password123');
    const memo = await createMemoByApi(request, owner.token, { title: `TC-PERMISSION-${Date.now()}` });

    const response = await request.get(`${API_BASE}/todos/${memo.id}`, {
      headers: { Authorization: `Bearer ${other.token}` },
    });

    expect(response.status()).toBe(404);
  });
});
