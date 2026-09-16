import { APIRequestContext, expect } from '@playwright/test';

export const API_BASE = 'http://localhost:3001/api';

export type UserRole = 'admin' | 'user';

export async function loginByApi(request: APIRequestContext, userId = 'admin', password = 'password123') {
  const response = await request.post(`${API_BASE}/login`, {
    data: { userId, password },
  });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return { token: data.token as string, user: data.user };
}

export async function createUserByApi(
  request: APIRequestContext,
  token: string,
  values: { userId: string; displayName?: string; email?: string; password?: string; role?: UserRole },
) {
  const response = await request.post(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      userId: values.userId,
      displayName: values.displayName ?? values.userId,
      email: values.email ?? `${values.userId}@example.com`,
      password: values.password ?? 'password123',
      role: values.role ?? 'user',
    },
  });
  expect(response.status()).toBe(201);
  return response.json();
}

export async function disableUserByApi(request: APIRequestContext, token: string, userId: string) {
  const usersResponse = await request.get(`${API_BASE}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(usersResponse.ok()).toBeTruthy();
  const users = await usersResponse.json();
  const user = users.find((item: { userId: string }) => item.userId === userId);
  expect(user).toBeTruthy();

  const response = await request.patch(`${API_BASE}/users/${user.id}/disable`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBeTruthy();
}

export async function createMemoByApi(
  request: APIRequestContext,
  token: string,
  values: { title: string; body?: string; tags?: string; attachments?: unknown[]; images?: unknown[] },
) {
  const response = await request.post(`${API_BASE}/todos`, {
    headers: { Authorization: `Bearer ${token}` },
    data: {
      title: values.title,
      body: values.body ?? 'Playwright test body',
      tags: values.tags ?? '',
      attachments: values.attachments ?? [],
      images: values.images ?? [],
    },
  });
  expect(response.status()).toBe(201);
  return response.json();
}

export function uniqueId(prefix: string) {
  const safePrefix = prefix.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${safePrefix}-${suffix}`.slice(0, 20);
}

