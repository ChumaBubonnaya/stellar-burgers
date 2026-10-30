import {
  forgotPasswordApi,
  getUserApi,
  loginUserApi,
  logoutApi,
  refreshToken,
  registerUserApi,
  resetPasswordApi,
  updateUserApi,
} from '@api';
import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';

import { deleteCookie, getCookie, setCookie } from '@utils/cookie';

import type { TLoginData, TRegisterData } from '@api';
import type { TUser } from '@utils-types';

type SessionState = {
  user: TUser | null;
  checked: boolean;
  checking: boolean;
  pending: boolean;
  error: string | null;
};

const initialState: SessionState = {
  user: null,
  checked: false,
  checking: false,
  pending: false,
  error: null,
};

const saveTokens = (tokens: { accessToken: string; refreshToken: string }): void => {
  setCookie('accessToken', tokens.accessToken, { sameSite: 'Lax' });
  localStorage.setItem('refreshToken', tokens.refreshToken);
};

const clearTokens = (): void => {
  deleteCookie('accessToken');
  localStorage.removeItem('refreshToken');
};

export const restoreSession = createAsyncThunk(
  'session/restore',
  async () => {
    if (!getCookie('accessToken') && !localStorage.getItem('refreshToken')) return null;
    try {
      if (!getCookie('accessToken')) await refreshToken();
      const response = await getUserApi();
      return response.user;
    } catch (error) {
      clearTokens();
      throw error;
    }
  },
  {
    condition: (_, { getState }) => {
      const { session } = getState() as { session: SessionState };
      return !session.checked && !session.checking;
    },
  }
);

export const signIn = createAsyncThunk('session/signIn', async (data: TLoginData) => {
  const response = await loginUserApi(data);
  saveTokens(response);
  return response.user;
});

export const signUp = createAsyncThunk('session/signUp', async (data: TRegisterData) => {
  const response = await registerUserApi(data);
  saveTokens(response);
  return response.user;
});

export const saveProfile = createAsyncThunk(
  'session/saveProfile',
  async (data: Partial<TRegisterData>) => (await updateUserApi(data)).user
);

export const signOut = createAsyncThunk('session/signOut', async () => {
  await logoutApi();
  clearTokens();
});

export const requestPasswordReset = createAsyncThunk(
  'session/requestPasswordReset',
  async (email: string) => {
    await forgotPasswordApi({ email });
    localStorage.setItem('resetPassword', 'true');
  }
);

export const changePassword = createAsyncThunk(
  'session/changePassword',
  async (data: { password: string; token: string }) => {
    await resetPasswordApi(data);
    localStorage.removeItem('resetPassword');
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    clearSessionError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state) => {
        state.checking = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.checked = true;
        state.checking = false;
      })
      .addCase(restoreSession.rejected, (state) => {
        state.user = null;
        state.checked = true;
        state.checking = false;
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
      })
      .addMatcher(
        isAnyOf(signIn.fulfilled, signUp.fulfilled, saveProfile.fulfilled),
        (state, action) => {
          state.user = action.payload;
          state.checked = true;
        }
      )
      .addMatcher(
        isAnyOf(
          signIn.pending,
          signUp.pending,
          saveProfile.pending,
          signOut.pending,
          requestPasswordReset.pending,
          changePassword.pending
        ),
        (state) => {
          state.pending = true;
          state.error = null;
        }
      )
      .addMatcher(
        isAnyOf(
          signIn.fulfilled,
          signUp.fulfilled,
          saveProfile.fulfilled,
          signOut.fulfilled,
          requestPasswordReset.fulfilled,
          changePassword.fulfilled
        ),
        (state) => {
          state.pending = false;
        }
      )
      .addMatcher(
        isAnyOf(
          signIn.rejected,
          signUp.rejected,
          saveProfile.rejected,
          signOut.rejected,
          requestPasswordReset.rejected,
          changePassword.rejected
        ),
        (state, action) => {
          state.pending = false;
          state.error = action.error.message ?? 'Не удалось выполнить запрос';
        }
      );
  },
});

export const { clearSessionError } = sessionSlice.actions;
export default sessionSlice.reducer;
