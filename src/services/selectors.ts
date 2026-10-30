import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from './store';

export const selectCatalog = (state: RootState): RootState['catalog'] => state.catalog;
export const selectIngredients = (state: RootState): RootState['catalog']['items'] =>
  state.catalog.items;
export const selectBuilder = (state: RootState): RootState['builder'] => state.builder;
export const selectSession = (state: RootState): RootState['session'] => state.session;
export const selectUser = (state: RootState): RootState['session']['user'] =>
  state.session.user;
export const selectOrder = (state: RootState): RootState['order'] => state.order;
export const selectFeed = (state: RootState): RootState['feed'] => state.feed;
export const selectHistory = (state: RootState): RootState['history'] => state.history;
export const selectBurgerPrice = createSelector(
  selectBuilder,
  ({ bun, ingredients }) =>
    (bun?.price ?? 0) * 2 + ingredients.reduce((total, item) => total + item.price, 0)
);
