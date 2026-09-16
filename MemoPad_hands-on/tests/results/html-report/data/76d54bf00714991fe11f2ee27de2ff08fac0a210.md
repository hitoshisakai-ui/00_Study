# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: viewpoint-table.spec.ts >> MemoPad viewpoint-table mapped Playwright tests >> TC-MEMO-LIST-006-01 / VP-MEMO-LIST-006 長いタイトルや本文でも一覧表示が崩れない
- Location: tests\test-cases\viewpoint-table.spec.ts:211:7

# Error details

```
Error: create memo API status

expect(received).toBe(expected) // Object.is equality

Expected: 201
Received: 400
```

# Test source

```ts
  1   | ﻿import { mkdirSync } from 'node:fs';
  2   | import { join } from 'node:path';
  3   | import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
  4   | 
  5   | const API_BASE = 'http://localhost:3001/api';
  6   | const ADMIN = { userId: 'admin', password: 'password123' };
  7   | 
  8   | test.use({ baseURL: 'http://localhost:5173' });
  9   | const SCREENSHOT_DIR = join(process.cwd(), 'tests', 'results', 'screenshots');
  10  | 
  11  | function testCaseId(title: string) {
  12  |   return title.match(/TC-[A-Z-]+-\d{3}-\d{2}/)?.[0] ?? title.replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 80);
  13  | }
  14  | 
  15  | type MemoPayload = {
  16  |   title: string;
  17  |   body: string;
  18  |   tags?: string;
  19  |   attachments?: UploadPayload[];
  20  |   images?: UploadPayload[];
  21  | };
  22  | 
  23  | type UploadPayload = {
  24  |   name: string;
  25  |   type: string;
  26  |   size: number;
  27  |   content: string;
  28  | };
  29  | 
  30  | async function loginByApi(request: APIRequestContext, user = ADMIN) {
  31  |   const response = await request.post(`${API_BASE}/login`, { data: user });
  32  |   expect(response.status(), 'login API status').toBe(200);
  33  |   const data = await response.json();
  34  |   return data.token as string;
  35  | }
  36  | 
  37  | async function loginByUi(page: Page, user = ADMIN) {
  38  |   await page.goto('/login');
  39  |   await page.getByLabel('ユーザーID').fill(user.userId);
  40  |   await page.getByLabel('パスワード').fill(user.password);
  41  |   await page.getByRole('button', { name: 'ログイン' }).click();
  42  |   await expect(page.getByRole('heading', { name: 'MemoPad' })).toBeVisible();
  43  | }
  44  | 
  45  | async function openLoggedInPage(page: Page, request: APIRequestContext) {
  46  |   const token = await loginByApi(request);
  47  |   await page.goto('/login');
  48  |   await page.evaluate((value) => localStorage.setItem('memoPadToken', value), token);
  49  |   await page.reload();
  50  |   await expect(page.getByRole('heading', { name: 'MemoPad' })).toBeVisible();
  51  | }
  52  | 
  53  | async function createMemo(request: APIRequestContext, token: string, payload: MemoPayload) {
  54  |   const response = await request.post(`${API_BASE}/todos`, {
  55  |     headers: { Authorization: `Bearer ${token}` },
  56  |     data: {
  57  |       title: payload.title,
  58  |       body: payload.body,
  59  |       tags: payload.tags ?? '',
  60  |       attachments: payload.attachments ?? [],
  61  |       images: payload.images ?? [],
  62  |     },
  63  |   });
> 64  |   expect(response.status(), 'create memo API status').toBe(201);
      |                                                       ^ Error: create memo API status
  65  |   return response.json();
  66  | }
  67  | 
  68  | async function deleteMemo(request: APIRequestContext, token: string, id: number) {
  69  |   await request.delete(`${API_BASE}/todos/${id}`, {
  70  |     headers: { Authorization: `Bearer ${token}` },
  71  |   });
  72  | }
  73  | 
  74  | async function listMemos(request: APIRequestContext, token: string, query = '') {
  75  |   const response = await request.get(`${API_BASE}/todos${query}`, {
  76  |     headers: { Authorization: `Bearer ${token}` },
  77  |   });
  78  |   expect(response.ok(), 'list memos API status').toBeTruthy();
  79  |   return response.json();
  80  | }
  81  | 
  82  | async function createUser(
  83  |   request: APIRequestContext,
  84  |   token: string,
  85  |   payload: { userId: string; displayName?: string; email?: string; password?: string; role?: 'admin' | 'user' },
  86  | ) {
  87  |   const response = await request.post(`${API_BASE}/users`, {
  88  |     headers: { Authorization: `Bearer ${token}` },
  89  |     data: {
  90  |       userId: payload.userId,
  91  |       displayName: payload.displayName ?? payload.userId,
  92  |       email: payload.email ?? `${payload.userId}@example.test`,
  93  |       password: payload.password ?? 'password123',
  94  |       role: payload.role ?? 'user',
  95  |     },
  96  |   });
  97  |   expect(response.status(), 'create user API status').toBe(201);
  98  |   return response.json();
  99  | }
  100 | 
  101 | async function disableUser(request: APIRequestContext, token: string, id: number) {
  102 |   const response = await request.patch(`${API_BASE}/users/${id}/disable`, {
  103 |     headers: { Authorization: `Bearer ${token}` },
  104 |   });
  105 |   expect(response.ok(), 'disable user API status').toBeTruthy();
  106 |   return response.json();
  107 | }
  108 | 
  109 | function unique(prefix: string) {
  110 |   return `${prefix}-${Date.now()}-${test.info().parallelIndex}`;
  111 | }
  112 | 
  113 | function uploadFile(name: string, type: string, content: string): UploadPayload {
  114 |   const base64 = Buffer.from(content).toString('base64');
  115 |   return {
  116 |     name,
  117 |     type,
  118 |     size: Buffer.byteLength(content),
  119 |     content: `data:${type};base64,${base64}`,
  120 |   };
  121 | }
  122 | 
  123 | test.describe('MemoPad viewpoint-table mapped Playwright tests', () => {
  124 |   test.afterEach(async ({ page }, testInfo) => {
  125 |     mkdirSync(SCREENSHOT_DIR, { recursive: true });
  126 |     const id = testCaseId(testInfo.title);
  127 |     const project = testInfo.project.name.replace(/[^a-zA-Z0-9_-]+/g, '-');
  128 |     await page.screenshot({
  129 |       path: join(SCREENSHOT_DIR, `${id}-${project}.png`),
  130 |       fullPage: true,
  131 |     });
  132 |   });
  133 | 
  134 |   test('TC-LOGIN-001-01 / VP-LOGIN-001 正しいユーザーID・パスワードでログインできる', async ({ page }) => {
  135 |     await loginByUi(page);
  136 |     await expect(page.getByText('ログインしました。')).toBeVisible();
  137 |   });
  138 | 
  139 |   test('TC-LOGIN-003-01 / VP-LOGIN-003 誤った認証情報でログインできない', async ({ page }) => {
  140 |     await page.goto('/login');
  141 |     await page.getByLabel('ユーザーID').fill('admin');
  142 |     await page.getByLabel('パスワード').fill('wrong-password');
  143 |     await page.getByRole('button', { name: 'ログイン' }).click();
  144 |     await expect(page.getByText('ユーザーIDまたはパスワードが正しくありません。')).toBeVisible();
  145 |   });
  146 | 
  147 |   test('TC-LOGIN-005-01 / VP-LOGIN-005 ユーザーID未入力時に入力エラーを表示する', async ({ page }) => {
  148 |     await page.goto('/login');
  149 |     await page.getByLabel('ユーザーID').fill('');
  150 |     await page.getByLabel('パスワード').fill('password123');
  151 |     await page.getByRole('button', { name: 'ログイン' }).click();
  152 |     await expect(page.getByText('ユーザーIDを入力してください。')).toBeVisible();
  153 |   });
  154 | 
  155 |   test('TC-LOGOUT-001-01 / VP-LOGOUT-001 ログアウトできる', async ({ page }) => {
  156 |     await loginByUi(page);
  157 |     await page.getByRole('button', { name: 'ログアウト' }).click();
  158 |     await expect(page.getByRole('heading', { name: 'MemoPad ログイン' })).toBeVisible();
  159 |   });
  160 | 
  161 |   test('TC-MEMO-CREATE-001-01 / VP-MEMO-CREATE-001 タイトルと本文を入力してメモを登録できる', async ({ page, request }) => {
  162 |     const title = unique('TC-MEMO-CREATE-001');
  163 |     await openLoggedInPage(page, request);
  164 | 
```