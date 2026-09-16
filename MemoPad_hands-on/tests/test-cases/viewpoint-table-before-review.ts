import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api';
const ADMIN = { userId: 'admin', password: 'password123' };

test.use({ baseURL: 'http://localhost:5173' });
const SCREENSHOT_DIR = join(process.cwd(), 'tests', 'results', 'screenshots');

function testCaseId(title: string) {
  return title.match(/TC-[A-Z-]+-\d{3}-\d{2}/)?.[0] ?? title.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80);
}

type MemoPayload = {
  title: string;
  body: string;
  tags?: string;
  attachments?: UploadPayload[];
  images?: UploadPayload[];
};

type UploadPayload = {
  name: string;
  type: string;
  size: number;
  content: string;
};

async function loginByApi(request: APIRequestContext, user = ADMIN) {
  const response = await request.post(`${API_BASE}/login`, { data: user });
  expect(response.status(), 'login API status').toBe(200);
  const data = await response.json();
  return data.token as string;
}

async function loginByUi(page: Page, user = ADMIN) {
  await page.goto('/login');
  await page.getByLabel('ユーザーID').fill(user.userId);
  await page.getByLabel('パスワード').fill(user.password);
  await page.getByRole('button', { name: 'ログイン' }).click();
  await expect(page.getByRole('heading', { name: 'MemoPad' })).toBeVisible();
}

async function openLoggedInPage(page: Page, request: APIRequestContext) {
  const token = await loginByApi(request);
  await page.goto('/login');
  await page.evaluate((value) => localStorage.setItem('memoPadToken', value), token);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'MemoPad' })).toBeVisible();
}

async function createMemo(request: APIRequestContext, token: string, payload: MemoPayload) {
  const response = await request.post(`${API_BASE}/todos`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: payload.title,
      body: payload.body,
      tags: payload.tags ?? '',
      attachments: payload.attachments ?? [],
      images: payload.images ?? [],
    },
  });
  expect(response.status(), 'create memo API status').toBe(201);
  return response.json();
}

async function deleteMemo(request: APIRequestContext, token: string, id: number) {
  await request.delete(`${API_BASE}/todos/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

async function listMemos(request: APIRequestContext, token: string, query = '') {
  const response = await request.get(`${API_BASE}/todos${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok(), 'list memos API status').toBeTruthy();
  return response.json();
}

function unique(prefix: string) {
  return `${prefix}-${Date.now()}-${test.info().parallelIndex}`;
}

function uploadFile(name: string, type: string, content: string): UploadPayload {
  const base64 = Buffer.from(content).toString('base64');
  return {
    name,
    type,
    size: Buffer.byteLength(content),
    content: `data:${type};base64,${base64}`,
  };
}

test.describe('MemoPad viewpoint-table mapped Playwright tests', () => {
  test.afterEach(async ({ page }, testInfo) => {
    mkdirSync(SCREENSHOT_DIR, { recursive: true });
    const id = testCaseId(testInfo.title);
    const project = testInfo.project.name.replace(/[^a-zA-Z0-9_-]+/g, '-');
    await page.screenshot({
      path: join(SCREENSHOT_DIR, `${id}-${project}.png`),
      fullPage: true,
    });
  });

  test('TC-LOGIN-001-01 / VP-LOGIN-001 正しいユーザーID・パスワードでログインできる', async ({ page }) => {
    await loginByUi(page);
    await expect(page.getByText('ログインしました。')).toBeVisible();
  });

  test('TC-LOGIN-003-01 / VP-LOGIN-003 誤った認証情報でログインできない', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('ユーザーID').fill('admin');
    await page.getByLabel('パスワード').fill('wrong-password');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByText('ユーザーIDまたはパスワードが正しくありません。')).toBeVisible();
  });

  test('TC-LOGIN-005-01 / VP-LOGIN-005 ユーザーID未入力時に入力エラーを表示する', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('ユーザーID').fill('');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page.getByText('ユーザーIDを入力してください。')).toBeVisible();
  });

  test('TC-LOGOUT-001-01 / VP-LOGOUT-001 ログアウトできる', async ({ page }) => {
    await loginByUi(page);
    await page.getByRole('button', { name: 'ログアウト' }).click();
    await expect(page.getByRole('heading', { name: 'MemoPad ログイン' })).toBeVisible();
  });

  test('TC-MEMO-CREATE-001-01 / VP-MEMO-CREATE-001 タイトルと本文を入力してメモを登録できる', async ({ page, request }) => {
    const title = unique('TC-MEMO-CREATE-001');
    await openLoggedInPage(page, request);

    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('メモ本文の登録テストです。');
    await page.getByRole('button', { name: '登録' }).click();

    await expect(page.getByText('メモを登録しました。')).toBeVisible();
    await expect(page.getByText(title)).toBeVisible();
  });

  test('TC-MEMO-CREATE-004-01 / VP-MEMO-CREATE-004 タイトル100文字ちょうどで登録できる', async ({ page, request }) => {
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill('あ'.repeat(100));
    await page.getByLabel('本文').fill(unique('本文'));
    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText('メモを登録しました。')).toBeVisible();
  });

  test('TC-MEMO-CREATE-005-01 / VP-MEMO-CREATE-005 タイトル101文字で登録できない', async ({ page, request }) => {
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill('あ'.repeat(101));
    await page.getByLabel('本文').fill('本文あり');
    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText('タイトルは100文字以内で入力してください。')).toBeVisible();
    await expect(page.getByLabel('タイトル')).toHaveValue('あ'.repeat(101));
  });

  test('TC-MEMO-CREATE-007-01 / VP-MEMO-CREATE-007 本文2001文字で登録できない', async ({ page, request }) => {
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(unique('TC-MEMO-CREATE-007'));
    await page.getByLabel('本文').fill('あ'.repeat(2001));
    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText('本文は2000文字以内で入力してください。')).toBeVisible();
  });

  test('TC-MEMO-CREATE-008-01 / VP-MEMO-CREATE-008 タイトル未入力時に登録できない', async ({ page, request }) => {
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill('   ');
    await page.getByLabel('本文').fill('本文あり');
    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText('タイトルを入力してください。')).toBeVisible();
  });

  test('TC-MEMO-DETAIL-001-01 / VP-MEMO-DETAIL-001 メモ詳細にタイトル・本文・日時を表示する', async ({ page, request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-MEMO-DETAIL-001');
    const memo = await createMemo(request, token, { title, body: '詳細表示の本文です。' });
    await openLoggedInPage(page, request);

    await page.getByText(title).locator('..').locator('..').getByRole('button', { name: '詳細' }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.getByText('詳細表示の本文です。')).toBeVisible();
    await expect(page.getByText('作成日時')).toBeVisible();
    await expect(page.getByText('更新日時')).toBeVisible();

    await deleteMemo(request, token, memo.id);
  });

  test('TC-MEMO-DETAIL-003-01 / VP-MEMO-DETAIL-003 存在しないメモIDは404を返す', async ({ request }) => {
    const token = await loginByApi(request);
    const response = await request.get(`${API_BASE}/todos/999999999`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(404);
  });

  test('TC-MEMO-EDIT-002-01 / VP-MEMO-EDIT-002 タイトルと本文を更新できる', async ({ page, request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-MEMO-EDIT-002');
    const updatedTitle = `${title}-updated`;
    const memo = await createMemo(request, token, { title, body: '更新前本文' });
    await openLoggedInPage(page, request);

    await page.getByText(title).locator('..').locator('..').getByRole('button', { name: '編集' }).click();
    await page.getByLabel('タイトル').fill(updatedTitle);
    await page.getByLabel('本文').fill('更新後本文');
    await page.getByRole('button', { name: '更新' }).click();

    await expect(page.getByText('メモを更新しました。')).toBeVisible();
    await expect(page.getByText(updatedTitle)).toBeVisible();
    const updated = await request.get(`${API_BASE}/todos/${memo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await updated.json();
    expect(body.title).toBe(updatedTitle);
    expect(body.body).toBe('更新後本文');

    await deleteMemo(request, token, memo.id);
  });

  test('TC-MEMO-DELETE-003-01 / VP-MEMO-DELETE-003 メモを削除すると一覧に表示されない', async ({ page, request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-MEMO-DELETE-003');
    const memo = await createMemo(request, token, { title, body: '削除対象本文' });
    await openLoggedInPage(page, request);

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByText(title).locator('..').locator('..').getByRole('button', { name: '削除' }).click();
    await expect(page.getByText('メモを削除しました。')).toBeVisible();
    await expect(page.getByText(title)).toHaveCount(0);

    const response = await request.get(`${API_BASE}/todos/${memo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(404);
  });

  test('TC-MEMO-DELETE-005-01 / VP-MEMO-DELETE-005 削除キャンセル時にメモが削除されない', async ({ page, request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-MEMO-DELETE-005');
    const memo = await createMemo(request, token, { title, body: '削除キャンセル本文' });
    await openLoggedInPage(page, request);

    page.once('dialog', (dialog) => dialog.dismiss());
    await page.getByText(title).locator('..').locator('..').getByRole('button', { name: '削除' }).click();
    await expect(page.getByText(title)).toBeVisible();

    const response = await request.get(`${API_BASE}/todos/${memo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);

    await deleteMemo(request, token, memo.id);
  });

  test('TC-SEARCH-001-01 / VP-SEARCH-001 タイトルの部分一致検索ができる', async ({ page, request }) => {
    const token = await loginByApi(request);
    const keyword = unique('SearchTitle');
    const hit = await createMemo(request, token, { title: `${keyword}-hit`, body: '検索対象' });
    const miss = await createMemo(request, token, { title: unique('SearchTitle-miss'), body: '検索対象外' });
    await openLoggedInPage(page, request);

    await page.getByLabel('検索').fill(keyword);
    await expect(page.getByText(`${keyword}-hit`)).toBeVisible();
    await expect(page.getByText(miss.title)).toHaveCount(0);

    await deleteMemo(request, token, hit.id);
    await deleteMemo(request, token, miss.id);
  });

  test('TC-SEARCH-005-01 / VP-SEARCH-005 検索結果0件時の表示を確認する', async ({ page, request }) => {
    await openLoggedInPage(page, request);
    await page.getByLabel('検索').fill(unique('no-match-keyword'));
    await expect(page.getByText('条件に一致するメモがありません。')).toBeVisible();
  });

  test('TC-PAGING-004-01 / VP-PAGING-004 メモ11件時に2ページ目へ移動できる', async ({ page, request }) => {
    const token = await loginByApi(request);
    const prefix = unique('TC-PAGING-004');
    const created = [];
    for (let i = 0; i < 11; i += 1) {
      created.push(await createMemo(request, token, { title: `${prefix}-${String(i).padStart(2, '0')}`, body: 'ページング本文' }));
    }
    await openLoggedInPage(page, request);

    await page.getByLabel('検索').fill(prefix);
    await expect(page.getByText('1 / 2')).toBeVisible();
    await page.getByRole('button', { name: '次へ' }).click();
    await expect(page.getByText('2 / 2')).toBeVisible();

    for (const memo of created) await deleteMemo(request, token, memo.id);
  });

  test('TC-SORT-003-01 / VP-SORT-003 タイトルで並び替えできる', async ({ page, request }) => {
    const token = await loginByApi(request);
    const prefix = unique('TC-SORT-003');
    const a = await createMemo(request, token, { title: `${prefix}-A`, body: 'sort' });
    const b = await createMemo(request, token, { title: `${prefix}-B`, body: 'sort' });
    await openLoggedInPage(page, request);

    await page.getByLabel('検索').fill(prefix);
    await page.getByLabel('並び替え').selectOption('title');
    await page.getByRole('button', { name: '昇順' }).click();
    const titles = await page.locator('.memo-item h2').allTextContents();
    expect(titles.slice(0, 2)).toEqual([`${prefix}-A`, `${prefix}-B`]);

    await deleteMemo(request, token, a.id);
    await deleteMemo(request, token, b.id);
  });

  test('TC-TAG-CREATE-001-01 / VP-TAG-CREATE-001 タグ付きメモを登録できる', async ({ page, request }) => {
    const title = unique('TC-TAG-CREATE-001');
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: '新規作成' }).click();
    await page.getByLabel('タイトル').fill(title);
    await page.getByLabel('本文').fill('タグ付き本文');
    await page.getByLabel('タグ').fill('仕事, 重要');
    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText(title)).toBeVisible();
    await expect(page.getByText('仕事')).toBeVisible();
    await expect(page.getByText('重要')).toBeVisible();
  });

  test('TC-FAVORITE-LIST-001-01 / VP-FAVORITE-LIST-001 お気に入り登録できる', async ({ page, request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-FAVORITE-LIST-001');
    const memo = await createMemo(request, token, { title, body: 'お気に入り本文' });
    await openLoggedInPage(page, request);

    await page.getByText(title).locator('..').locator('..').getByRole('button', { name: 'お気に入り', exact: true }).click();
    await page.getByLabel('お気に入りのみ').check();
    await expect(page.getByText(title)).toBeVisible();

    await deleteMemo(request, token, memo.id);
  });

  test('TC-ATTACHMENT-CREATE-001-01 / VP-ATTACHMENT-CREATE-001 添付ファイル付きメモを登録できる', async ({ request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-ATTACHMENT-CREATE-001');
    const memo = await createMemo(request, token, {
      title,
      body: '添付ファイル本文',
      attachments: [uploadFile('sample.txt', 'text/plain', 'sample attachment')],
    });
    const detail = await request.get(`${API_BASE}/todos/${memo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await detail.json();
    expect(body.attachments[0].originalName).toBe('sample.txt');
    await deleteMemo(request, token, memo.id);
  });

  test('TC-IMAGE-CREATE-001-01 / VP-IMAGE-CREATE-001 画像付きメモを登録できる', async ({ request }) => {
    const token = await loginByApi(request);
    const title = unique('TC-IMAGE-CREATE-001');
    const memo = await createMemo(request, token, {
      title,
      body: '画像本文',
      images: [uploadFile('sample.png', 'image/png', 'fake png content')],
    });
    const detail = await request.get(`${API_BASE}/todos/${memo.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await detail.json();
    expect(body.images[0].originalName).toBe('sample.png');
    await deleteMemo(request, token, memo.id);
  });

  test('TC-USER-LIST-001-01 / VP-USER-LIST-001 管理者がユーザー一覧を表示できる', async ({ page, request }) => {
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: 'ユーザー管理' }).click();
    await expect(page.getByRole('heading', { name: 'ユーザー管理' })).toBeVisible();
    await expect(page.getByText('ユーザーID')).toBeVisible();
    await expect(page.getByText('パスワード')).toHaveCount(0);
  });

  test('TC-USER-CREATE-001-01 / VP-USER-CREATE-001 管理者がユーザーを作成できる', async ({ page, request }) => {
    const userId = unique('user').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 20);
    await openLoggedInPage(page, request);
    await page.getByRole('button', { name: 'ユーザー管理' }).click();
    await page.getByRole('button', { name: 'ユーザー作成' }).click();
    await page.getByLabel('ユーザーID').fill(userId);
    await page.getByLabel('表示名').fill(`表示名 ${userId}`);
    await page.getByLabel('メールアドレス').fill(`${userId}@example.test`);
    await page.getByLabel('パスワード').fill('password123');
    await page.getByLabel('権限').selectOption('user');
    await page.getByRole('button', { name: '登録' }).click();
    await expect(page.getByText('ユーザーを登録しました。')).toBeVisible();
    await expect(page.getByText(userId)).toBeVisible();
  });

  test('TC-COMMON-API-001-01 / VP-COMMON-API-001 未認証時に401を返す', async ({ request }) => {
    const response = await request.get(`${API_BASE}/todos`);
    expect(response.status()).toBe(401);
  });

  test('TC-COMMON-SECURITY-002-01 / VP-COMMON-SECURITY-002 APIレスポンスにパスワード情報を含めない', async ({ request }) => {
    const token = await loginByApi(request);
    const response = await request.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(200);
    const bodyText = JSON.stringify(await response.json()).toLowerCase();
    expect(bodyText).not.toContain('password');
    expect(bodyText).not.toContain('hash');
  });
});


