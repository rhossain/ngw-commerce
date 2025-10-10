# 🔍 404 Error - Systematic Diagnosis

## Current Problem

URL returns 404:
```
https://woocommerce.rshossain.com/wp-json/custom/v1/reviews
```

This means the plugin's REST API routes are NOT registered in WordPress.

---

## ⚡ FIRST: Check if REST API is working at all

**Visit this URL in your browser:**
```
https://woocommerce.rshossain.com/wp-json/
```

### What you should see:

```json
{
  "name": "Your Site Name",
  "description": "...",
  "url": "https://woocommerce.rshossain.com",
  "home": "...",
  "namespaces": [
    "oembed/1.0",
    "wp/v2",
    "wc/v1",
    "wc/v2",
    "wc/v3",
    "custom/v1"    ← LOOK FOR THIS!
  ],
  "routes": {
    ...
  }
}
```

### ❓ Question for you:

**Do you see `"custom/v1"` in the namespaces array?**
- [ ] YES - I see "custom/v1"
- [ ] NO - I don't see "custom/v1"

---

## If you DON'T see "custom/v1"

This means the plugin is NOT loading properly. Here's why:

### Reason 1: Plugin not actually active
**Check:**
1. WordPress Admin → Plugins → Installed Plugins
2. Find "Custom Reviews API"
3. Does it show "Deactivate" button? (meaning it's active)

**If it shows "Activate":**
→ Plugin is NOT active! Click Activate.

---

### Reason 2: Files in wrong location
**Via hPanel File Manager, check:**

1. Navigate to: `/public_html/wp-content/plugins/`
2. Is there a folder called: `custom-reviews-api`?
3. Inside that folder, are there these 2 files:
   - `custom-reviews-api.php`
   - `cors-settings-admin.php`

**If folder or files missing:**
→ You uploaded to wrong location!

**Correct location should be:**
```
/public_html/
  wp-content/
    plugins/
      custom-reviews-api/          ← Folder name
        custom-reviews-api.php     ← Main file
        cors-settings-admin.php    ← Admin file
```

---

### Reason 3: Plugin file corrupted or incomplete
**Via hPanel, open the file:**
`/public_html/wp-content/plugins/custom-reviews-api/custom-reviews-api.php`

**Check the first 15 lines. Should look like:**
```php
<?php
/**
 * Plugin Name: Custom Reviews API
 * Plugin URI: https://github.com/rhossain/ngw-commerce
 * Description: Adds a custom REST API endpoint for submitting product reviews without authentication
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://github.com/rhossain
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: custom-reviews-api
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
```

**If these lines are missing or different:**
→ File is corrupted! Need to re-upload.

---

### Reason 4: PHP Fatal Error preventing plugin load
**Enable debug mode to see errors:**

1. Via hPanel, open: `/public_html/wp-config.php`
2. Find this line (usually near line 80):
   ```php
   define('WP_DEBUG', false);
   ```
3. Replace with:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   define('WP_DEBUG_DISPLAY', false);
   @ini_set('display_errors', 0);
   ```
4. Save the file
5. Try to activate the plugin again
6. Check for errors in: `/public_html/wp-content/debug.log`

**Common errors:**
- "Parse error" → Syntax error in file (file corrupted)
- "Cannot redeclare function" → Duplicate code
- "Class not found" → WooCommerce not active

---

### Reason 5: Permalinks not flushed
**This is the most common issue!**

1. WordPress Admin → Settings → Permalinks
2. **Don't change anything**
3. Just click "Save Changes" at the bottom
4. This forces WordPress to reload all REST API routes

**Then immediately test:**
```
https://woocommerce.rshossain.com/wp-json/
```

Check if "custom/v1" now appears!

---

## If you DO see "custom/v1"

But the endpoint still returns 404, then:

### Check the exact route registration

**Via hPanel, open:**
`/public_html/wp-content/plugins/custom-reviews-api/custom-reviews-api.php`

**Search for this text:** `register_rest_route`

**You should find (around line 69):**
```php
register_rest_route('custom/v1', '/reviews', [
    'methods' => 'POST',
    'callback' => 'cra_create_product_review',
    'permission_callback' => '__return_true',
]);
```

**If this code is NOT found:**
→ File is incomplete or wrong version!

---

## 🎯 Step-by-Step Fix Process

Follow these steps IN ORDER:

### Step 1: Verify Plugin Location
```
hPanel → File Manager → /public_html/wp-content/plugins/custom-reviews-api/

Check:
✓ Folder exists
✓ custom-reviews-api.php exists (size ~25-30 KB)
✓ cors-settings-admin.php exists (size ~10-15 KB)
```

### Step 2: Verify Plugin is Active
```
WordPress Admin → Plugins → Installed Plugins

Check:
✓ "Custom Reviews API" appears in list
✓ Shows "Deactivate" button (meaning active)
✓ No error messages
```

### Step 3: Flush Permalinks
```
WordPress Admin → Settings → Permalinks → Save Changes
```

### Step 4: Test REST API
```
Visit: https://woocommerce.rshossain.com/wp-json/

Look for: "custom/v1" in namespaces array
```

### Step 5: Test Endpoint
```
Visit: https://woocommerce.rshossain.com/wp-json/custom/v1/reviews

Should return: Something other than 404
(Even an error like "Invalid request" is OK - means route exists!)
```

---

## 🚨 Nuclear Option: Complete Re-upload

If nothing above works, do a complete fresh start:

### Via WordPress Admin (Recommended):

1. **Delete old plugin:**
   - Plugins → Find "Custom Reviews API"
   - Click "Deactivate"
   - Click "Delete"
   - Confirm deletion

2. **Delete via hPanel (double-check):**
   - File Manager → `/public_html/wp-content/plugins/`
   - If `custom-reviews-api` folder exists, DELETE IT

3. **Upload fresh via WordPress:**
   - Plugins → Add New → Upload Plugin
   - Choose: `custom-reviews-api-FINAL.zip` from your computer
   - Install Now
   - Activate Plugin

4. **Flush permalinks:**
   - Settings → Permalinks → Save Changes

5. **Test:**
   - Visit: `https://woocommerce.rshossain.com/wp-json/`
   - Look for "custom/v1"

---

## 📊 Information I Need

To help you further, please provide:

### 1. REST API Base Check:
Visit: `https://woocommerce.rshossain.com/wp-json/`

**Copy the entire response here** (or at least the "namespaces" array)

Example:
```json
{
  "namespaces": [
    "oembed/1.0",
    "wp/v2",
    "wc/v1",
    ...
  ]
}
```

### 2. Plugin Status:
- Is plugin shown as "Active" in WordPress? **[YES/NO]**
- Any error messages on Plugins page? **[Copy message or say "No errors"]**

### 3. File Verification (via hPanel):
- Does folder exist: `/public_html/wp-content/plugins/custom-reviews-api/` **[YES/NO]**
- File size of `custom-reviews-api.php`: **_____ KB**
- First line of file says: `<?php` **[YES/NO]**

### 4. Debug Log:
- Have you enabled WP_DEBUG? **[YES/NO]**
- If yes, any errors in `/public_html/wp-content/debug.log`? **[Copy errors]**

---

## 🎯 Most Likely Causes (In Order):

1. **Permalinks not flushed** (90% of cases)
   - Fix: Settings → Permalinks → Save Changes

2. **Plugin not actually active** (5% of cases)
   - Fix: Check Plugins page, activate if needed

3. **Files in wrong location** (3% of cases)
   - Fix: Verify path is `/public_html/wp-content/plugins/custom-reviews-api/`

4. **File corrupted during upload** (2% of cases)
   - Fix: Re-upload via WordPress Admin (not hPanel)

---

## ⏱️ Quick Test Right Now

**Do this immediately and tell me the result:**

1. Visit: `https://woocommerce.rshossain.com/wp-json/`
2. Copy/paste the full response (or just the "namespaces" part)
3. Tell me: Do you see "custom/v1" in the list?

This ONE test will tell me exactly what the problem is! 🎯

---

**Created:** October 11, 2025  
**Issue:** 404 on /wp-json/custom/v1/reviews  
**Next Step:** Check /wp-json/ base URL  
**Status:** Awaiting namespace check 🔍
