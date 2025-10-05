import { createAction, props } from '@ngrx/store';
import { Product } from '../../core/models/product.model';

export const loadWishlist = createAction('[Wishlist] Load Wishlist');

export const loadWishlistSuccess = createAction(
  '[Wishlist] Load Wishlist Success',
  props<{ products: Product[] }>()
);

export const loadWishlistFailure = createAction(
  '[Wishlist] Load Wishlist Failure',
  props<{ error: any }>()
);

export const addToWishlist = createAction(
  '[Wishlist] Add To Wishlist',
  props<{ productId: number }>()
);

export const removeFromWishlist = createAction(
  '[Wishlist] Remove From Wishlist',
  props<{ productId: number }>()
);