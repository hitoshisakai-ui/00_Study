import { test, expect } from '@playwright/test';
import { loginByUi } from '../helpers/auth';

test.describe('メモ管理 / メモ新規作成画面', () => {
  test.beforeEach(async ({ page }) => {
    await loginByUi(page);
  });

  test('TC-MEMO-CREATE-001-01 / VP-MEMO-CREATE-001 タイトルと本文を入力してメモを登録できる', async ({ page }) => {
    const title = `TC-MEMO-CREATE-001-${Date.now()}`;

    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('メモ本文のテストです。');

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/api/todos') &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      ),
      page.getByRole('button', { name: '登録' }).click(),
    ]);

    await expect(page.getByText('メモを登録しました。')).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('TC-MEMO-CREATE-004-01 / VP-MEMO-CREATE-004 タイトル100文字ちょうどで登録できる', async ({ page }) => {
    const title = 'あ'.repeat(100);

    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('本文あり');
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('メモを登録しました。')).toBeVisible();
  });

  test('TC-MEMO-CREATE-005-01 / VP-MEMO-CREATE-005 タイトル101文字で登録できない', async ({ page }) => {
    const title = 'あ'.repeat(101);

    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('本文あり');
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('タイトルは100文字以内で入力してください。')).toBeVisible();
    await expect(page.getByLabel('タイトル')).toHaveValue(title);
  });

  test('TC-MEMO-CREATE-007-01 / VP-MEMO-CREATE-007 本文2001文字で登録できない', async ({ page }) => {
    const body = 'あ'.repeat(2001);

    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill('TC-MEMO-CREATE-007');
    await page.getByLabel('本文').fill(body);
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('本文は2000文字以内で入力してください。')).toBeVisible();
    await expect(page.getByLabel('本文')).toHaveValue(body);
  });
});
