import { combineReducers } from '@reduxjs/toolkit';

import builder from './slices/builder';
import catalog from './slices/catalog';
import feed from './slices/feed';
import history from './slices/history';
import order from './slices/order';
import session from './slices/session';

export const rootReducer = combineReducers({
  builder,
  catalog,
  feed,
  history,
  order,
  session,
});
