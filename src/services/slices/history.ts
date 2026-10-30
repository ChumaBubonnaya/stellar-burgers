import { getOrdersApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { signOut } from './session';

import type { TOrder } from '@utils-types';

type HistoryState = {
  orders: TOrder[];
  loading: boolean;
  error: string | null;
  requestId: string | null;
};
const initialState: HistoryState = {
  orders: [],
  loading: false,
  error: null,
  requestId: null,
};

export const loadHistory = createAsyncThunk('history/load', getOrdersApi, {
  condition: (_, { getState }) =>
    !(getState() as { history: HistoryState }).history.loading,
});

const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signOut.fulfilled, () => initialState)
      .addCase(loadHistory.pending, (state, action) => {
        state.loading = true;
        state.error = null;
        state.requestId = action.meta.requestId;
      })
      .addCase(loadHistory.fulfilled, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(loadHistory.rejected, (state, action) => {
        if (state.requestId !== action.meta.requestId) return;
        state.loading = false;
        state.error = action.error.message ?? 'Не удалось загрузить историю';
      });
  },
});

export default historySlice.reducer;
