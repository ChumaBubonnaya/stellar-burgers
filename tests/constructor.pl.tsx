import { expect, test } from '@playwright/test';

import { addBurger, login, setupApi } from './api';

test('булка заменяется, добавленные ингредиенты учитываются в цене и счётчиках', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/');
  await addBurger(page);
  const builder = page.getByRole('region', { name: 'Конструктор бургера' });
  await expect(builder.getByText('275', { exact: true })).toBeVisible();
  await expect(
    page.locator('a[href="/ingredients/bun-one"]').getByText('2', { exact: true })
  ).toBeVisible();
  await page
    .locator('li')
    .filter({ has: page.locator('a[href="/ingredients/bun-two"]') })
    .getByRole('button', { name: 'Добавить' })
    .click();
  await expect(builder.getByText('375', { exact: true })).toBeVisible();
  await expect(builder.getByText('Другая булка (верх)')).toBeVisible();
  await expect(builder.getByText('Другая булка (низ)')).toBeVisible();
});

test('ингредиент открывается модально, Escape и кнопка возвращают на главную', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/');
  await page.locator('a[href="/ingredients/bun-one"]').click();
  await expect(page).toHaveURL(/\/ingredients\/bun-one$/);
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('http://localhost:4000/');
  await page.locator('a[href="/ingredients/main-one"]').click();
  await page.getByRole('button', { name: 'Закрыть' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('прямой URL и перезагрузка открывают отдельную страницу ингредиента', async ({
  page,
}) => {
  await setupApi(page);
  await page.goto('/ingredients/bun-one');
  await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goto('/');
  await page.locator('a[href="/ingredients/bun-one"]').click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Детали ингредиента' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('гостю нужен вход; после него бургер сохраняется и заказ содержит токен и две булки', async ({
  page,
}) => {
  const api = await setupApi(page);
  await page.goto('/');
  await addBurger(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await expect(page).toHaveURL('http://localhost:4000/');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByRole('dialog').getByText('42', { exact: true })).toBeVisible();
  expect(api.submitted).toEqual([
    {
      ingredients: ['bun-one', 'main-one', 'sauce-one', 'bun-one'],
      authorization: 'Bearer test',
    },
  ]);
  await page.getByRole('button', { name: 'Закрыть' }).click();
  const builder = page.getByRole('region', { name: 'Конструктор бургера' });
  await expect(builder.getByText('0', { exact: true })).toBeVisible();
  await expect(builder.getByText('Выберите начинку')).toBeVisible();
});

test('ошибка заказа сохраняет конструктор и позволяет повторить запрос', async ({
  page,
}) => {
  const api = await setupApi(page, true);
  api.failOrder = true;
  await page.goto('/');
  await addBurger(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByRole('alert')).toContainText('Не удалось оформить заказ');
  await expect(
    page
      .getByRole('region', { name: 'Конструктор бургера' })
      .getByText('275', { exact: true })
  ).toBeVisible();
  api.failOrder = false;
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByRole('dialog').getByText('42', { exact: true })).toBeVisible();
});

test('ошибка каталога показывает повтор загрузки', async ({ page }) => {
  const api = await setupApi(page);
  api.failCatalog = true;
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Каталог недоступен');
  api.failCatalog = false;
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.getByRole('heading', { name: 'Соберите бургер' })).toBeVisible();
});

test('начинки можно переставлять и удалять по отдельности', async ({ page }) => {
  await setupApi(page);
  await page.goto('/');
  await addBurger(page);
  const builder = page.getByRole('region', { name: 'Конструктор бургера' });
  const items = builder.locator('ul > li');
  await items
    .first()
    .getByRole('button', { name: 'Переместить ингредиент вниз' })
    .click();
  await expect(items.first()).toContainText('Тестовый соус');
  await expect(items.last()).toContainText('Тестовая начинка');
  await items.last().locator('.constructor-element__action svg').click();
  await expect(items).toHaveCount(1);
  await expect(builder.getByText('225', { exact: true })).toBeVisible();
  await expect(
    page.locator('a[href="/ingredients/main-one"]').getByText('1', { exact: true })
  ).toHaveCount(0);
});
