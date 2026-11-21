import { fileURLToPath } from 'node:url';

import { expect, test as playwrightTest } from '@playwright/test';

import type { Locator, Page, Request } from '@playwright/test';

const names = {
  bun: 'Булка «Орбита»',
  main: 'Котлета «Гравитация»',
  sauce: 'Соус «Комета»',
};
const orderIngredients = ['orbital-bun', 'gravity-patty', 'comet-sauce', 'orbital-bun'];
const accessToken = 'Bearer stellar-e2e-access';
const refreshToken = 'stellar-e2e-refresh';

// Все запросы API обслуживаются HAR. Любой отсутствующий ответ завершит тест ошибкой.
const test = playwrightTest.extend<{ apiRequests: Request[] }>({
  apiRequests: [
    async ({ page }, use): Promise<void> => {
      const requests: Request[] = [];
      const failedRequests: string[] = [];
      page.on('request', (request) => {
        if (request.url().startsWith('https://norma.ffapi.ru/api/'))
          requests.push(request);
      });
      page.on('requestfailed', (request) => {
        if (request.url().startsWith('https://norma.ffapi.ru/api/')) {
          failedRequests.push(`${request.method()} ${request.url()}`);
        }
      });
      await page.routeFromHAR(
        fileURLToPath(new URL('./hars/constructor.har', import.meta.url)),
        {
          url: '**/api/**',
          notFound: 'abort',
        }
      );
      await use(requests);
      expect(
        failedRequests,
        'Для каждого запроса API должен существовать HAR-ответ'
      ).toEqual([]);
    },
    { auto: true },
  ],
});

const constructor = (page: Page): Locator =>
  page.getByRole('region', { name: 'Конструктор бургера' });

const ingredientCard = (page: Page, name: string): Locator =>
  page
    .getByRole('listitem')
    .filter({ has: page.getByRole('link', { name, exact: false }) });

const add = async (page: Page, name: string): Promise<void> => {
  await ingredientCard(page, name)
    .getByRole('button', { name: 'Добавить', exact: true })
    .click();
};

const assemble = async (page: Page): Promise<void> => {
  await add(page, names.bun);
  await add(page, names.main);
  await add(page, names.sauce);
};

const expectEmptyConstructor = async (page: Page): Promise<void> => {
  const burger = constructor(page);
  await expect(burger.getByText('Выберите булки', { exact: true })).toHaveCount(2);
  await expect(burger.getByText('Выберите начинку', { exact: true })).toBeVisible();
  for (const name of Object.values(names)) {
    await expect(burger.getByText(name, { exact: true })).toHaveCount(0);
  }
};

test.describe('Конструктор: выбор ингредиентов', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('булка появляется сверху и снизу, начинка и соус — между ними', async ({
    page,
  }) => {
    await expectEmptyConstructor(page);
    await assemble(page);
    const burger = constructor(page);

    await expect(burger.getByText(`${names.bun} (верх)`, { exact: true })).toBeVisible();
    await expect(burger.getByText(`${names.bun} (низ)`, { exact: true })).toBeVisible();
    await expect(burger.getByText(names.main, { exact: true })).toBeVisible();
    await expect(burger.getByText(names.sauce, { exact: true })).toBeVisible();
    await expect(burger.getByText('485', { exact: true })).toBeVisible();
    await expect(burger.getByText('Выберите начинку')).toHaveCount(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('повторное добавление начинки создаёт два отдельных слоя', async ({ page }) => {
    await add(page, names.main);
    await add(page, names.main);
    await expect(constructor(page).getByText(names.main, { exact: true })).toHaveCount(
      2
    );
    await expect(constructor(page).getByText('460', { exact: true })).toBeVisible();
  });
});

test.describe('Модальное окно ингредиента', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: names.main, exact: false }).click();
    await expect(page.getByRole('dialog', { name: 'Детали ингредиента' })).toBeVisible();
  });

  test('содержимое соответствует выбранной котлете, а не соседнему ингредиенту', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog', { name: 'Детали ингредиента' });
    await expect(
      dialog.getByRole('heading', { name: names.main, exact: true })
    ).toBeVisible();
    await expect(
      dialog.getByRole('heading', { name: names.bun, exact: true })
    ).toHaveCount(0);
    await expect(page).toHaveURL('/ingredients/gravity-patty');
    const nutrients = [
      ['Калории, ккал', '317'],
      ['Белки, г', '29'],
      ['Жиры, г', '21'],
      ['Углеводы, г', '4'],
    ];
    for (const [label, value] of nutrients) {
      const row = dialog.getByRole('listitem').filter({ hasText: label });
      await expect(row.getByText(value, { exact: true })).toBeVisible();
    }
  });

  test('крестик закрывает окно и возвращает на страницу конструктора', async ({
    page,
  }) => {
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Закрыть', exact: true })
      .click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL('/');
    await expect(constructor(page)).toBeVisible();
  });

  test('нажатие на оверлей закрывает окно', async ({ page }) => {
    await page.getByTestId('modal-overlay').click({ position: { x: 8, y: 8 } });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('Escape закрывает окно', async ({ page }) => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });

  test('после обновления страницы окно остаётся открытым и закрывается крестиком', async ({
    page,
  }) => {
    await page.reload();
    const dialog = page.getByRole('dialog', { name: 'Детали ингредиента' });
    await expect(
      dialog.getByRole('heading', { name: names.main, exact: true })
    ).toBeVisible();
    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL('/');
  });
});

test.describe('Оформление заказа', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addCookies([
      { name: 'accessToken', value: accessToken, url: 'http://127.0.0.1:4000' },
    ]);
    await context.addInitScript((token: string) => {
      localStorage.setItem('refreshToken', token);
    }, refreshToken);
    await page.goto('/');
    // Имя пользователя подтверждает восстановление сессии из HAR до оформления заказа.
    await expect(
      page.getByRole('link', { name: 'Орбитальный испытатель' })
    ).toBeVisible();
  });

  test('отправляет состав и токен, показывает верный номер и очищает конструктор', async ({
    page,
    apiRequests,
  }) => {
    await assemble(page);
    await constructor(page)
      .getByRole('button', { name: 'Оформить заказ', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Информация о заказе' });
    await expect(dialog.getByText('73142', { exact: true })).toBeVisible();
    await expect(
      dialog.getByText('идентификатор заказа', { exact: true })
    ).toBeVisible();
    await expectEmptyConstructor(page);

    const orderRequests = apiRequests.filter((request) => request.method() === 'POST');
    expect(orderRequests).toHaveLength(1);
    expect(orderRequests[0].postDataJSON()).toEqual({ ingredients: orderIngredients });
    expect(orderRequests[0].headers().authorization).toBe(accessToken);
    expect(apiRequests.some((request) => request.url().endsWith('/auth/user'))).toBe(
      true
    );
    expect(apiRequests.some((request) => request.url().endsWith('/orders/all'))).toBe(
      false
    );

    await dialog.getByRole('button', { name: 'Закрыть', exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expectEmptyConstructor(page);
  });

  test('ошибка сервера видна пользователю, выбранные ингредиенты сохраняются', async ({
    page,
    apiRequests,
  }) => {
    await page.routeFromHAR(
      fileURLToPath(new URL('./hars/order-error.har', import.meta.url)),
      {
        url: '**/api/orders',
        notFound: 'abort',
      }
    );
    await assemble(page);
    await constructor(page)
      .getByRole('button', { name: 'Оформить заказ', exact: true })
      .click();

    await expect(constructor(page).getByRole('alert')).toHaveText(
      'Кухня временно недоступна'
    );
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(
      constructor(page).getByText(`${names.bun} (верх)`, { exact: true })
    ).toBeVisible();
    await expect(
      constructor(page).getByText(`${names.bun} (низ)`, { exact: true })
    ).toBeVisible();
    await expect(constructor(page).getByText(names.main, { exact: true })).toBeVisible();
    await expect(
      constructor(page).getByText(names.sauce, { exact: true })
    ).toBeVisible();
    await expect(constructor(page).getByText('485', { exact: true })).toBeVisible();
    await expect(
      constructor(page).getByRole('button', { name: 'Оформить заказ' })
    ).toBeEnabled();
    expect(apiRequests.filter((request) => request.method() === 'POST')).toHaveLength(1);
  });
});

test.describe('Оформление без авторизации', () => {
  test('гость переходит на вход, запрос заказа не отправляется', async ({
    page,
    apiRequests,
  }) => {
    await page.goto('/');
    await assemble(page);
    await constructor(page)
      .getByRole('button', { name: 'Оформить заказ', exact: true })
      .click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
    expect(apiRequests.filter((request) => request.method() === 'POST')).toHaveLength(0);
  });
});
