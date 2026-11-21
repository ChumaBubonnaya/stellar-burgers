import { getFeedsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TFeedState } from '@utils-types';

const initialState: TFeedState = {
  orders: [],
  total: 0,
  totalToday: 0,
  isLoading: false,
  error: null,
};

export const loadFeed = createAsyncThunk('feed/load', getFeedsApi, {
  condition: (_, { getState }) => !(getState() as { feed: TFeedState }).feed.isLoading,
});

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  selectors: {
    selectFeed: (state): TFeedState => state,
    selectFeedOrder: (state, number: number): TFeedState['orders'][number] | undefined =>
      state.orders.find((order) => order.number === number),
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadFeed.fulfilled, (state, action) => {
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
        state.isLoading = false;
      })
      .addCase(loadFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ленту';
      });
  },
});
