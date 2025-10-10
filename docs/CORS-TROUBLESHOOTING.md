# 🔥 CORS Troubleshooting - Wildcard `*` Issue

## ❌ Current Error
```
The value of the 'Access-Control-Allow-Origin' header in the response 
must not be the wildcard '*' when the request's credentials mode is 'include'.
```

**This means:** Something is still sending `Access-Control-Allow-Origin: *` even though our plugin sends specific origins.

---

## ✅ Updated Plugin - Triple Protection

The updated `custom-reviews-api.php` now has **3 layers** of CORS protection:

### 1. **Remove Default WordPress CORS** (Priority 5)
```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
}, 5);
```

### 2. **Early CORS Headers** (Priority 1 - RUNS FIRST)
```php
add_action('send_headers', function() {
    // Removes any existing wildcard headers
    header_remove('Access-Control-Allow-Origin');
    
    // Sets specific origin
    header('Access-Control-Allow-Origin: ' . $origin, true);
}, 1);
```

### 3. **Late CORS Headers** (Priority 99 - RUNS LAST)
```php
add_filter('rest_pre_serve_request', function(...) {
    // Double-checks and forces correct header
    header_remove('Access-Control-Allow-Origin');
    header('Access-Control-Allow-Origin: ' . $origin, true);
}, 99, 4);
```

---

## 🔍 Step-by-Step Diagnosis

### Step 1: Update and Reactivate Plugin ⚠️

**CRITICAL:** You must update the plugin file on your WordPress server!

```bash
# Option A: WordPress Admin
1. Deactivate "Custom Reviews API"
2. Delete the plugin
3. Upload new custom-reviews-api.php
4. Activate

# Option B: FTP/cPanel
1. Replace /wp-content/plugins/custom-reviews-api/custom-reviews-api.php
2. Go to WordPress → Plugins
3. Deactivate → Reactivate
```

---

### Step 2: Check .htaccess File

**Location:** `[WordPress Root]/.htaccess`

**Look for these lines:**
```apache
# BAD - Remove these:
Header set Access-Control-Allow-Origin "*"
Header add Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Origin "*"

# BAD - Or variations:
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>
```

**If found:** Comment them out or delete them:
```apache
# Header set Access-Control-Allow-Origin "*"
```

---

### Step 3: Check Other WordPress Plugins

These plugins often add CORS headers (sometimes with wildcard):

- ☑️ **WP CORS** - Disable or configure
- ☑️ **CORS Headers** - Disable
- ☑️ **All In One WP Security** - Check firewall settings
- ☑️ **Wordfence** - Check if blocking/modifying headers
- ☑️ **iThemes Security** - Check advanced settings
- ☑️ **Any CORS plugin** - Disable for testing

**How to test:**
1. Go to WordPress → Plugins
2. Deactivate ALL plugins except:
   - WooCommerce
   - Custom Reviews API
3. Test if CORS works
4. Reactivate plugins one by one to find the culprit

---

### Step 4: Check Server Configuration

#### Apache (.htaccess in root)
**Location:** `/public_html/.htaccess` or `/www/.htaccess`

Check for:
```apache
Header set Access-Control-Allow-Origin "*"
```

#### Nginx (server config)
**Location:** `/etc/nginx/sites-available/your-site`

Check for:
```nginx
add_header Access-Control-Allow-Origin *;
```

#### cPanel/Hosting Control Panel
- Some hosts add CORS headers via control panel
- Check: cPanel → Apache Configuration → Include Editor
- Look for CORS-related directives

---

### Step 5: Check CDN/Proxy (Cloudflare, etc.)

If using Cloudflare or similar:

1. **Cloudflare Dashboard:**
   - Go to your domain
   - Click "Rules" → "Transform Rules"
   - Check for CORS header modifications

2. **Temporary Bypass Test:**
   - Add this to your local `/etc/hosts`:
     ```
     [Your Server IP] woocommerce.rshossain.com
     ```
   - This bypasses CDN to test directly

---

## 🧪 Testing Commands

### Test 1: Check Response Headers (Terminal)

```bash
# Test OPTIONS preflight
curl -X OPTIONS \
  -H "Origin: http://localhost:5300" \
  -H "Access-Control-Request-Method: POST" \
  -i \
  https://woocommerce.rshossain.com/wp-json/custom/v1/reviews

# Look for:
# ✅ Access-Control-Allow-Origin: http://localhost:5300
# ❌ Access-Control-Allow-Origin: *
```

### Test 2: Check POST Request Headers

```bash
# Test actual POST (requires auth cookie)
curl -X POST \
  -H "Origin: http://localhost:5300" \
  -H "Content-Type: application/json" \
  -i \
  https://woocommerce.rshossain.com/wp-json/custom/v1/reviews

# Look for:
# ✅ Access-Control-Allow-Origin: http://localhost:5300
# ✅ Access-Control-Allow-Credentials: true
# ❌ Access-Control-Allow-Origin: *
```

### Test 3: Browser DevTools

```javascript
// 1. Open browser console on your Angular app
// 2. Run this:

fetch('https://woocommerce.rshossain.com/wp-json/custom/v1/reviews', {
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5300',
    'Access-Control-Request-Method': 'POST'
  }
})
.then(response => {
  console.log('Headers:', [...response.headers.entries()]);
  // Check for Access-Control-Allow-Origin value
});
```

---

## 🎯 Expected Headers (Correct)

When testing from `http://localhost:5300`, you should see:

```
Access-Control-Allow-Origin: http://localhost:5300  ✅
Access-Control-Allow-Credentials: true  ✅
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS  ✅
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce  ✅
```

**NOT:**
```
Access-Control-Allow-Origin: *  ❌ WRONG
```

---

## 🔧 Quick Fixes by Scenario

### Scenario A: Plugin Not Updated
**Symptom:** Still getting wildcard after "updating"  
**Fix:** Plugin file not actually replaced on server
```bash
1. SSH/FTP to server
2. Check file: /wp-content/plugins/custom-reviews-api/custom-reviews-api.php
3. Look for line ~430: should have "header_remove('Access-Control-Allow-Origin')"
4. If not found, upload new version
```

### Scenario B: .htaccess Override
**Symptom:** Headers correct in curl, wrong in browser  
**Fix:** .htaccess adding wildcard after plugin
```bash
1. Edit /public_html/.htaccess
2. Find and remove: Header set Access-Control-Allow-Origin "*"
3. Clear browser cache
```

### Scenario C: Another Plugin Conflict
**Symptom:** Works when all plugins disabled  
**Fix:** Find conflicting plugin
```bash
1. Disable all plugins except WooCommerce + Custom Reviews API
2. Test - if works, it's another plugin
3. Enable plugins one by one
4. When error returns, you found the culprit
```

### Scenario D: Server/CDN Override
**Symptom:** Curl shows wildcard, even with updated plugin  
**Fix:** Server config or CDN is overriding
```bash
1. Check server config (Apache/Nginx)
2. Contact hosting support
3. Or bypass CDN temporarily to test
```

---

## 📊 Diagnosis Flowchart

```
1. Update plugin on WordPress server
   └─ Test → Still fails?
      
2. Check browser DevTools → Network → Response Headers
   └─ See "Access-Control-Allow-Origin: *"?
      
3. Test with curl (see commands above)
   ├─ curl shows correct header → Browser cache issue
   │  └─ Hard refresh (Cmd+Shift+R) or clear cache
   │
   └─ curl shows wildcard → Server/plugin issue
      ├─ Check .htaccess
      ├─ Disable other plugins
      └─ Check server config
```

---

## 🆘 Still Not Working?

### Debug Mode - Add to Plugin

Add this at the **very end** of `custom-reviews-api.php`:

```php
// TEMPORARY DEBUG - REMOVE IN PRODUCTION
add_action('send_headers', function() {
    error_log('CORS Debug - Request URI: ' . $_SERVER['REQUEST_URI']);
    error_log('CORS Debug - Origin: ' . ($_SERVER['HTTP_ORIGIN'] ?? 'none'));
    error_log('CORS Debug - Method: ' . $_SERVER['REQUEST_METHOD']);
}, 999);
```

Check WordPress error log:
```bash
# Usually located at:
/wp-content/debug.log
# or
/var/log/apache2/error.log
```

---

## 📞 Need More Help?

If still failing after all steps:

1. **Check PHP Version:** Requires PHP 7.4+
   ```bash
   php -v
   ```

2. **Check Apache Modules:**
   ```bash
   apache2ctl -M | grep headers
   # Should show: headers_module
   ```

3. **WordPress Debug Mode:**
   Edit `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

4. **Share cURL Output:**
   Run the cURL command from "Testing Commands" and share the output

---

**Last Updated:** January 2025  
**Plugin Version:** Enhanced with triple CORS protection
