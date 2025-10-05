import { ActionReducerMap } from '@ngrx/store';
import { AppState } from '../app.state';
import { productReducer } from './product.reducer';
import { cartReducer } from './cart.reducer';
import { authReducer } from './auth.reducer';
import { wishlistReducer } from './wishlist.reducer';

export const reducers: ActionReducerMap<AppState> = {
  products: productReducer,
  cart: cartReducer,
  auth: authReducer,
  wishlist: wishlistReducer,
};