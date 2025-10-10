# 🔄 .htaccess CORS Configuration - Before vs After

## ❌ BEFORE (Current - Broken)

```apache
# BEGIN CORS Headers for WooCommerce API
<IfModule mod_headers.c>
    # Allow requests from localhost during development
    Header always set Access-Control-Allow-Origin "*"  ❌ WILDCARD
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, Origin"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "3600"
    
    # Handle OPTIONS preflight requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
# END CORS Headers
```

**Problem:**
- Sends `Access-Control-Allow-Origin: *` to ALL requests
- Incompatible with `Access-Control-Allow-Credentials: true`
- Browser blocks requests with credentials
- Security violation per HTTP spec

---

## ✅ AFTER (Fixed)

```apache
# BEGIN CORS Headers for WooCommerce API - FIXED (No Wildcard)
<IfModule mod_headers.c>
    # Whitelist specific origins (no wildcard allowed with credentials)
    SetEnvIf Origin "^http://localhost:4200$" ORIGIN_MATCHED=http://localhost:4200
    SetEnvIf Origin "^http://localhost:5300$" ORIGIN_MATCHED=http://localhost:5300
    SetEnvIf Origin "^http://localhost:3000$" ORIGIN_MATCHED=http://localhost:3000
    SetEnvIf Origin "^https://rshossain\.com$" ORIGIN_MATCHED=https://rshossain.com
    SetEnvIf Origin "^https://www\.rshossain\.com$" ORIGIN_MATCHED=https://www.rshossain.com
    SetEnvIf Origin "^https://rshossain\.com/demo/ngwcommerce$" ORIGIN_MATCHED=https://rshossain.com/demo/ngwcommerce
    SetEnvIf Origin "^https://www\.rshossain\.com/demo/ngwcommerce$" ORIGIN_MATCHED=https://www.rshossain.com/demo/ngwcommerce
    
    # Set CORS headers only for whitelisted origins
    Header always set Access-Control-Allow-Origin "%{ORIGIN_MATCHED}e" env=ORIGIN_MATCHED  ✅
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, Origin, X-WP-Nonce"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "3600"
    
    # Handle OPTIONS preflight requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
# END CORS Headers
```

**Solution:**
- Checks request origin against whitelist
- Sets **specific origin** (not wildcard)
- Compatible with credentials
- Secure and compliant with HTTP spec

---

## 📊 Comparison Table

| Aspect | Before (Broken) | After (Fixed) |
|--------|----------------|---------------|
| **Header Value** | `*` (wildcard) | Specific origin |
| **With Credentials** | ❌ Not allowed | ✅ Allowed |
| **Security** | ❌ Less secure | ✅ More secure |
| **Browser Compliance** | ❌ Blocked | ✅ Accepted |
| **Whitelisting** | ❌ None | ✅ Origin whitelist |
| **Angular App** | ❌ CORS error | ✅ Works perfectly |

---

## 🔍 How It Works

### Before (Wildcard):
```
1. Browser sends request with Origin: http://localhost:5300
2. Server responds with: Access-Control-Allow-Origin: *
3. Browser sees credentials + wildcard
4. ❌ Browser blocks: "Wildcard not allowed with credentials"
```

### After (Whitelist):
```
1. Browser sends request with Origin: http://localhost:5300
2. Server checks: Is "http://localhost:5300" in whitelist?
3. Server responds with: Access-Control-Allow-Origin: http://localhost:5300
4. ✅ Browser accepts: "Specific origin matches, credentials allowed"
```

---

## 🎯 Key Changes

### 1. Origin Matching
```apache
# New: Check if origin is in whitelist
SetEnvIf Origin "^http://localhost:5300$" ORIGIN_MATCHED=http://localhost:5300
```

### 2. Conditional Header
```apache
# Old: Always send wildcard
Header always set Access-Control-Allow-Origin "*"

# New: Only send if origin matches
Header always set Access-Control-Allow-Origin "%{ORIGIN_MATCHED}e" env=ORIGIN_MATCHED
```

### 3. Added X-WP-Nonce
```apache
# New: Added WordPress nonce support
Access-Control-Allow-Headers: ... X-WP-Nonce
```

---

## 📝 To Add More Origins

Just add more `SetEnvIf` lines:

```apache
# Development
SetEnvIf Origin "^http://localhost:8080$" ORIGIN_MATCHED=http://localhost:8080

# Staging
SetEnvIf Origin "^https://staging\.yoursite\.com$" ORIGIN_MATCHED=https://staging.yoursite.com

# Production
SetEnvIf Origin "^https://yoursite\.com$" ORIGIN_MATCHED=https://yoursite.com
```

**Note:** Escape dots with backslash: `\.`

---

## ✅ Verification

### Test 1: Check Current Headers (Before Fix)
```bash
curl -X OPTIONS -H "Origin: http://localhost:5300" \
  -i https://woocommerce.rshossain.com/wp-json/custom/v1/reviews | grep -i "access-control"
```

**Current output:**
```
access-control-allow-origin: *  ❌
```

### Test 2: After Updating .htaccess
```bash
./test-cors.sh
```

**Expected output:**
```
✅ Correct: Access-Control-Allow-Origin: http://localhost:5300
✅ Correct: Access-Control-Allow-Credentials: true
```

---

## 🚀 Ready to Deploy

**Files ready:**
- ✅ Complete `.htaccess` file: `.htaccess-new`
- ✅ Just CORS section: `htaccess-cors-fix.txt`
- ✅ Step-by-step guide: `HTACCESS-FIX-GUIDE.md`
- ✅ Test script: `test-cors.sh`

**Action required:**
1. Upload `.htaccess-new` to WordPress server
2. Rename to `.htaccess`
3. Test with `./test-cors.sh`
4. Enjoy working reviews! 🎉

---

**Last Updated:** October 9, 2025  
**Status:** Solution Ready ✅
