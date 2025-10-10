# 🚨 ERROR 404: No Route Found - Quick Fix

## What Happened

You got this error:
```
"rest_no_route"
"No route was found matching the URL and request method."
```

This means **WordPress doesn't see your REST API endpoint at all**.

## 🔍 Root Cause

When you uploaded via hPanel, one of these happened:
1. ❌ Files uploaded to wrong directory
2. ❌ WordPress didn't recognize the plugin
3. ❌ Plugin activated but routes not registered
4. ❌ Permalink/rewrite rules not flushed

## ✅ Quick Fix (3 Steps)

### Step 1: Verify File Location

**Via hPanel File Manager:**

1. Navigate to: `/public_html/wp-content/plugins/`
2. Look for folder: `custom-reviews-api`
3. Inside that folder, you should see:
   - `custom-reviews-api.php` (main file)
   - `cors-settings-admin.php` (admin page)

**If folder doesn't exist or files missing:**
- You uploaded to wrong location
- Solution: Upload again (see Step 2)

**If folder exists with both files:**
- Permissions might be wrong
- Check file permissions: Should be `644` for files, `755` for folders

---

### Step 2: Flush WordPress Permalinks (Critical!)

This is probably the issue! WordPress needs to rebuild its rewrite rules.

**Via WordPress Admin:**

1. Go to: **Settings** → **Permalinks**
2. **Don't change anything**
3. Just click: **"Save Changes"** button at bottom
4. This flushes rewrite rules and registers REST API routes
5. Done!

**Test immediately after:**
```
Visit: https://woocommerce.rshossain.com/wp-json/custom/v1/reviews

Should return: {"code":"rest_no_route"...}  ← This is OK for GET request
The route exists now!
```

---

### Step 3: Deactivate & Reactivate Plugin

**Via WordPress Admin:**

1. Go to: **Plugins** → **Installed Plugins**
2. Find: "Custom Reviews API"
3. Click: **Deactivate**
4. Wait 2 seconds
5. Click: **Activate**
6. You should see: "Plugin activated successfully"

---

## 🎯 Test the Fix

### Test 1: Check REST API Namespace

Visit this URL in your browser:
```
https://woocommerce.rshossain.com/wp-json/
```

**Look for this in the output:**
```json
{
  "name": "...",
  "namespaces": [
    "oembed/1.0",
    "wp/v2",
    "custom/v1"    ← Should see this!
  ]
}
```

**If you DON'T see "custom/v1":**
→ Plugin isn't loading properly

---

### Test 2: Check Specific Endpoint

Visit this URL:
```
https://woocommerce.rshossain.com/wp-json/custom/v1/reviews
```

**Expected Response (GET request):**
```json
{
  "code": "rest_no_route",
  "message": "No route was found...",
  "data": {"status": 404}
}
```

**This is GOOD!** It means:
- ✅ Route exists
- ✅ But GET method not allowed (we only allow POST)

**OR Expected Response (if GET is allowed):**
```json
{
  "code": "rest_forbidden",
  "message": "..."
}
```

Also good! Route exists.

---

### Test 3: Submit Review from Angular

1. Go to your Angular app: `http://localhost:5300`
2. Navigate to any product
3. Submit a test review
4. Check console for errors

**Expected:**
- ✅ 201 Created (success!)
- ❌ 404 rest_no_route (still broken - go to advanced fix)

---

## 🛠️ Advanced Fix (If Steps Above Didn't Work)

### Fix 1: Check Plugin File Headers

**Via hPanel File Manager:**

1. Open: `/public_html/wp-content/plugins/custom-reviews-api/custom-reviews-api.php`
2. Check the first lines:
   ```php
   <?php
   /**
    * Plugin Name: Custom Reviews API
    * Version: 1.0.0
    */
   ```

**If these lines are missing or corrupted:**
→ WordPress won't recognize it as a plugin!

**Solution:**
- Delete the file
- Re-upload from your local machine
- File location: `/Users/bs1071/Documents/RnD/angular/ngw-commerce/wordpress-plugin/custom-reviews-api.php`

---

### Fix 2: Check for PHP Errors

**Enable WordPress Debug:**

1. Via hPanel, open: `/public_html/wp-config.php`
2. Find: `define('WP_DEBUG', false);`
3. Change to:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   @ini_set('display_errors', 0);
   ```
4. Save file
5. Try to activate plugin again
6. Check: `/public_html/wp-content/debug.log` for errors

**Common Errors:**
- Syntax error → File corrupted during upload
- "Cannot redeclare function" → Duplicate functions
- "Class not found" → WooCommerce not active

---

### Fix 3: Verify WooCommerce is Active

The plugin requires WooCommerce!

**Via WordPress Admin:**

1. Go to: **Plugins** → **Installed Plugins**
2. Find: "WooCommerce"
3. Make sure it shows: **"Deactivate"** (meaning it's active)

**If WooCommerce is NOT active:**
→ Activate it first, then activate Custom Reviews API

---

### Fix 4: Check File Permissions

**Via hPanel File Manager:**

1. Right-click on: `/public_html/wp-content/plugins/custom-reviews-api/`
2. Choose: **Permissions** or **Change Permissions**
3. Folder should be: **755** (rwxr-xr-x)
4. Files should be: **644** (rw-r--r--)

**If permissions are wrong:**
→ WordPress can't read the files!

---

### Fix 5: Re-upload via WordPress Admin (Not hPanel)

Sometimes hPanel uploads can corrupt files. Try WordPress upload instead:

**Via WordPress Admin:**

1. Go to: **Plugins** → **Installed Plugins**
2. Find "Custom Reviews API" (if exists)
3. Click: **Deactivate** → **Delete**
4. Confirm deletion
5. Go to: **Plugins** → **Add New**
6. Click: **Upload Plugin**
7. Choose: `custom-reviews-api-FINAL.zip` from your computer
   - Location: `/Users/bs1071/Documents/RnD/angular/ngw-commerce/wordpress-plugin/custom-reviews-api-FINAL.zip`
8. Click: **Install Now**
9. Click: **Activate Plugin**
10. Go to: **Settings** → **Permalinks** → **Save Changes** (flush rules!)

---

## 📊 Diagnostic Checklist

Check each item:

### WordPress Admin Checks:
- [ ] Plugin appears in Plugins list
- [ ] Plugin shows as "Active" (not "Inactive")
- [ ] No error message shown on Plugins page
- [ ] Settings → CORS Settings page exists and loads
- [ ] WooCommerce is active

### File Location Checks (via hPanel):
- [ ] Folder exists: `/public_html/wp-content/plugins/custom-reviews-api/`
- [ ] File exists: `custom-reviews-api.php` (size ~25-30 KB)
- [ ] File exists: `cors-settings-admin.php` (size ~10-15 KB)
- [ ] Folder permissions: 755
- [ ] File permissions: 644

### REST API Checks (in browser):
- [ ] Visit: `https://woocommerce.rshossain.com/wp-json/`
- [ ] Response shows: `"custom/v1"` in namespaces array
- [ ] Visit: `https://woocommerce.rshossain.com/wp-json/custom/v1/reviews`
- [ ] Response is NOT "rest_no_route" (any other error is OK)

### Permalink Flush:
- [ ] Settings → Permalinks → Save Changes (done)

---

## 🎯 Most Likely Solution

Based on your error, **99% chance the fix is:**

```
WordPress Admin → Settings → Permalinks → Save Changes
```

This flushes the rewrite rules and registers your REST API endpoints.

**Try this first!** Then test by visiting:
```
https://woocommerce.rshossain.com/wp-json/custom/v1/reviews
```

---

## 💬 What to Tell Me

If still not working after trying the above, please share:

1. **Visit this URL and copy the output:**
   ```
   https://woocommerce.rshossain.com/wp-json/
   ```
   Paste the full JSON response

2. **Check this:**
   - Does "custom/v1" appear in the namespaces list? (Yes/No)

3. **Plugin Status:**
   - Is plugin shown as "Active" in WordPress? (Yes/No)
   - Any error messages? (copy the message)

4. **File Verification:**
   - File path in hPanel: (screenshot or full path)
   - File size of custom-reviews-api.php: _____ KB

This will tell me exactly what's wrong! 🔍

---

**Created:** October 9, 2025  
**Issue:** 404 rest_no_route  
**Solution:** Flush permalinks + verify plugin activation  
**Status:** Ready to Fix 🚀
