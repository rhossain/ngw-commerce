# Authentication System - Implementation Notes

## Overview
The authentication system has been updated to work with WooCommerce REST API v3, which doesn't have built-in login/register endpoints.

## How It Works

### Registration Flow
1. User fills out registration form (first_name, last_name, email, password)
2. Angular app calls WooCommerce `/customers` endpoint (POST)
3. WooCommerce creates a new customer account
4. Password is stored in localStorage (client-side only)
5. User data is saved to localStorage and auth state is updated

### Login Flow
1. User enters email and password
2. Angular app searches for customer by email using `/customers?email=xxx`
3. If customer found, password is verified against localStorage
4. If password matches, user is logged in and session is created

## Important Security Notes

⚠️ **This is NOT production-ready authentication!**

### Current Implementation (Development Only)
- Passwords stored in localStorage (INSECURE)
- No server-side password verification
- No JWT tokens
- No secure session management

### For Production Use
You should implement ONE of these solutions:

#### Option 1: JWT Authentication (Recommended)
Install JWT plugin for WordPress:
- **Plugin:** JWT Authentication for WP-API
- **Link:** https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/

Then update auth.service.ts to:
```typescript
login(credentials: LoginRequest): Observable<any> {
  return this.http.post('https://your-site.com/wp-json/jwt-auth/v1/token', {
    username: credentials.username,
    password: credentials.password
  }).pipe(
    tap(response => {
      // Store JWT token
      this.storage.setItem('jwt_token', response.token);
      // Use token in API calls
    })
  );
}
```

#### Option 2: WordPress REST API Authentication
Use WordPress native authentication:
```typescript
login(credentials: LoginRequest): Observable<any> {
  const auth = btoa(`${credentials.username}:${credentials.password}`);
  return this.http.post('https://your-site.com/wp-json/wp/v2/users/me', {}, {
    headers: { 'Authorization': `Basic ${auth}` }
  });
}
```

#### Option 3: Custom WooCommerce Plugin
Create a custom WordPress plugin that:
- Provides secure login/register endpoints
- Manages sessions server-side
- Returns JWT or session tokens
- Validates passwords securely

## Current Endpoints Used

### Registration
```
POST /wp-json/wc/v3/customers
Body: {
  email: string,
  first_name: string,
  last_name: string,
  username: string
}
```

### Login (Customer Search)
```
GET /wp-json/wc/v3/customers?email=user@example.com
```

## Testing

### Register a New User
1. Go to `/account/register`
2. Fill in: First Name, Last Name, Email, Password
3. Check console for "Customer created" log
4. Should redirect to profile page

### Login
1. Go to `/account/login`
2. Use the email and password from registration
3. Check console for "Customer search result" log
4. Should redirect to profile page

### Logout
1. Click logout button (should be in header/profile)
2. Should clear user data and redirect

## Known Limitations

1. **Password Storage:** Passwords stored in localStorage (visible in DevTools)
2. **No Password Reset:** Not implemented yet
3. **No Email Verification:** Customers created without email verification
4. **Session Persistence:** Based on localStorage, not secure cookies
5. **CORS Required:** WordPress must allow CORS from Angular app origin

## Recommended Next Steps

1. ✅ Current implementation works for development/demo
2. 🔜 Install JWT Authentication plugin for production
3. 🔜 Implement password reset functionality
4. 🔜 Add email verification
5. 🔜 Use HTTP-only cookies for session management
6. 🔜 Add rate limiting for login attempts
7. 🔜 Implement refresh token mechanism

## Files Modified

- `src/app/core/services/auth.service.ts` - Updated login/register logic
- `src/app/core/models/user.model.ts` - Added billing, shipping, username fields
- `src/app/features/account/login/login.component.ts` - Already using auth service correctly
- `src/app/features/account/register/register.component.ts` - Already using auth service correctly

## Error Handling

The service handles these WooCommerce errors:
- Email already exists
- Invalid customer data
- Network errors
- Customer not found (login)
- Invalid password (login)
