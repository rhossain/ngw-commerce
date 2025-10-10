# 🚀 Dynamic CORS Setup - Quick Guide

## What's New?

You can now update allowed origins in **ONE file**, and both the WordPress plugin and `.htaccess` will use it!

---

## 📦 Files to Upload

### 1. Main Config File (MOST IMPORTANT)
```
Source: wordpress-plugin/wp-cors-config.php
Upload to: /wp-content/wp-cors-config.php
```

**This is your single source of truth!** Edit this file to add/remove origins.

---

### 2. Plugin Files
```
Source: wordpress-plugin/custom-reviews-api.php
Upload to: /wp-content/plugins/custom-reviews-api/custom-reviews-api.php

Source: wordpress-plugin/cors-admin-page.php
Upload to: /wp-content/plugins/custom-reviews-api/cors-admin-page.php

Source: wordpress-plugin/generate-htaccess-cors.php (optional)
Upload to: /wp-content/plugins/custom-reviews-api/generate-htaccess-cors.php

Source: wordpress-plugin/cors-check.php (optional)
Upload to: /wp-content/plugins/custom-reviews-api/cors-check.php
```

---

## 🎯 Setup Steps

### Step 1: Upload Config File ⭐

**Upload:** `wp-cors-config.php` → `/wp-content/wp-cors-config.php`

This file contains:
```php
$wp_cors_allowed_origins = [
    'http://localhost:4200',
    'http://localhost:5300',
    'http://localhost:3000',
    'https://rshossain.com',
    'https://www.rshossain.com',
    'https://rshossain.com/demo/ngwcommerce',
    'https://www.rshossain.com/demo/ngwcommerce',
];
```

---

### Step 2: Update Plugin

**Upload all plugin files to:** `/wp-content/plugins/custom-reviews-api/`

**Activate** in WordPress Admin → Plugins

---

### Step 3: Generate .htaccess Rules

**Go to:** WordPress Admin → **Tools → CORS Config**

You'll see:
1. **Current Allowed Origins** table
2. **Generated .htaccess Rules** textarea

**Copy** the generated rules (click "Copy to Clipboard" button)

---

### Step 4: Update .htaccess

**Edit:** `/public_html/.htaccess`

**Find this section:**
```apache
# BEGIN CORS Headers for WooCommerce API
... old hardcoded rules ...
# END CORS Headers
```

**Replace with** the rules you copied from admin page.

---

### Step 5: Test

```bash
cd /Users/bs1071/Documents/RnD/angular/ngw-commerce
./test-cors.sh
```

**Expected:**
```
✅ Correct: Access-Control-Allow-Origin: http://localhost:5300
✅ Correct: Access-Control-Allow-Credentials: true
```

---

## 🔄 How to Update Origins Later

### Scenario: Add a new production URL

**Step 1:** Edit `/wp-content/wp-cors-config.php`
```php
$wp_cors_allowed_origins = [
    'http://localhost:5300',
    'https://new-domain.com',  // ← Add here
];
```

**Step 2:** Save file

**Step 3:** WordPress plugin automatically uses new origin ✅

**Step 4:** Go to **Tools → CORS Config**

**Step 5:** Copy new .htaccess rules

**Step 6:** Paste into `.htaccess` file

**Done!** ✅

---

## 📊 Benefits

### Before (Hardcoded):
```
❌ Edit plugin file: custom-reviews-api.php
❌ Edit .htaccess file manually
❌ Easy to get out of sync
❌ Risk of typos in both places
```

### After (Dynamic):
```
✅ Edit ONE file: wp-cors-config.php
✅ Plugin reads automatically
✅ .htaccess rules auto-generated
✅ Always in sync
✅ No typos (copy-paste from admin)
```

---

## 🎨 WordPress Admin UI

### Access:
**WordPress Admin → Tools → CORS Config**

### Features:
- View all allowed origins in a table
- See which origins are active
- Auto-generate .htaccess rules
- One-click copy to clipboard
- Instructions on how to update

---

## 🧪 Testing

### Test Origin Changes:

1. **Current origins:**
   ```bash
   ./test-cors.sh
   # Shows: http://localhost:5300 ✅
   ```

2. **Add new origin to wp-cors-config.php:**
   ```php
   $wp_cors_allowed_origins = [
       'http://localhost:5300',
       'http://localhost:8080',  // New
   ];
   ```

3. **Test immediately (no plugin reactivation needed):**
   ```bash
   curl -H "Origin: http://localhost:8080" \
     https://woocommerce.rshossain.com/wp-json/custom/v1/reviews
   
   # Should work immediately! ✅
   ```

4. **Update .htaccess for Apache:**
   - Go to Tools → CORS Config
   - Copy new rules
   - Update .htaccess

---

## 📁 File Locations Summary

```
WordPress Root/
├── wp-content/
│   ├── wp-cors-config.php          ⭐ EDIT THIS TO UPDATE ORIGINS
│   └── plugins/
│       └── custom-reviews-api/
│           ├── custom-reviews-api.php     (reads config)
│           ├── cors-admin-page.php        (admin UI)
│           ├── generate-htaccess-cors.php (CLI tool)
│           └── cors-check.php             (helper)
└── .htaccess                        (paste generated rules)
```

---

## 🆘 Troubleshooting

### Problem: Admin page shows "File not found"

**Cause:** `wp-cors-config.php` not uploaded

**Fix:** Upload to `/wp-content/wp-cors-config.php`

---

### Problem: Plugin still uses old origins

**Cause:** `wp-cors-config.php` not found, using fallback

**Fix:** Check file location: `/wp-content/wp-cors-config.php`

---

### Problem: .htaccess not updated

**Cause:** Forgot to paste new rules

**Fix:** 
1. Go to Tools → CORS Config
2. Copy generated rules
3. Paste into `.htaccess`

---

### Problem: Can't access admin page

**Cause:** Not logged in as admin

**Fix:** Login with administrator account

---

## 🎉 Success Checklist

- [ ] Uploaded `wp-cors-config.php` to `/wp-content/`
- [ ] Uploaded all plugin files
- [ ] Activated plugin in WordPress
- [ ] Visited **Tools → CORS Config** admin page
- [ ] Saw allowed origins in table
- [ ] Copied generated .htaccess rules
- [ ] Updated `.htaccess` file
- [ ] Ran `./test-cors.sh` - shows correct origins
- [ ] Tested in Angular app - no CORS errors

---

## 📚 Documentation

- **Full guide:** `DYNAMIC-CORS-CONFIG.md`
- **Before/After:** `HTACCESS-BEFORE-AFTER.md`
- **Troubleshooting:** `CORS-TROUBLESHOOTING.md`
- **Testing:** `test-cors.sh`

---

**Last Updated:** October 9, 2025  
**Status:** Ready to Deploy ✅
