import { describe, expect, test } from '@jest/globals';

import { rootReducer } from '../../rootReducer';
import { builderSlice } from '../builder';
import { catalogSlice } from '../catalog';
import { feedSlice } from '../feed';
import { historySlice } from '../history';
import { orderSlice, submitOrder } from '../order';
import { sessionSlice } from '../session';
import { bun, filling, receipt, withId } from './fixtures';

describe('rootReducer: инициализация и совместная обработка действий', () => {
  test('неизвестное действие и undefined инициализируют все слайсы', () => {
    expect(rootReducer(undefined, { type: 'UNKNOWN' })).toEqual({
      builder: builderSlice.getInitialState(),
      catalog: catalogSlice.getInitialState(),
      feed: feedSlice.getInitialState(),
      history: historySlice.getInitialState(),
      order: orderSlice.getInitialState(),
      session: sessionSlice.getInitialState(),
    });
  });

  test('успешный заказ одновременно очищает конструктор и сохраняет квитанцию', () => {
    const state = {
      ...rootReducer(undefined, { type: 'UNKNOWN' }),
      builder: { bun: withId(bun, 'bun'), ingredients: [withId(filling, 'patty')] },
    };
    const action = submitOrder.fulfilled(
      receipt,
      'completed-order',
      receipt.ingredients
    );
    const result = rootReducer(state, action);

    expect(result.builder).toEqual({ bun: null, ingredients: [] });
    expect(result.order.receipt).toEqual(receipt);
    expect(result.catalog).toBe(state.catalog);
    expect(state.builder.ingredients).toHaveLength(1);
  });
});
