export const environment = {
  production: false,
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
  consumerKey: 'ck_34e6e92d2a717c6f4e51a057a3a438313ec0dc0e',
  consumerSecret: 'cs_fb4ccc4a46b4ccfd418fb0238712a963183b17da',
  stripePublishableKey: 'pk_test_your_stripe_key',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  itemsPerPage: 12,
  freeShippingThreshold: 100,
  flatShippingEstimate: 8.99,
  savedCartSyncUrl: 'https://ngwcommerce.rshossain.me/admin/wp-json/wc-angular/v1/saved-cart'
};