# WordPress REST API Authentication Fix

## 🔴 Problem
Getting 401 error: "Sorry, you are not allowed to do that" when creating reviews, even though logged in.

## 🎯 Root Cause
WordPress REST API requires **Application Password** authentication for custom endpoints with `permission_callback => 'is_user_logged_in'`.

Your current login uses WooCommerce customer lookup, but WordPress doesn't recognize this as authentication.

## ✅ Solution: Use WordPress Application Passwords

### Step 1: Create Application Password in WordPress

1. **Go to WordPress Admin**
2. **Navigate to:** Users → Your Profile
3. **Scroll down to:** "Application Passwords" section
4. **Create new password:**
   - Application Name: `Angular App`
   - Click "Add New Application Password"
   - **COPY THE GENERATED PASSWORD** (you can't see it again!)
   
Example generated password: `xxxx xxxx xxxx xxxx xxxx xxxx`

### Step 2: Test with curl

```bash
# Replace with your actual credentials
curl -X POST https://woocommerce.rshossain.com/wp-json/custom/v1/reviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'your-username:xxxx xxxx xxxx xxxx xxxx xxxx' | base64)" \
  -d '{
    "product_id": 123,
    "rating": 5,
    "review": "Test review"
  }'
```

### Step 3: Update Angular Auth Service

The auth service needs to use WordPress Application Password instead of WooCommerce customer lookup.

```typescript
// In auth.service.ts
login(credentials: LoginRequest): Observable<any> {
  // credentials.username = WordPress username (not email)
  // credentials.password = Application Password from Step 1
  
  const authHeader = 'Basic ' + btoa(credentials.username + ':' + credentials.password);
  
  // Test authentication by getting current user
  const wpApiUrl = 'https://woocommerce.rshossain.com/wp-json/wp/v2/users/me';
  
  return this.http.get<any>(wpApiUrl, {
    headers: new HttpHeaders({
      'Authorization': authHeader
    }),
    withCredentials: true
  }).pipe(
    tap(wpUser => {
      // Store auth header for future requests
      this.storage.setItem('wp_auth_header', authHeader);
      
      const user: User = {
        id: wpUser.id,
        email: wpUser.email,
        first_name: wpUser.first_name || '',
        last_name: wpUser.last_name || '',
        username: wpUser.username,
        billing: { /* ... */ },
        shipping: { /* ... */ }
      };
      
      this.storage.setItem('currentUser', user);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSubject.next(true);
    }),
    catchError(error => {
      console.error('WordPress auth error:', error);
      return throwError(() => new Error('Invalid WordPress credentials'));
    })
  );
}
```

### Step 4: Update Auth Interceptor

Add Authorization header to all review API requests:

```typescript
// In auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(StorageService);
  
  // Check if this is a Custom Reviews API request
  if (req.url.includes('/wp-json/custom/v1/reviews')) {
    const wpAuthHeader = storage.getItem<string>('wp_auth_header');
    
    if (wpAuthHeader) {
      // Add WordPress Authorization header
      const authReq = req.clone({
        setHeaders: {
          'Content-Type': 'application/json',
          'Authorization': wpAuthHeader
        }
      });
      return next(authReq);
    }
  }
  
  // Default: just set content type
  const authReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
    }
  });

  return next(authReq);
};
```

### Step 5: Update API Service

```typescript
// In api.service.ts - Review methods
postReview<T>(endpoint: string, body: any): Observable<T> {
  const url = `${environment.reviewsApi}${endpoint}`;
  
  // No need to manually add Authorization here
  // The interceptor will add it automatically
  return this.http.post<T>(url, body, {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    }),
    withCredentials: true // Important for CORS
  });
}
```

## 🧪 Testing

### Test 1: Check if user is authenticated

```typescript
// In browser console after login:
localStorage.getItem('wp_auth_header');
// Should show: "Basic <base64-encoded-credentials>"
```

### Test 2: Create review

```typescript
// Your existing code should now work:
this.productService.submitReview(productId, review).subscribe({
  next: (result) => console.log('Success!', result),
  error: (err) => console.error('Error:', err)
});
```

## 📝 Login Form Instructions

Update your login form to show:
- **Username**: Your WordPress username (not email)
- **Password**: Use Application Password from WordPress Admin → Users → Your Profile

## 🔐 Security Notes

1. ✅ Application Passwords are safer than using your main WordPress password
2. ✅ You can revoke them anytime
3. ✅ Each app can have its own password
4. ⚠️ Never commit Application Passwords to Git
5. ⚠️ Use environment variables for production

## 🎯 Summary

**Before:**
- Login checked WooCommerce customers
- WordPress didn't know you were authenticated
- Review API returned 401 error

**After:**
- Login uses WordPress Application Password
- WordPress recognizes authentication
- Review API accepts requests ✅

---

**Created:** October 9, 2025
**Status:** Ready to implement
