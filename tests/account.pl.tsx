import { expect, test } from '@playwright/test';

import { login, setupApi } from './api';

test('закрытая страница возвращается после входа', async ({ page }) => {
  await setupApi(page);
  await page.goto('/profile/orders');
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await expect(page).toHaveURL(/\/profile\/orders$/);
  await expect(page.getByText('Космический бургер')).toBeVisible();
});

test('профиль отменяет изменения и отправляет новые данные без пустого пароля', async ({
  page,
}) => {
  const api = await setupApi(page, true);
  await page.goto('/profile');
  const name = page.locator('input[name="name"]');
  await expect(name).toHaveValue('Покупатель');
  await expect(page.getByRole('button', { name: 'Сохранить' })).toHaveCount(0);
  await name.fill('Изменено');
  await page.getByRole('button', { name: 'Отменить' }).click();
  await expect(name).toHaveValue('Покупатель');
  await name.fill('Новое имя');
  await page.getByRole('button', { name: 'Сохранить' }).click();
  await expect(page.getByRole('button', { name: 'Сохранить' })).toHaveCount(0);
  expect(api.profileBody).toEqual({ name: 'Новое имя', email: 'buyer@example.com' });
});

test('выход очищает токены, а страница входа закрыта для авторизованного пользователя', async ({
  page,
}) => {
  await setupApi(page, true);
  await page.goto('/login');
  await expect(page).toHaveURL('http://localhost:4000/');
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Выход' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(
    (await page.context().cookies()).find((cookie) => cookie.name === 'accessToken')
  ).toBeUndefined();
  expect(await page.evaluate(() => localStorage.getItem('refreshToken'))).toBeNull();
});

test('истёкший access token автоматически обновляется', async ({ page }) => {
  const api = await setupApi(page, true);
  api.expireUser = true;
  await page.goto('/profile');
  await expect(page.locator('input[name="name"]')).toHaveValue('Покупатель');
  expect(api.refreshes).toBe(1);
});

test('регистрация сохраняет сессию', async ({ page }) => {
  await setupApi(page);
  await page.goto('/register');
  await page.locator('input[name="name"]').fill('Новый пользователь');
  await page.locator('input[name="email"]').fill('new@example.com');
  await page.locator('input[name="password"]').fill('password123');
  await page.getByRole('button', { name: 'Зарегистрироваться', exact: true }).click();
  await expect(page).toHaveURL('http://localhost:4000/');
  await expect(page.getByRole('link', { name: 'Новый пользователь' })).toBeVisible();
});

test('восстановление пароля проходит через письмо и код, прямой reset закрыт', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/reset-password');
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.locator('input[name="email"]').fill('buyer@example.com');
  await page.getByRole('button', { name: 'Восстановить', exact: true }).click();
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.locator('input[name="password"]').fill('newpassword123');
  await page.locator('input[name="token"]').fill('code-from-email');
  await page.getByRole('button', { name: 'Сохранить', exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
});
