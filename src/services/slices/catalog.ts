import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

type CatalogState = {
  items: TIngredient[];
  loading: boolean;
  error: string | null;
};

const initialState: CatalogState = { items: [], loading: false, error: null };

export const loadCatalog = createAsyncThunk('catalog/load', getIngredientsApi, {
  condition: (_, { getState }) => {
    const { catalog } = getState() as { catalog: CatalogState };
    return !catalog.loading;
  },
});

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalog.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCatalog.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(loadCatalog.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
});

export default catalogSlice.reducer;
