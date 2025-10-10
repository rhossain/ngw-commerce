# CORS Fix for withCredentials

## Problem

When using `withCredentials: true` in Angular HTTP requests, the CORS error occurs:

```
Access-Control-Allow-Origin header must not be the wildcard '*' 
when the request's credentials mode is 'include'
```

## Root Cause

- Angular sends `withCredentials: true` to include WordPress cookies
- WordPress plugin was using wildcard `Access-Control-Allow-Origin: *`
- **HTTP specification prohibits wildcards when credentials are included**

## Solution

Updated WordPress plugin to:
1. Read the `Origin` header from the request
2. Check if it's in the allowed origins list
3. Send back the **specific origin** instead of wildcard

### Code Changes

```php
// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// List of allowed origins
$allowed_origins = [
    'http://localhost:4200',
    'http://localhost:5300',
    'http://localhost:3000',
    'https://your-production-domain.com'
];

// Check if origin is allowed
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);  // Specific origin, not *
    header('Access-Control-Allow-Credentials: true');
}
```

## How It Works

1. **Browser sends preflight OPTIONS request:**
   ```
   Origin: http://localhost:5300
   Access-Control-Request-Method: POST
   ```

2. **Plugin checks origin against whitelist:**
   ```php
   if (in_array('http://localhost:5300', $allowed_origins))
   ```

3. **Plugin responds with specific origin:**
   ```
   Access-Control-Allow-Origin: http://localhost:5300
   Access-Control-Allow-Credentials: true
   ```

4. **Browser allows the actual request to proceed**

## Configuration

### Add Your Production Domain

Edit `custom-reviews-api.php` and update the allowed origins:

```php
$allowed_origins = [
    'http://localhost:4200',    // Angular default port
    'http://localhost:5300',    // Your custom port
    'http://localhost:3000',    // Alternative port
    'https://yourdomain.com',   // ADD YOUR PRODUCTION DOMAIN
    'https://www.yourdomain.com'
];
```

### For Development (All Localhost Ports)

If you want to allow all localhost ports during development:

```php
// Get the origin from the request
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Allow any localhost origin in development
if (strpos($origin, 'http://localhost:') === 0 || 
    strpos($origin, 'http://127.0.0.1:') === 0) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    // ... other headers
}
```

### For Production (Strict Whitelist)

```php
$allowed_origins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
];

if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}
```

## Testing

### 1. Update the Plugin

Upload the updated `custom-reviews-api.php` to:
```
/wp-content/plugins/custom-reviews-api/custom-reviews-api.php
```

### 2. Refresh WordPress (Optional)

```bash
# SSH into server
wp plugin deactivate custom-reviews-api
wp plugin activate custom-reviews-api

# Or just restart web server
sudo service apache2 restart
# or
sudo service nginx restart
```

### 3. Test in Angular App

```bash
# Clear browser cache
Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Open browser dev tools
# Go to product page
# Try to submit a review
# Check Console - should see no CORS errors
# Check Network tab - should see 200 OK responses
```

### 4. Verify CORS Headers

Check the response headers in browser dev tools:

```
✅ Access-Control-Allow-Origin: http://localhost:5300
✅ Access-Control-Allow-Credentials: true
✅ Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE
✅ Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
```

## Common Issues

### Issue: Still getting CORS error

**Solution:**
1. Verify your origin is in the `$allowed_origins` array
2. Check you're using the correct port (5300 in your case)
3. Clear browser cache completely
4. Restart web server after plugin update
5. Check WordPress error logs

### Issue: Works in dev but not production

**Solution:**
Add your production domain to `$allowed_origins`:
```php
$allowed_origins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com'
];
```

### Issue: OPTIONS request returns 200 but POST fails

**Solution:**
Check that both filter hooks are working:
- `rest_pre_serve_request` (main CORS headers)
- `rest_api_init` (OPTIONS preflight)

## Security Notes

✅ **Whitelist Only** - Only specified origins are allowed
✅ **No Wildcards** - Prevents unauthorized domains
✅ **Credentials Safe** - WordPress cookies only sent to allowed origins
✅ **Production Ready** - Easy to restrict to production domain only

## Files Modified

- `wordpress-plugin/custom-reviews-api.php` - Fixed CORS headers

## References

- [MDN: CORS with credentials](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#requests_with_credentials)
- [Fetch Standard](https://fetch.spec.whatwg.org/#cors-protocol-and-credentials)

---

**Issue:** CORS error with withCredentials
**Fix:** Specific origin instead of wildcard
**Status:** Fixed ✅
