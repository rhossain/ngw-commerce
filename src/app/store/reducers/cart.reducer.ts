import { createReducer, on } from '@ngrx/store';
import { Cart } from '../../core/models/cart.model';
import * as CartActions from '../actions/cart.actions';

export interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: any;
}

export const initialState: CartState = {
  cart: null,
  loading: false,
  error: null
};

export const cartReducer = createReducer(
  initialState,
  on(CartActions.loadCart, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(CartActions.loadCartSuccess, (state, { cart }) => ({
    ...state,
    cart,
    loading: false
  })),
  on(CartActions.loadCartFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);