import { describe, expect, test } from '@jest/globals';

import {
  addIngredient,
  builderSlice,
  moveIngredient,
  removeIngredient,
} from '../builder';
import { submitOrder } from '../order';
import { bun, filling, receipt, sauce, withId } from './fixtures';

import type { TConstructorState } from '@utils-types';

const reducer = builderSlice.reducer;
const { selectBuilder, selectBurgerPrice } = builderSlice.getSelectors();

const assembledBurger = (): TConstructorState => ({
  bun: withId(bun, 'bun-layer'),
  ingredients: [
    withId(filling, 'patty-first'),
    withId(sauce, 'sauce-layer'),
    withId(filling, 'patty-second'),
  ],
});

describe('builder: начальное состояние и неизвестные действия', () => {
  test('неизвестное действие с undefined возвращает пустой конструктор', () => {
    expect(reducer(undefined, { type: 'UNKNOWN' })).toEqual({
      bun: null,
      ingredients: [],
    });
  });

  test('неизвестное действие сохраняет собранный бургер', () => {
    const state = assembledBurger();
    expect(reducer(state, { type: 'UNKNOWN' })).toBe(state);
  });
});

describe('builder: добавление ингредиентов', () => {
  test('булка занимает отдельное поле и не попадает в начинку', () => {
    const action = addIngredient(bun);
    expect(reducer(undefined, action)).toEqual({
      bun: action.payload,
      ingredients: [],
    });
  });

  test('новая булка заменяет обе половинки, сохраняя начинку', () => {
    const state = assembledBurger();
    const replacement = addIngredient({ ...bun, _id: 'another-bun', price: 140 });
    expect(reducer(state, replacement)).toEqual({
      bun: replacement.payload,
      ingredients: state.ingredients,
    });
  });

  test.each([filling, sauce])('$type добавляется в конец начинки', (ingredient) => {
    const state = assembledBurger();
    const action = addIngredient(ingredient);
    expect(reducer(state, action)).toEqual({
      bun: state.bun,
      ingredients: [...state.ingredients, action.payload],
    });
  });

  test('повторные добавления получают разные id при одинаковом _id из каталога', () => {
    const source = structuredClone(filling);
    const first = addIngredient(filling);
    const second = addIngredient(filling);
    const state = reducer(reducer(undefined, first), second);

    expect(first.payload.id).toEqual(expect.any(String));
    expect(first.payload.id.length).toBeGreaterThan(0);
    expect(second.payload.id).not.toBe(first.payload.id);
    expect(state.ingredients).toEqual([first.payload, second.payload]);
    expect(state.ingredients.map((item) => item._id)).toEqual([
      filling._id,
      filling._id,
    ]);
    expect(filling).toEqual(source);
  });

  test('редьюсер не изменяет исходное состояние', () => {
    const state = assembledBurger();
    const snapshot = structuredClone(state);
    reducer(state, addIngredient(sauce));
    expect(state).toEqual(snapshot);
  });
});

describe('builder: удаление и перестановка начинки', () => {
  test('удаляется только экземпляр с переданным id', () => {
    const state = assembledBurger();
    expect(reducer(state, removeIngredient('patty-first'))).toEqual({
      bun: state.bun,
      ingredients: [state.ingredients[1], state.ingredients[2]],
    });
  });

  test('несуществующий id не удаляет другие ингредиенты или булку', () => {
    const state = assembledBurger();
    expect(reducer(state, removeIngredient('missing-layer'))).toEqual(state);
  });

  test.each([
    { from: 0, to: 2, order: ['sauce-layer', 'patty-second', 'patty-first'] },
    { from: 2, to: 0, order: ['patty-second', 'patty-first', 'sauce-layer'] },
    { from: 1, to: 1, order: ['patty-first', 'sauce-layer', 'patty-second'] },
  ])(
    'перемещение $from → $to сохраняет состав и меняет порядок',
    ({ from, to, order }) => {
      const state = assembledBurger();
      const snapshot = structuredClone(state);
      const result = reducer(state, moveIngredient({ from, to }));

      expect(result.ingredients.map((item) => item.id)).toEqual(order);
      expect(result.ingredients).toHaveLength(state.ingredients.length);
      expect(result.bun).toEqual(state.bun);
      expect(state).toEqual(snapshot);
    }
  );

  test.each([
    { from: -1, to: 0 },
    { from: 0, to: -1 },
    { from: 3, to: 0 },
    { from: 0, to: 3 },
  ])('индексы за пределами массива ($from → $to) не меняют состояние', (position) => {
    const state = assembledBurger();
    expect(reducer(state, moveIngredient(position))).toBe(state);
  });

  test('пустую начинку нельзя переставить', () => {
    expect(reducer(undefined, moveIngredient({ from: 0, to: 0 }))).toEqual({
      bun: null,
      ingredients: [],
    });
  });
});

describe('builder: результат оформления заказа', () => {
  const ids = receipt.ingredients;

  test('fulfilled очищает булку и всю начинку', () => {
    const state = assembledBurger();
    const snapshot = structuredClone(state);
    expect(reducer(state, submitOrder.fulfilled(receipt, 'order-request', ids))).toEqual(
      {
        bun: null,
        ingredients: [],
      }
    );
    expect(state).toEqual(snapshot);
  });

  test('pending сохраняет бургер до подтверждения сервера', () => {
    const state = assembledBurger();
    expect(reducer(state, submitOrder.pending('order-request', ids))).toBe(state);
  });

  test('rejected сохраняет бургер для повторной отправки', () => {
    const state = assembledBurger();
    const action = submitOrder.rejected(new Error('Сервер занят'), 'order-request', ids);
    expect(reducer(state, action)).toBe(state);
  });
});

describe('builder: селекторы', () => {
  test('selectBuilder возвращает состояние конструктора', () => {
    const state = assembledBurger();
    expect(selectBuilder(state)).toBe(state);
  });

  test.each([
    { state: { bun: null, ingredients: [] }, expected: 0 },
    { state: { bun: withId(bun, 'bun'), ingredients: [] }, expected: 220 },
    { state: { bun: null, ingredients: [withId(sauce, 'sauce')] }, expected: 35 },
    { state: assembledBurger(), expected: 715 },
  ])('расчёт стоимости: $expected, булка учитывается дважды', ({ state, expected }) => {
    expect(selectBurgerPrice(state)).toBe(expected);
  });
});
