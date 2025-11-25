export const environment = {
  production: true,
  apiUrl: 'https://ngwcommerce.rshossain.me/admin/wp-json',
  
  // Simple JWT Login Configuration
  auth: {
    baseUrl: '/simple-jwt-login/v1',
    endpoints: {
      login: '/auth',
      register: '/users',
      refresh: '/auth/refresh',
      validate: '/auth/validate',
      revoke: '/auth/revoke'
    },
    storage: {
      tokenKey: 'auth_token',
      refreshTokenKey: 'refresh_token',
      userKey: 'current_user',
      tokenExpiryKey: 'token_expiry'
    },
    tokenRefreshThreshold: 300, // Refresh token 5 minutes before expiry (in seconds)
    autoRefresh: true
  },
  
  woocommerceApi: 'https://ngwcommerce.rshossain.me/admin/wp-json/wc/v3',
  storeApi: 'https://ngwcommerce.rshossain.me/admin/wp-json/wc/store/v1',
  customApi: 'https://ngwcommerce.rshossain.me/admin/wp-json/wc-angular/v1',
  reviewsApi: 'https://ngwcommerce.rshossain.me/admin/wp-json/custom/v1',
  consumerKey: 'ck_73cffbd6bafd367edb661c800c6cb26cb950a231',
  consumerSecret: 'cs_b0002026563d78ee8e1d8794cf3811e5303dd738',
  stripePublishableKey: 'pk_live_your_stripe_key',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  itemsPerPage: 12,
  freeShippingThreshold: 100,
  flatShippingEstimate: 12.99,
  savedCartSyncUrl: 'https://ngwcommerce.rshossain.me/admin/wp-json/wc-angular/v1/saved-cart'
};