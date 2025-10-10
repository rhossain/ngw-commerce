# 🎯 Dynamic CORS Configuration - Single Source of Truth

## Overview

Instead of hardcoding URLs in multiple places, you now have **ONE centralized configuration file** that manages all allowed origins.

### ✅ Benefits:
- **Update once** - change origins in one file
- **No more sync issues** - plugin and .htaccess both read from the same source
- **Easy management** - WordPress admin UI to view and generate rules
- **Version control friendly** - track changes to allowed origins

---

## 📁 File Structure

```
wp-content/
├── wp-cors-config.php              # ⭐ MAIN CONFIG - Edit this file only
└── plugins/
    └── custom-reviews-api/
        ├── custom-reviews-api.php  # Reads from wp-cors-config.php
        ├── cors-admin-page.php     # Admin UI for CORS management
        ├── generate-htaccess-cors.php  # CLI tool to generate .htaccess rules
        └── cors-check.php          # Helper for dynamic checks
```

---

## 🚀 Quick Start

### Step 1: Upload the Config File

**Upload:** `wp-cors-config.php` → `/wp-content/wp-cors-config.php`

This is your **single source of truth** for all allowed origins.

```php
$wp_cors_allowed_origins = [
    // Development
    'http://localhost:4200',
    'http://localhost:5300',
    'http://localhost:3000',
    
    // Production
    'https://rshossain.com',
    'https://www.rshossain.com',
    'https://rshossain.com/demo/ngwcommerce',
    'https://www.rshossain.com/demo/ngwcommerce',
];
```

---

### Step 2: Upload the Plugin

**Upload these files to:** `/wp-content/plugins/custom-reviews-api/`

- `custom-reviews-api.php` (main plugin)
- `cors-admin-page.php` (admin UI)
- `generate-htaccess-cors.php` (optional CLI tool)
- `cors-check.php` (helper file)

**Activate** the plugin in WordPress → Plugins

---

### Step 3: Generate .htaccess Rules

**Option A: WordPress Admin (Easiest)** ⭐

1. Go to: **Tools → CORS Config**
2. See current allowed origins
3. Copy the generated `.htaccess` rules
4. Paste into your `.htaccess` file (replace CORS section)

**Option B: Manual Edit**

Edit `.htaccess` and replace the CORS section with rules from the admin page.

---

## 📝 How to Add/Remove Origins

### To Add a New Origin:

1. **Edit:** `/wp-content/wp-cors-config.php`
   ```php
   $wp_cors_allowed_origins = [
       'http://localhost:4200',
       'https://new-domain.com',  // ← Add here
   ];
   ```

2. **Save** the file

3. **WordPress Plugin:** Automatically uses new origins ✅

4. **Update .htaccess:**
   - Go to: **Tools → CORS Config**
   - Copy new `.htaccess` rules
   - Update `.htaccess` file

**That's it!** No need to edit the plugin code.

---

### To Remove an Origin:

1. **Edit:** `/wp-content/wp-cors-config.php`
2. **Delete** or comment out the origin:
   ```php
   $wp_cors_allowed_origins = [
       'http://localhost:4200',
       // 'https://old-domain.com',  // ← Commented out
   ];
   ```

3. **Save** and regenerate `.htaccess` rules from admin page

---

## 🎨 WordPress Admin Page

### Features:

- **View all allowed origins** in a table
- **Auto-generate .htaccess rules** from config
- **One-click copy** to clipboard
- **Instructions** for updating origins

### Screenshots:

**Access:** WordPress Admin → Tools → CORS Config

**You'll see:**
```
┌─────────────────────────────────────────┐
│ Current Allowed Origins                 │
├────┬────────────────────────┬───────────┤
│ #  │ Origin                 │ Status    │
├────┼────────────────────────┼───────────┤
│ 1  │ http://localhost:5300  │ ✓ Active  │
│ 2  │ https://rshossain.com  │ ✓ Active  │
└────┴────────────────────────┴───────────┘

┌─────────────────────────────────────────┐
│ Generated .htaccess Rules               │
│                                         │
│ [Copy to Clipboard Button]             │
└─────────────────────────────────────────┘
```

---

## 🔧 How It Works

### 1. Plugin Reads Config
```php
// custom-reviews-api.php
require_once(WP_CONTENT_DIR . '/wp-cors-config.php');

// Now uses: wp_cors_is_origin_allowed($origin)
if (wp_cors_is_origin_allowed($origin)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
```

### 2. Admin Page Generates .htaccess Rules
```php
// cors-admin-page.php
$allowed_origins = wp_cors_get_allowed_origins();

foreach ($allowed_origins as $origin) {
    echo "SetEnvIf Origin \"^{$origin}$\" ORIGIN_MATCHED={$origin}\n";
}
```

### 3. .htaccess Uses Generated Rules
```apache
# .htaccess (paste from admin page)
SetEnvIf Origin "^http://localhost:5300$" ORIGIN_MATCHED=http://localhost:5300
SetEnvIf Origin "^https://rshossain\.com$" ORIGIN_MATCHED=https://rshossain.com
```

---

## 📊 Comparison: Before vs After

### ❌ Before (Hardcoded)

**Plugin:** `/plugins/custom-reviews-api/custom-reviews-api.php`
```php
$allowed_origins = [
    'http://localhost:5300',  // Hardcoded
    'https://rshossain.com',  // Hardcoded
];
```

**.htaccess:** `/public_html/.htaccess`
```apache
SetEnvIf Origin "^http://localhost:5300$" ...  # Hardcoded
SetEnvIf Origin "^https://rshossain\.com$" ... # Hardcoded
```

**Problem:** Need to edit 2 files, easy to get out of sync!

---

### ✅ After (Centralized)

**Config:** `/wp-content/wp-cors-config.php` ⭐
```php
$wp_cors_allowed_origins = [
    'http://localhost:5300',  // ← Edit here only!
    'https://rshossain.com',
];
```

**Plugin:** Reads from config ✅
```php
require_once(WP_CONTENT_DIR . '/wp-cors-config.php');
if (wp_cors_is_origin_allowed($origin)) { ... }
```

**.htaccess:** Generated from admin page ✅
```
Tools → CORS Config → Copy rules
```

**Benefit:** Update once, generate everywhere!

---

## 🧪 Testing

### Test 1: Check Plugin Uses Config

```bash
# After updating wp-cors-config.php
./test-cors.sh

# Should show origins from config file
✅ Correct: Access-Control-Allow-Origin: http://localhost:5300
```

### Test 2: Verify Admin Page

1. Go to: **WordPress Admin → Tools → CORS Config**
2. Should show origins from `wp-cors-config.php`
3. Click "Copy to Clipboard"
4. Paste somewhere - should see correct origins

### Test 3: Update Origin

1. Edit `wp-cors-config.php` → Add `http://localhost:8080`
2. Save file
3. Run: `./test-cors.sh`
4. Should work with new origin (no plugin reactivation needed!)
5. Go to admin page → Copy new `.htaccess` rules
6. Update `.htaccess`
7. Test with new origin ✅

---

## 📋 Workflow Example

**Scenario:** You want to add a staging environment

### Step-by-Step:

1. **Edit Config**
   ```bash
   # SSH or FTP to server
   nano /wp-content/wp-cors-config.php
   ```

2. **Add Staging URL**
   ```php
   $wp_cors_allowed_origins = [
       'http://localhost:5300',
       'https://staging.rshossain.com',  // ← New
       'https://rshossain.com',
   ];
   ```

3. **Save File**
   - WordPress plugin immediately uses new origin ✅

4. **Update .htaccess**
   - Go to: Tools → CORS Config
   - Copy generated rules
   - Paste into `.htaccess` file
   - Done! ✅

5. **Test**
   ```bash
   curl -H "Origin: https://staging.rshossain.com" \
     https://woocommerce.rshossain.com/wp-json/custom/v1/reviews
   
   # Should return: Access-Control-Allow-Origin: https://staging.rshossain.com
   ```

---

## 🚨 Important Notes

### Plugin Auto-Updates ✅
- WordPress plugin reads config file on every request
- **No need to reactivate** after changing config
- Changes take effect immediately for API endpoints

### .htaccess Needs Manual Update ⚠️
- `.htaccess` is static (Apache configuration)
- Must regenerate rules from admin page
- Copy and paste into `.htaccess` file
- This is a one-time step per config change

### Why Two Steps?
- **WordPress Plugin:** Can read PHP dynamically ✅
- **.htaccess:** Static Apache config, needs manual update
- **Trade-off:** Update once, paste once vs hardcoding in 2 places

---

## 🔐 Security Considerations

### 1. Config File Location
```
✅ Good: /wp-content/wp-cors-config.php (outside public_html)
❌ Bad:  /public_html/cors-config.php (publicly accessible)
```

### 2. File Permissions
```bash
# Set correct permissions
chmod 644 /wp-content/wp-cors-config.php
chown www-data:www-data /wp-content/wp-cors-config.php
```

### 3. Version Control
```bash
# .gitignore
wp-content/wp-cors-config.php  # Don't commit production URLs

# Use different config per environment
wp-cors-config.development.php
wp-cors-config.production.php
```

---

## 📚 Advanced Usage

### Environment-Specific Config

Create separate configs for dev/staging/prod:

```php
// wp-cors-config.php
if (defined('WP_ENVIRONMENT_TYPE')) {
    switch (WP_ENVIRONMENT_TYPE) {
        case 'development':
            $wp_cors_allowed_origins = [
                'http://localhost:4200',
                'http://localhost:5300',
            ];
            break;
        
        case 'staging':
            $wp_cors_allowed_origins = [
                'https://staging.rshossain.com',
            ];
            break;
        
        case 'production':
            $wp_cors_allowed_origins = [
                'https://rshossain.com',
                'https://www.rshossain.com',
            ];
            break;
    }
}
```

---

### CLI Tool (Optional)

Generate `.htaccess` rules from command line:

```bash
# SSH to server
cd /wp-content/plugins/custom-reviews-api

# Run generator
php generate-htaccess-cors.php > cors-rules.txt

# Copy output to .htaccess
cat cors-rules.txt
```

---

## 🎉 Summary

### What You Get:
- ✅ **One config file** for all origins
- ✅ **WordPress admin UI** to view and generate rules
- ✅ **Automatic plugin updates** when config changes
- ✅ **No more sync issues** between plugin and .htaccess
- ✅ **Easy to maintain** and version control

### What You Do:
1. **Edit:** `/wp-content/wp-cors-config.php` (add/remove origins)
2. **Copy:** Generated rules from **Tools → CORS Config**
3. **Paste:** Into `.htaccess` file
4. **Done!** Both plugin and .htaccess use the same origins

---

## 📞 Support

### Files Included:
- `wp-cors-config.php` - Main configuration file
- `custom-reviews-api.php` - Updated plugin
- `cors-admin-page.php` - Admin UI
- `generate-htaccess-cors.php` - CLI generator
- `DYNAMIC-CORS-CONFIG.md` - This documentation

### Quick Links:
- **View origins:** Tools → CORS Config
- **Test CORS:** `./test-cors.sh`
- **Troubleshooting:** `CORS-TROUBLESHOOTING.md`

---

**Last Updated:** October 9, 2025  
**Version:** 2.0 - Dynamic Configuration ✅
