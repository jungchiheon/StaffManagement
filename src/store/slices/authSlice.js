import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';
import * as SecureStore from 'expo-secure-store';

// 로그인 액션
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }) => {
    const response = await authService.login(email, password);
    await SecureStore.setItemAsync('userToken', response.token);
    await SecureStore.setItemAsync('userData', JSON.stringify(response.user));
    return response;
  }
);

// 로그아웃 액션
export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  await SecureStore.deleteItemAsync('userToken');
  await SecureStore.deleteItemAsync('userData');
});

// 회원가입 액션
export const register = createAsyncThunk(
  'auth/register',
  async (userData) => {
    const response = await authService.register(userData);
    return response;
  }
);

// 자동 로그인 체크
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async () => {
    const token = await SecureStore.getItemAsync('userToken');
    const userData = await SecureStore.getItemAsync('userData');
    
    if (token && userData) {
      return {
        token,
        user: JSON.parse(userData),
        isAuthenticated: true,
      };
    }
    return { isAuthenticated: false };
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 로그인
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 로그아웃
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      // 회원가입
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 인증 상태 체크
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        if (action.payload.isAuthenticated) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;