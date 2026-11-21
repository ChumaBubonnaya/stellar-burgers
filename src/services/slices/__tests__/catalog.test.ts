import { getIngredientsApi } from '@api';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';

import { catalogSlice, loadCatalog } from '../catalog';
import { bun, filling, sauce } from './fixtures';

import type { TIngredient } from '@utils-types';

jest.mock('@api', () => ({ getIngredientsApi: jest.fn() }));

const reducer = catalogSlice.reducer;
const { selectCatalog, selectIngredients } = catalogSlice.getSelectors();
const requestId = 'catalog-request';
const catalog = [bun, filling, sauce];
const makeStore = (): ReturnType<
  typeof configureStore<{ catalog: ReturnType<typeof reducer> }>
> => configureStore({ reducer: { catalog: reducer } });

beforeEach(() => {
  jest.resetAllMocks();
});

describe('catalog: прямой вызов редьюсера', () => {
  test('неизвестное действие с undefined создаёт пустой каталог', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual({
      items: [],
      status: 'idle',
      error: null,
    });
  });

  test('неизвестное действие сохраняет уже загруженный каталог', () => {
    const state = reducer(undefined, loadCatalog.fulfilled(catalog, requestId));
    expect(reducer(state, { type: 'UNKNOWN' })).toBe(state);
  });

  test('pending включает загрузку, сбрасывает ошибку и сохраняет старые данные', () => {
    const state = { items: catalog, status: 'failed' as const, error: 'Старая ошибка' };
    const snapshot = structuredClone(state);
    expect(reducer(state, loadCatalog.pending(requestId))).toEqual({
      items: catalog,
      status: 'loading',
      error: null,
    });
    expect(state).toEqual(snapshot);
  });

  test('fulfilled заменяет данные ответом сервера и завершает загрузку', () => {
    const state = { items: [bun], status: 'loading' as const, error: null };
    expect(reducer(state, loadCatalog.fulfilled([filling, sauce], requestId))).toEqual({
      items: [filling, sauce],
      status: 'ready',
      error: null,
    });
  });

  test('fulfilled с пустым массивом удаляет устаревшие данные', () => {
    const state = { items: catalog, status: 'loading' as const, error: null };
    expect(reducer(state, loadCatalog.fulfilled([], requestId))).toEqual({
      items: [],
      status: 'ready',
      error: null,
    });
  });

  test('rejected завершает загрузку, сохраняет каталог и записывает сообщение', () => {
    const state = { items: catalog, status: 'loading' as const, error: null };
    const action = loadCatalog.rejected(new Error('Каталог недоступен'), requestId);
    expect(reducer(state, action)).toEqual({
      items: catalog,
      status: 'failed',
      error: 'Каталог недоступен',
    });
  });

  test('rejected без сообщения использует понятную ошибку по умолчанию', () => {
    const action = { ...loadCatalog.rejected(null, requestId), error: {} };
    expect(reducer(undefined, action)).toEqual({
      items: [],
      status: 'failed',
      error: 'Не удалось загрузить ингредиенты',
    });
  });
});

describe('catalog: селекторы', () => {
  test('selectCatalog возвращает состояние, selectIngredients — массив данных', () => {
    const state = reducer(undefined, loadCatalog.fulfilled(catalog, requestId));
    expect(selectCatalog(state)).toBe(state);
    expect(selectIngredients(state)).toBe(state.items);
  });
});

describe('catalog: асинхронная загрузка', () => {
  test('реальный thunk получает ингредиенты и передаёт их редьюсеру', async () => {
    jest.mocked(getIngredientsApi).mockResolvedValue(catalog);
    const store = makeStore();
    const action = await store.dispatch(loadCatalog());

    expect(getIngredientsApi).toHaveBeenCalledTimes(1);
    expect(loadCatalog.fulfilled.match(action)).toBe(true);
    expect(store.getState().catalog).toEqual({
      items: catalog,
      status: 'ready',
      error: null,
    });
  });

  test('ошибка API приводит к rejected и состоянию failed', async () => {
    jest.mocked(getIngredientsApi).mockRejectedValue(new Error('Нет соединения'));
    const store = makeStore();
    const action = await store.dispatch(loadCatalog());

    expect(loadCatalog.rejected.match(action)).toBe(true);
    expect(store.getState().catalog).toEqual({
      items: [],
      status: 'failed',
      error: 'Нет соединения',
    });
  });

  test('параллельный dispatch не начинает второй запрос, после завершения можно повторить', async () => {
    let finishRequest!: (items: TIngredient[]) => void;
    const response = new Promise<TIngredient[]>((resolve) => {
      finishRequest = resolve;
    });
    jest
      .mocked(getIngredientsApi)
      .mockReturnValueOnce(response)
      .mockResolvedValue(catalog);
    const store = makeStore();
    const first = store.dispatch(loadCatalog());

    expect(store.getState().catalog.status).toBe('loading');
    const second = await store.dispatch(loadCatalog());
    expect(loadCatalog.rejected.match(second) && second.meta.condition).toBe(true);
    expect(getIngredientsApi).toHaveBeenCalledTimes(1);
    expect(store.getState().catalog.status).toBe('loading');

    finishRequest(catalog);
    await first;
    await store.dispatch(loadCatalog());
    expect(getIngredientsApi).toHaveBeenCalledTimes(2);
    expect(store.getState().catalog.status).toBe('ready');
  });

  test('повторная попытка после ошибки успешно загружает каталог', async () => {
    jest
      .mocked(getIngredientsApi)
      .mockRejectedValueOnce(new Error('Временный сбой'))
      .mockResolvedValueOnce(catalog);
    const store = makeStore();
    await store.dispatch(loadCatalog());
    await store.dispatch(loadCatalog());

    expect(store.getState().catalog).toEqual({
      items: catalog,
      status: 'ready',
      error: null,
    });
    expect(getIngredientsApi).toHaveBeenCalledTimes(2);
  });
});
