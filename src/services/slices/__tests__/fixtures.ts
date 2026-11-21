import type { TConstructorIngredient, TIngredient, TOrder } from '@utils-types';

export const bun: TIngredient = {
  _id: 'orbital-bun',
  name: 'Булка «Орбита»',
  type: 'bun',
  proteins: 12,
  fat: 8,
  carbohydrates: 39,
  calories: 276,
  price: 110,
  image: '/test-bun.svg',
  image_large: '/test-bun-large.svg',
  image_mobile: '/test-bun-mobile.svg',
};

export const filling: TIngredient = {
  ...bun,
  _id: 'gravity-patty',
  name: 'Котлета «Гравитация»',
  type: 'main',
  price: 230,
};

export const sauce: TIngredient = {
  ...bun,
  _id: 'comet-sauce',
  name: 'Соус «Комета»',
  type: 'sauce',
  price: 35,
};

export const withId = (ingredient: TIngredient, id: string): TConstructorIngredient => ({
  ...ingredient,
  id,
});

export const receipt: TOrder = {
  _id: 'test-receipt',
  name: 'Орбитальный бургер',
  status: 'done',
  number: 73142,
  createdAt: '2026-01-12T12:00:00.000Z',
  updatedAt: '2026-01-12T12:00:01.000Z',
  ingredients: [bun._id, filling._id, sauce._id, bun._id],
};
