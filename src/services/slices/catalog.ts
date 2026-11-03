import { getIngredientsApi } from '@api';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import type { TIngredient } from '@utils-types';

type CatalogState = {
  items: TIngredient[];
  status: 'idle' | 'loading' | 'ready' | 'failed';
  error: string | null;
};

const initialState: CatalogState = { items: [], status: 'idle', error: null };

export const loadCatalog = createAsyncThunk('catalog/load', getIngredientsApi, {
  condition: (_, { getState }) => {
    const { catalog } = getState() as { catalog: CatalogState };
    return catalog.status !== 'loading';
  },
});

export const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  selectors: {
    selectCatalog: (state): CatalogState => state,
    selectIngredients: (state): TIngredient[] => state.items,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalog.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCatalog.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'ready';
      })
      .addCase(loadCatalog.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Не удалось загрузить ингредиенты';
      });
  },
});
