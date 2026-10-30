import { rootReducer } from './rootReducer';
import { selectBurgerPrice } from './selectors';
import reducer, {
  addIngredient,
  moveIngredient,
  removeIngredient,
} from './slices/builder';
import { submitOrder } from './slices/order';

import type { TIngredient, TOrder } from '@utils-types';

const bun: TIngredient = {
  _id: 'bun',
  name: 'Булка',
  type: 'bun',
  price: 100,
  proteins: 1,
  fat: 1,
  carbohydrates: 1,
  calories: 1,
  image: '',
  image_mobile: '',
  image_large: '',
};
const filling: TIngredient = {
  ...bun,
  _id: 'main',
  name: 'Начинка',
  type: 'main',
  price: 50,
};
const order: TOrder = {
  _id: 'order',
  number: 42,
  name: 'Бургер',
  status: 'done',
  ingredients: ['bun', 'main', 'bun'],
  createdAt: '',
  updatedAt: '',
};

describe('Конструктор и стоимость', () => {
  test('корневой reducer создаёт все области состояния', () => {
    expect(Object.keys(rootReducer(undefined, { type: 'unknown' })).sort()).toEqual([
      'builder',
      'catalog',
      'feed',
      'history',
      'order',
      'session',
    ]);
  });
  test('новая булка заменяет предыдущую', () => {
    const state = reducer(
      reducer(undefined, addIngredient(bun)),
      addIngredient({ ...bun, _id: 'another' })
    );
    expect(state.bun?._id).toBe('another');
    expect(state.ingredients).toEqual([]);
  });
  test('одинаковые начинки получают разные идентификаторы экземпляров', () => {
    const state = reducer(
      reducer(undefined, addIngredient(filling)),
      addIngredient(filling)
    );
    expect(state.ingredients).toHaveLength(2);
    expect(state.ingredients[0].id).not.toBe(state.ingredients[1].id);
    const next = reducer(state, removeIngredient(state.ingredients[0].id));
    expect(next.ingredients.map((item) => item.id)).toEqual([state.ingredients[1].id]);
    expect(state.ingredients).toHaveLength(2);
  });
  test('перестановка меняет порядок, выход за границы не меняет состояние', () => {
    const state = reducer(
      reducer(undefined, addIngredient(filling)),
      addIngredient({ ...filling, _id: 'sauce', type: 'sauce' })
    );
    const moved = reducer(state, moveIngredient({ from: 0, to: 1 }));
    expect(moved.ingredients.map((item) => item._id)).toEqual(['sauce', 'main']);
    expect(reducer(moved, moveIngredient({ from: 0, to: -1 }))).toEqual(moved);
    expect(reducer(moved, moveIngredient({ from: 1, to: 2 }))).toEqual(moved);
  });
  test('цена включает две половинки булки и каждый экземпляр начинки', () => {
    let state = rootReducer(undefined, addIngredient(bun));
    state = rootReducer(state, addIngredient(filling));
    state = rootReducer(state, addIngredient(filling));
    expect(selectBurgerPrice(state)).toBe(300);
  });
  test('неудачный заказ сохраняет бургер, успешный очищает', () => {
    const state = reducer(undefined, addIngredient(bun));
    expect(
      reducer(state, submitOrder.rejected(new Error('offline'), 'request', ['bun']))
    ).toEqual(state);
    expect(reducer(state, submitOrder.fulfilled(order, 'request', ['bun']))).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});
