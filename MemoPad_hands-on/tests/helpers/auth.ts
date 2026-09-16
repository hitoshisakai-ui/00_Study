import { expect, Page } from '@playwright/test';

export async function loginByUi(page: Page, userId = 'admin', password = 'password123') {
  await page.goto('/');
  await page.getByLabel('ユーザーID').fill(userId);
  await page.getByLabel('パスワード').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.getByRole('heading', { name: 'MemoPad' })).toBeVisible();
}

export async function logoutByUi(page: Page) {
  await page.getByRole('button', { name: 'ログアウト' }).click();
  await expect(page.getByRole('heading', { name: 'MemoPad ログイン' })).toBeVisible();
}
