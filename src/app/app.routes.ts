import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { ROUTE_PATHS } from './core/constants/route-paths';

export const routes: Routes = [
  {
    path: ROUTE_PATHS.HOME,
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Home - WooCommerce Shop',
    data: { preload: true }
  },
  {
    path: ROUTE_PATHS.SHOP,
    loadComponent: () => import('./features/products/shop/shop.component').then(m => m.ShopComponent),
    title: 'Shop - WooCommerce Shop',
    data: { preload: true }
  },
  {
    path: ROUTE_PATHS.PRODUCTS,
    loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent),
    title: 'Products - WooCommerce Shop'
  },
  {
    path: 'products/:slug', // kept literal since constant includes param; optional to use ROUTE_PATHS.PRODUCT_DETAIL
    loadComponent: () => import('./features/products/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Product Details - WooCommerce Shop'
  },
  {
    path: ROUTE_PATHS.CART,
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Shopping Cart - WooCommerce Shop'
  },
  {
    path: ROUTE_PATHS.CHECKOUT,
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    title: 'Checkout - WooCommerce Shop'
  },
  {
    path: ROUTE_PATHS.WISHLIST,
    loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent),
    canActivate: [authGuard],
    title: 'Wishlist - WooCommerce Shop'
  },
  {
    path: ROUTE_PATHS.ACCOUNT,
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/account/login/login.component').then(m => m.LoginComponent),
        canActivate: [guestGuard],
        title: 'Login - WooCommerce Shop'
      },
      {
        path: 'register',
        loadComponent: () => import('./features/account/register/register.component').then(m => m.RegisterComponent),
        canActivate: [guestGuard],
        title: 'Register - WooCommerce Shop'
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/account/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [authGuard],
        title: 'My Account - WooCommerce Shop'
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/account/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [authGuard],
        title: 'My Orders - WooCommerce Shop'
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/account/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
        canActivate: [authGuard],
        title: 'Order Details - WooCommerce Shop'
      },
      {
        path: 'addresses',
        loadComponent: () => import('./features/account/addresses/addresses.component').then(m => m.AddressesComponent),
        canActivate: [authGuard],
        title: 'My Addresses - WooCommerce Shop'
      },
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: '404 - Page Not Found'
  }
];