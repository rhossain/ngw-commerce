export const environment = {
  production: false,
  apiUrl: 'https://woocommerce.rshossain.com/wp-json',
  
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
  
  woocommerceApi: 'https://woocommerce.rshossain.com/wp-json/wc/v3',
  storeApi: 'https://woocommerce.rshossain.com/wp-json/wc/store/v1',
  customApi: 'https://woocommerce.rshossain.com/wp-json/wc-angular/v1',
  reviewsApi: 'https://woocommerce.rshossain.com/wp-json/custom/v1',
  consumerKey: 'ck_8fde1482ddc884c1c36fdfcd26699c8970bd8faa',
  consumerSecret: 'cs_96a821759a1f187b1af994802b932524c02b1834',
  stripePublishableKey: 'pk_test_your_stripe_key',
  googleAnalyticsId: 'G-XXXXXXXXXX',
  defaultCurrency: 'USD',
  defaultLanguage: 'en',
  itemsPerPage: 12,
  freeShippingThreshold: 100,
  flatShippingEstimate: 8.99,
  savedCartSyncUrl: 'https://woocommerce.rshossain.com/wp-json/wc-angular/v1/saved-cart'
};