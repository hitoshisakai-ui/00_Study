import { test, expect } from '@playwright/test';
import { API_BASE, createUserByApi, disableUserByApi, loginByApi, uniqueId } from '../helpers/api';
import { loginByUi, logoutByUi } from '../helpers/auth';

test.describe('認証 / ログイン画面', () => {
  test('TC-LOGIN-001-01 / VP-LOGIN-001 正しいユーザーID・パスワードでログインできる', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-login-001');
    await createUserByApi(request, admin.token, { userId });

    await loginByUi(page, userId, 'password123');

    await expect(page.getByText(`${userId} / 一般ユーザー`)).toBeVisible();
  });

  test('TC-LOGIN-003-01 / VP-LOGIN-003 誤った認証情報でログインできない', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('ユーザーID').fill('admin');
    await page.getByLabel('パスワード').fill('wrong-password');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('ユーザーIDまたはパスワードが正しくありません。')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'MemoPad ログイン' })).toBeVisible();
  });

  test('TC-LOGIN-005-01 / VP-LOGIN-005 ユーザーID未入力時に入力エラーを表示する', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('ユーザーID').fill('');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('ユーザーIDを入力してください。')).toBeVisible();
  });

  test('TC-LOGIN-010-01 / VP-LOGIN-010 無効化ユーザーがログインできない', async ({ page, request }) => {
    const admin = await loginByApi(request);
    const userId = uniqueId('tc-login-010');
    await createUserByApi(request, admin.token, { userId });
    await disableUserByApi(request, admin.token, userId);

    await page.goto('/');
    await page.getByLabel('ユーザーID').fill(userId);
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(page.getByText('ユーザーIDまたはパスワードが正しくありません。')).toBeVisible();
  });

  test('TC-LOGOUT-001-01 / VP-LOGOUT-001 ログアウトできる', async ({ page }) => {
    await loginByUi(page);
    await logoutByUi(page);
  });

  test('TC-COMMON-API-001-01 / VP-COMMON-API-001 未認証時に401を返す', async ({ request }) => {
    const response = await request.get(`${API_BASE}/todos`);

    expect(response.status()).toBe(401);
  });
});
