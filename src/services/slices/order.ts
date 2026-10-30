import { getOrderByNumberApi, orderBurgerApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TOrder } from '@utils-types';

type OrderState = {
  receipt: TOrder | null;
  pending: boolean;
  error: string | null;
  detail: TOrder | null;
  detailLoading: boolean;
  detailError: string | null;
  detailRequestId: string | null;
};

const initialState: OrderState = {
  receipt: null,
  pending: false,
  error: null,
  detail: null,
  detailLoading: false,
  detailError: null,
  detailRequestId: null,
};

export const submitOrder = createAsyncThunk(
  'order/submit',
  async (ingredients: string[]) => (await orderBurgerApi(ingredients)).order,
  {
    condition: (_, { getState }) => !(getState() as { order: OrderState }).order.pending,
  }
);

export const loadOrderDetails = createAsyncThunk(
  'order/details',
  async (number: number) => {
    if (!Number.isSafeInteger(number) || number <= 0)
      throw new Error('Неверный номер заказа');
    const { orders } = await getOrderByNumberApi(number);
    const order = orders.find((item) => item.number === number);
    if (!order) throw new Error('Заказ не найден');
    return order;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    closeReceipt: (state) => {
      state.receipt = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.pending = true;
        state.error = null;
        state.receipt = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.pending = false;
        state.receipt = action.payload;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.pending = false;
        state.error = action.error.message ?? 'Не удалось оформить заказ';
      })
      .addCase(loadOrderDetails.pending, (state, action) => {
        state.detail = null;
        state.detailLoading = true;
        state.detailError = null;
        state.detailRequestId = action.meta.requestId;
      })
      .addCase(loadOrderDetails.fulfilled, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detail = action.payload;
        state.detailLoading = false;
      })
      .addCase(loadOrderDetails.rejected, (state, action) => {
        if (state.detailRequestId !== action.meta.requestId) return;
        state.detailLoading = false;
        state.detailError = action.error.message ?? 'Не удалось загрузить заказ';
      });
  },
});

export const { closeReceipt } = orderSlice.actions;
export default orderSlice.reducer;
