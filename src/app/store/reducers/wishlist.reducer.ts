import { createReducer, on } from '@ngrx/store';
import { Product } from '../../core/models/product.model';
import * as WishlistActions from '../actions/wishlist.actions';

export interface WishlistState {
  products: Product[];
  loading: boolean;
  error: any;
}

export const initialState: WishlistState = {
  products: [],
  loading: false,
  error: null
};

export const wishlistReducer = createReducer(
  initialState,
  on(WishlistActions.loadWishlist, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(WishlistActions.loadWishlistSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  })),
  on(WishlistActions.loadWishlistFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);