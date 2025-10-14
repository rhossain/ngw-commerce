import { createReducer, on } from '@ngrx/store';
import { User } from '../../core/models/user.model';
import * as AuthActions from '../actions/auth.actions';

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: any;
  isRefreshing: boolean;
}

export const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  tokenExpiry: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isRefreshing: false
};

export const authReducer = createReducer(
  initialState,
  
  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.loginSuccess, (state, { user, token, refreshToken, expiresIn }) => ({
    ...state,
    user,
    token,
    refreshToken: refreshToken || null,
    tokenExpiry: expiresIn ? Date.now() + (expiresIn * 1000) : null,
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
    isAuthenticated: false
  })),
  
  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.registerSuccess, (state, { user, token, refreshToken }) => ({
    ...state,
    user,
    token,
    refreshToken: refreshToken || null,
    isAuthenticated: true,
    loading: false,
    error: null
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Token Refresh
  on(AuthActions.refreshToken, (state) => ({
    ...state,
    isRefreshing: true
  })),
  on(AuthActions.refreshTokenSuccess, (state, { token, expiresIn }) => ({
    ...state,
    token,
    tokenExpiry: expiresIn ? Date.now() + (expiresIn * 1000) : null,
    isRefreshing: false
  })),
  on(AuthActions.refreshTokenFailure, (state) => ({
    ...initialState
  })),
  
  // Token Validation
  on(AuthActions.validateToken, (state) => ({
    ...state,
    loading: true
  })),
  on(AuthActions.validateTokenSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false
  })),
  on(AuthActions.validateTokenFailure, (state) => ({
    ...initialState
  })),
  
  // Logout
  on(AuthActions.logout, AuthActions.logoutSuccess, AuthActions.sessionExpired, () => initialState)
);