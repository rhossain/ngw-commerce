import { createAction, props } from '@ngrx/store';
import { User, LoginRequest, RegisterRequest } from '../../core/models/user.model';

// Login Actions
export const login = createAction(
  '[Auth] Login',
  props<{ credentials: LoginRequest }>()
);

export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string; refreshToken?: string; expiresIn?: number }>()
);

export const loginFailure = createAction(
  '[Auth] Login Failure',
  props<{ error: any }>()
);

// Register Actions
export const register = createAction(
  '[Auth] Register',
  props<{ userData: RegisterRequest }>()
);

export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string; refreshToken?: string }>()
);

export const registerFailure = createAction(
  '[Auth] Register Failure',
  props<{ error: any }>()
);

// Token Refresh Actions
export const refreshToken = createAction('[Auth] Refresh Token');

export const refreshTokenSuccess = createAction(
  '[Auth] Refresh Token Success',
  props<{ token: string; expiresIn?: number }>()
);

export const refreshTokenFailure = createAction(
  '[Auth] Refresh Token Failure',
  props<{ error: any }>()
);

// Token Validation Actions
export const validateToken = createAction('[Auth] Validate Token');

export const validateTokenSuccess = createAction(
  '[Auth] Validate Token Success',
  props<{ user: User }>()
);

export const validateTokenFailure = createAction('[Auth] Validate Token Failure');

// Logout Action
export const logout = createAction('[Auth] Logout');

export const logoutSuccess = createAction('[Auth] Logout Success');

// Auth Status Check
export const checkAuthStatus = createAction('[Auth] Check Auth Status');

// Session Expired
export const sessionExpired = createAction('[Auth] Session Expired');