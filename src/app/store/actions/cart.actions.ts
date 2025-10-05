import { createAction, props } from '@ngrx/store';
import { Cart, AddToCartRequest } from '../../core/models/cart.model';

export const loadCart = createAction('[Cart] Load Cart');

export const loadCartSuccess = createAction(
  '[Cart] Load Cart Success',
  props<{ cart: Cart }>()
);

export const loadCartFailure = createAction(
  '[Cart] Load Cart Failure',
  props<{ error: any }>()
);

export const addToCart = createAction(
  '[Cart] Add To Cart',
  props<{ request: AddToCartRequest }>()
);

export const addToCartSuccess = createAction('[Cart] Add To Cart Success');

export const addToCartFailure = createAction(
  '[Cart] Add To Cart Failure',
  props<{ error: any }>()
);

export const updateCartItem = createAction(
  '[Cart] Update Cart Item',
  props<{ cartItemKey: string; quantity: number }>()
);

export const removeFromCart = createAction(
  '[Cart] Remove From Cart',
  props<{ cartItemKey: string }>()
);

export const clearCart = createAction('[Cart] Clear Cart');