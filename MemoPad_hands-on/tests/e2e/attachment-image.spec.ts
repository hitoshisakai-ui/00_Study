import { test, expect } from '@playwright/test';
import { loginByUi } from '../helpers/auth';

test.describe('Attachment and image upload', () => {
  test.beforeEach(async ({ page }) => {
    await loginByUi(page);
  });

  test('TC-ATTACHMENT-CREATE-001-01 / VP-ATTACHMENT-CREATE-001 create memo with attachment', async ({ page }) => {
    const title = `TC-ATTACHMENT-CREATE-001-${Date.now()}`;

    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('attachment upload test');
    await page.locator('input[type="file"][accept=".pdf,.txt,.csv,.docx,.xlsx"]').setInputFiles({
      name: 'sample.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('sample attachment'),
    });
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('メモを登録しました。')).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('TC-ATTACHMENT-CREATE-004-01 / VP-ATTACHMENT-CREATE-004 reject six attachments', async ({ page }) => {
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill('TC-ATTACHMENT-CREATE-004');
    await page.getByLabel('本文').fill('attachment limit test');
    await page.locator('input[type="file"][accept=".pdf,.txt,.csv,.docx,.xlsx"]').setInputFiles(
      Array.from({ length: 6 }, (_, index) => ({
        name: `sample-${index}.txt`,
        mimeType: 'text/plain',
        buffer: Buffer.from(`sample ${index}`),
      })),
    );
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('添付ファイルは5件以内で選択してください。')).toBeVisible();
  });

  test('TC-IMAGE-CREATE-007-01 / VP-IMAGE-CREATE-007 reject non-image extension', async ({ page }) => {
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill('TC-IMAGE-CREATE-007');
    await page.getByLabel('本文').fill('image extension test');
    await page.locator('input[type="file"][accept=".jpg,.jpeg,.png,.gif,.webp"]').setInputFiles({
      name: 'not-image.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('not image'),
    });
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('アップロードできる画像形式は jpg, jpeg, png, gif, webp です。')).toBeVisible();
  });
});
