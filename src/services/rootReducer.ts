import { combineSlices } from '@reduxjs/toolkit';

import { builderSlice } from './slices/builder';
import { catalogSlice } from './slices/catalog';
import { feedSlice } from './slices/feed';
import { historySlice } from './slices/history';
import { orderSlice } from './slices/order';
import { sessionSlice } from './slices/session';

export const rootReducer = combineSlices(
  builderSlice,
  catalogSlice,
  feedSlice,
  historySlice,
  orderSlice,
  sessionSlice
);
