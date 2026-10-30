import { expect, test } from '@playwright/test';

import { setupApi } from './api';

test('лента показывает цену, статистику, обновление и модальное окно заказа', async ({
  page,
}) => {
  const api = await setupApi(page);
  await page.goto('/feed');
  await expect(page.getByText('Космический бургер')).toBeVisible();
  await expect(page.getByText('275', { exact: true })).toBeVisible();
  await expect(page.getByText('100', { exact: true })).toBeVisible();
  const previous = api.feedLoads;
  await page.getByRole('button', { name: 'Обновить' }).click();
  await expect.poll(() => api.feedLoads).toBeGreaterThan(previous);
  await page.getByRole('link').filter({ hasText: 'Космический бургер' }).click();
  await expect(page).toHaveURL(/\/feed\/42$/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByText('2 x 100')).toBeVisible();
});

test('заказ доступен по прямому URL, неизвестные заказ и маршрут сообщают об ошибке', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/feed/42');
  await expect(page.getByText('Космический бургер')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/feed/999');
  await expect(page.getByRole('alert')).toContainText('Заказ не найден');
  await page.goto('/unknown-page');
  await expect(page.getByRole('heading', { name: /404/ })).toBeVisible();
});

test('история автоматически обновляет статус заказа', async ({ page }) => {
  const api = await setupApi(page, true);
  await page.clock.install();
  await page.goto('/profile/orders');
  await expect(page.getByText('Выполнен', { exact: true })).toBeVisible();
  api.history = api.history.map((order) => ({ ...order, status: 'pending' }));
  await page.clock.fastForward(10_100);
  await expect(page.getByText('Готовится', { exact: true })).toBeVisible();
});

test('детали заказа в профиле защищены авторизацией', async ({ page }) => {
  await setupApi(page);
  await page.goto('/profile/orders/42');
  await expect(page).toHaveURL(/\/login$/);
});
