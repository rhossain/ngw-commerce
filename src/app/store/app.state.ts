import { ProductState } from './reducers/product.reducer';
import { CartState } from './reducers/cart.reducer';
import { AuthState } from './reducers/auth.reducer';
import { WishlistState } from './reducers/wishlist.reducer';

export interface AppState {
  products: ProductState;
  cart: CartState;
  auth: AuthState;
  wishlist: WishlistState;
}