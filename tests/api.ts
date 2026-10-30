import ingredients from './fixtures/ingredients.json' with { type: 'json' };

import type { Page } from '@playwright/test';
import type { TOrder } from '../src/utils/types';

export const sampleOrder: TOrder = {
  _id: 'order-one',
  number: 42,
  name: 'Космический бургер',
  status: 'done',
  ingredients: ['bun-one', 'main-one', 'sauce-one', 'bun-one'],
  createdAt: '2026-10-30T08:00:00.000Z',
  updatedAt: '2026-10-30T08:00:00.000Z',
};

export const setupApi = async (page: Page, authenticated = false) => {
  const state = {
    user: { name: 'Покупатель', email: 'buyer@example.com' },
    submitted: [] as { ingredients: string[]; authorization: string | undefined }[],
    feedLoads: 0,
    historyLoads: 0,
    refreshes: 0,
    failOrder: false,
    failCatalog: false,
    expireUser: false,
    failLogin: false,
    profileBody: null as Record<string, string> | null,
    history: [sampleOrder],
  };
  if (authenticated) {
    await page
      .context()
      .addCookies([
        { name: 'accessToken', value: 'Bearer test', url: 'http://localhost:4000' },
      ]);
    await page.addInitScript(() => localStorage.setItem('refreshToken', 'refresh-test'));
  }
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const pathname = new URL(request.url()).pathname.replace('/api', '');
    const fulfill = async (body: unknown, status = 200): Promise<void> => {
      await route.fulfill({ status, json: body });
    };
    if (pathname === '/ingredients')
      return fulfill(
        state.failCatalog
          ? { success: false, message: 'Каталог недоступен' }
          : { success: true, data: ingredients }
      );
    if (pathname === '/auth/token') {
      state.refreshes++;
      return fulfill({
        success: true,
        accessToken: 'Bearer fresh',
        refreshToken: 'refresh-new',
      });
    }
    if (pathname === '/auth/user') {
      if (state.expireUser) {
        state.expireUser = false;
        return fulfill({ success: false, message: 'jwt expired' }, 403);
      }
      if (request.method() === 'PATCH') {
        const data = request.postDataJSON() as Record<string, string>;
        state.profileBody = data;
        state.user = { name: data.name, email: data.email };
      }
      return fulfill({ success: true, user: state.user });
    }
    if (pathname === '/auth/login' || pathname === '/auth/register') {
      if (state.failLogin)
        return fulfill({ success: false, message: 'Неверный пароль' }, 401);
      if (pathname === '/auth/register') {
        const data = request.postDataJSON() as { name: string; email: string };
        state.user = { name: data.name, email: data.email };
      }
      return fulfill({
        success: true,
        user: state.user,
        accessToken: 'Bearer test',
        refreshToken: 'refresh-test',
      });
    }
    if (pathname === '/auth/logout' || pathname.startsWith('/password-reset'))
      return fulfill({ success: true });
    if (pathname === '/orders/all') {
      state.feedLoads++;
      return fulfill({
        success: true,
        orders: state.history,
        total: 100,
        totalToday: 7,
      });
    }
    if (pathname === '/orders' && request.method() === 'POST') {
      state.submitted.push({
        ...(request.postDataJSON() as { ingredients: string[] }),
        authorization: request.headers().authorization,
      });
      if (state.failOrder)
        return fulfill({ success: false, message: 'Не удалось оформить заказ' }, 500);
      return fulfill({ success: true, name: sampleOrder.name, order: sampleOrder });
    }
    if (pathname === '/orders') {
      state.historyLoads++;
      return fulfill({ success: true, orders: state.history });
    }
    if (pathname === '/orders/42')
      return fulfill({ success: true, orders: [sampleOrder] });
    return fulfill({ success: true, orders: [] });
  });
  return state;
};

export const addBurger = async (page: Page): Promise<void> => {
  for (const id of ['bun-one', 'main-one', 'sauce-one']) {
    await page
      .locator('li')
      .filter({ has: page.locator(`a[href="/ingredients/${id}"]`) })
      .getByRole('button', { name: 'Добавить', exact: true })
      .click();
  }
};

export const login = async (page: Page): Promise<void> => {
  await page.locator('input[name="email"]').fill('buyer@example.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
};
