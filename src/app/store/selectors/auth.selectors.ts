import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectIsLoggedIn = createSelector(
  selectAuthState,
  (state: AuthState) => state.isAuthenticated
);

export const selectCurrentUser = createSelector(
  selectAuthState,
  (state: AuthState) => state.user
);

export const selectAuthToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.token
);

export const selectRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => state.refreshToken
);

export const selectTokenExpiry = createSelector(
  selectAuthState,
  (state: AuthState) => state.tokenExpiry
);

export const selectAuthError = createSelector(
  selectAuthState,
  (state: AuthState) => state.error
);

export const selectAuthLoading = createSelector(
  selectAuthState,
  (state: AuthState) => state.loading
);

export const selectIsRefreshing = createSelector(
  selectAuthState,
  (state: AuthState) => state.isRefreshing
);

export const selectIsTokenExpired = createSelector(
  selectAuthState,
  (state: AuthState) => {
    if (!state.tokenExpiry) return false;
    return Date.now() >= state.tokenExpiry;
  }
);

export const selectShouldRefreshToken = createSelector(
  selectAuthState,
  (state: AuthState) => {
    if (!state.tokenExpiry || !state.refreshToken) return false;
    // Refresh if token expires in less than 5 minutes
    return Date.now() >= (state.tokenExpiry - 300000);
  }
);
