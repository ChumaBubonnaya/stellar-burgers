import catalog, { loadCatalog } from './slices/catalog';
import feed, { loadFeed } from './slices/feed';
import history, { loadHistory } from './slices/history';
import order, { loadOrderDetails, submitOrder, closeReceipt } from './slices/order';
import { signOut } from './slices/session';

import type { TOrder } from '@utils-types';

const sample: TOrder = {
  _id: 'order',
  number: 42,
  name: 'Бургер',
  status: 'pending',
  ingredients: [],
  createdAt: '',
  updatedAt: '',
};

describe('Асинхронные состояния', () => {
  test('загрузка каталога показывает ожидание и ошибку', () => {
    const pending = catalog(undefined, loadCatalog.pending('r', undefined));
    expect(pending.loading).toBe(true);
    const failed = catalog(
      pending,
      loadCatalog.rejected(new Error('offline'), 'r', undefined)
    );
    expect(failed.loading).toBe(false);
    expect(failed.error).toBe('offline');
    const success = catalog(failed, loadCatalog.fulfilled([], 'r', undefined));
    expect(success.items).toEqual([]);
  });
  test('лента хранит заказы и обе статистики', () => {
    const pending = feed(undefined, loadFeed.pending('r', undefined));
    const state = feed(
      pending,
      loadFeed.fulfilled(
        { success: true, orders: [sample], total: 100, totalToday: 7 },
        'r',
        undefined
      )
    );
    expect(state).toMatchObject({
      orders: [sample],
      total: 100,
      totalToday: 7,
      isLoading: false,
      error: null,
    });
  });
  test('ошибка обновления не уничтожает загруженную ленту', () => {
    const state = feed(
      undefined,
      loadFeed.fulfilled(
        { success: true, orders: [sample], total: 100, totalToday: 7 },
        'r',
        undefined
      )
    );
    expect(
      feed(state, loadFeed.rejected(new Error('offline'), 'r', undefined))
    ).toMatchObject({ orders: [sample], error: 'offline' });
  });
  test('выход очищает историю и отклоняет запоздалый ответ', () => {
    const pending = history(undefined, loadHistory.pending('r', undefined));
    const cleared = history(pending, signOut.fulfilled(undefined, 'logout', undefined));
    const late = history(cleared, loadHistory.fulfilled([sample], 'r', undefined));
    expect(late.orders).toEqual([]);
    expect(late.loading).toBe(false);
  });
  test('при быстром переключении заказов остаётся последний результат', () => {
    let state = order(undefined, loadOrderDetails.pending('first', 42));
    state = order(state, loadOrderDetails.pending('second', 43));
    state = order(state, loadOrderDetails.fulfilled(sample, 'first', 42));
    expect(state.detail).toBeNull();
    state = order(
      state,
      loadOrderDetails.fulfilled({ ...sample, number: 43 }, 'second', 43)
    );
    expect(state.detail?.number).toBe(43);
  });
  test('успешный заказ сохраняет номер до закрытия окна', () => {
    const state = order(undefined, submitOrder.fulfilled(sample, 'r', []));
    expect(state.receipt?.number).toBe(42);
    expect(order(state, closeReceipt()).receipt).toBeNull();
  });
});
