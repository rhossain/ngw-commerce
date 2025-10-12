// Centralized route path & name constants for reuse across navigation, guards, tests.
export const ROUTE_PATHS = {
  HOME: '',
  SHOP: 'shop',
  PRODUCTS: 'products',
  PRODUCT_DETAIL: 'products/:slug',
  CART: 'cart',
  CHECKOUT: 'checkout',
  WISHLIST: 'wishlist',
  ACCOUNT: 'account',
  ACCOUNT_LOGIN: 'account/login',
  ACCOUNT_REGISTER: 'account/register',
  ACCOUNT_PROFILE: 'account/profile',
  ACCOUNT_ORDERS: 'account/orders',
  ACCOUNT_ORDER_DETAIL: 'account/orders/:id',
  ACCOUNT_ADDRESSES: 'account/addresses'
} as const;

export type RouteKey = keyof typeof ROUTE_PATHS;
