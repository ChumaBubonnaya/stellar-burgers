import { builderSlice } from './slices/builder';
import { catalogSlice } from './slices/catalog';
import { feedSlice } from './slices/feed';
import { historySlice } from './slices/history';
import { orderSlice } from './slices/order';
import { sessionSlice } from './slices/session';

export const { selectBuilder, selectBurgerPrice } = builderSlice.selectors;
export const { selectCatalog, selectIngredients } = catalogSlice.selectors;
export const { selectFeed, selectFeedOrder } = feedSlice.selectors;
export const { selectHistory, selectHistoryOrder } = historySlice.selectors;
export const { selectOrder } = orderSlice.selectors;
export const { selectSession, selectUser } = sessionSlice.selectors;
