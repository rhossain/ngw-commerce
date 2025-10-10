# 🔬 Quick Test Script

## Option 1: Use Debug Plugin (Recommended)

This will tell us EXACTLY what WordPress is receiving.

### Step 1: Upload Debug Plugin

1. I've created a special debug version: `custom-reviews-api-DEBUG.php`
2. **Do NOT delete the main plugin** (keep both active for now)
3. Upload just this one file via FTP:
   - Location: `/wp-content/plugins/custom-reviews-api/`
   - File: `custom-reviews-api-DEBUG.php`

### Step 2: Enable WordPress Debug

1. Edit `wp-config.php` (via FTP or cPanel)
2. Find: `define('WP_DEBUG', false);`
3. Replace with:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   @ini_set('display_errors', 0);
   ```
4. Save file

### Step 3: Submit Test Review

1. Go to your Angular app: http://localhost:5300
2. Navigate to any product
3. Submit review: "Debug test 1"
4. Rating: 5 stars

### Step 4: Check Debug Log

1. Via FTP/cPanel, open: `/wp-content/debug.log`
2. Look for this section:
   ```
   === REVIEW REQUEST DEBUG (Version 5.1) ===
   ```
3. **Copy the ENTIRE debug section** and send it to me

The log will show:
- ✅ All parameters WordPress received
- ✅ What the plugin is doing with them
- ✅ Why it's showing "Anonymous Customer"

---

## Option 2: Manual Verification

If you can't upload debug version:

### Check Current Plugin File

1. Via FTP, open: `/wp-content/plugins/custom-reviews-api/custom-reviews-api.php`
2. Search for: `wp_strip_all_tags`
3. **Is it found?** (Yes/No)
4. Search for: `$request->get_param('reviewer_name')`
5. **Is it found?** (Yes/No)
6. Check file size: **What size is it?** (should be ~25-30 KB)

### Check Plugin Version

1. WordPress Admin → Plugins
2. Find "Custom Reviews API with CORS Support"
3. **What version does it show?** (should be 5.0 or higher)

---

## Option 3: Complete Fresh Start

If nothing else works:

### Nuclear Option - Clean Slate

```bash
# Via FTP or cPanel File Manager:

1. Delete folder: /wp-content/plugins/custom-reviews-api/

2. Upload fresh ZIP via WordPress Admin:
   - Plugins → Add New → Upload Plugin
   - Choose: custom-reviews-api-FINAL.zip
   - Activate

3. Verify plugin version is 5.0

4. Clear ALL caches:
   - WordPress cache
   - Server cache (Hostinger control panel)
   - Browser cache (Ctrl+Shift+R)

5. Wait 5 minutes (seriously, set a timer)

6. Test review submission
```

---

## What to Send Me

Please provide **ANY** of these:

### Option A: Debug Log (Best!)
```
Copy from /wp-content/debug.log:
=== REVIEW REQUEST DEBUG (Version 5.1) ===
[paste everything between === markers]
```

### Option B: File Verification
```
1. custom-reviews-api.php file size: ___ KB
2. wp_strip_all_tags found: Yes/No
3. $request->get_param('reviewer_name') found: Yes/No
4. Plugin version in WordPress: ___
```

### Option C: Screenshot
```
Take screenshot showing:
1. Plugins page with version number
2. Review on WordPress site (showing the issue)
```

---

## 🎯 My Prediction

Based on everything, I believe:

**The plugin file on your server is the OLD version** (v4.0 or earlier)

Evidence:
- ✅ Angular sends correct data (console confirmed)
- ❌ WordPress shows "Anonymous Customer" and HTML tags
- ❌ Old version doesn't have `$request->get_param('reviewer_name')`
- ❌ Old version doesn't have `wp_strip_all_tags($review)`

**Solution:**
Complete fresh upload of custom-reviews-api-FINAL.zip

Let's verify this with the debug log! 🔍
