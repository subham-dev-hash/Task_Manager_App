// src/store/slices/authSlice.ts
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { signIn, signOut, signUp } from '../../api/firebase';
import { AuthState, User } from '../../types';

type AuthCredentials = {
  email: string;
  password: string;
  displayName?: string;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const mapFirebaseUser = (firebaseUser: any): User => ({
  uid: firebaseUser.uid,
  email: firebaseUser.email ?? '',
  displayName: firebaseUser.displayName ?? undefined,
});

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: AuthCredentials, { rejectWithValue }) => {
    try {
      const credential = await signIn(email, password);
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to sign in');
    }
  }
);

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ email, password, displayName }: AuthCredentials, { rejectWithValue }) => {
    try {
      const credential = await signUp(email, password);
      if (displayName) {
        await credential.user.updateProfile({ displayName });
      }
      await credential.user.reload();
      return mapFirebaseUser(credential.user);
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Failed to create account');
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await signOut();
  } catch (error: any) {
    return rejectWithValue(error?.message || 'Failed to sign out');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    setAuthLoading(state, action: { payload: boolean }) {
      state.isLoading = action.payload;
    },
    setAuthUser(state, action: { payload: User | null }) {
      state.user = action.payload;
      state.isAuthenticated = Boolean(action.payload);
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to sign in';
      })
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create account';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = (action.payload as string) || action.error.message || 'Failed to sign out';
      });
  },
});

export const { clearError, setAuthLoading, setAuthUser } = authSlice.actions;
export default authSlice.reducer;