# 🔍 WordPress Plugin Diagnostic Guide

## Issue Summary
Reviews are submitting successfully (201 Created), but:
- ❌ Showing "Anonymous Customer" instead of "Robin Hossain"
- ❌ Showing HTML tags: `<p>Test review 3</p>`

## ✅ Confirmed Working
- Angular app sends correct data (console logs confirm):
  ```
  reviewer_name: "Robin Hossain"
  reviewer_email: "hossain.robin007@gmail.com"
  first_name: "Robin"
  last_name: "Hossain"
  ```
- CORS is working (no CORS errors)
- Authentication is working (201 Created responses)
- Plugin activates without errors

## ❌ Problem Identified
The WordPress plugin file on your server is **NOT** the latest version.

---

## 🎯 Solution: Fresh Upload with Verification

### Step 1: Complete Plugin Removal

**Via WordPress Admin:**
1. Go to **Plugins** → **Installed Plugins**
2. Find "Custom Reviews API with CORS Support"
3. Click **Deactivate**
4. Click **Delete** (this is important!)
5. Confirm deletion
6. Verify plugin is completely gone from the list

**Why this matters:** Simply overwriting files may not work if WordPress cached the old code.

---

### Step 2: Upload Fresh Plugin

**Option A: WordPress Admin (Recommended)**

1. Go to **Plugins** → **Add New**
2. Click **Upload Plugin** button at the top
3. Click **Choose File**
4. Select: `custom-reviews-api-FINAL.zip` 
   - Location: `/Users/bs1071/Documents/RnD/angular/ngw-commerce/wordpress-plugin/custom-reviews-api-FINAL.zip`
   - Size: **7.7KB** (verify this!)
5. Click **Install Now**
6. Wait for upload to complete
7. Click **Activate Plugin**

**Option B: FTP Upload (If WordPress upload fails)**

1. Connect to your server via FTP (FileZilla, Cyberduck, etc.)
2. Navigate to: `/wp-content/plugins/`
3. Create new folder: `custom-reviews-api`
4. Upload these 2 files to that folder:
   - `custom-reviews-api.php`
   - `cors-settings-admin.php`
5. Go to WordPress Admin → Plugins
6. Find "Custom Reviews API with CORS Support"
7. Click **Activate**

---

### Step 3: Verify Upload Success

**Check 1: Plugin Version**
1. Go to **Plugins** → **Installed Plugins**
2. Find "Custom Reviews API with CORS Support"
3. Check version: Should say **5.0** or higher
4. If it says 4.0 or lower → upload failed, try again

**Check 2: File Size (via FTP/cPanel)**
1. Connect to FTP or open cPanel File Manager
2. Navigate to: `/wp-content/plugins/custom-reviews-api/`
3. Check `custom-reviews-api.php` file size
4. Should be approximately **25-30 KB**
5. If it's smaller (like 15-20 KB) → old version still there

**Check 3: Code Verification**
1. Via FTP/cPanel, open: `/wp-content/plugins/custom-reviews-api/custom-reviews-api.php`
2. Search for this text: `wp_strip_all_tags`
3. Should find it around line 200-205
4. If NOT found → old version still there
5. Also search for: `$request->get_param('reviewer_name')`
6. Should find it around line 170-180
7. If NOT found → old version still there

---

### Step 4: Clear All Caches

**WordPress Cache:**
1. If you have a caching plugin (WP Super Cache, W3 Total Cache, etc.):
   - Go to plugin settings
   - Click "Clear Cache" or "Purge Cache"

**Server Cache (Hostinger):**
1. Log into Hostinger control panel
2. Go to **Advanced** → **Cache Manager**
3. Click **Clear Cache** or **Purge All**

**PHP OPcache (Important!):**
1. Via cPanel: **Software** → **Select PHP Version**
2. Click **Options** or **Extensions**
3. Find "opcache"
4. Toggle it OFF then ON
5. Or add this code to wp-config.php temporarily:
   ```php
   opcache_reset();
   ```

**Browser Cache:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or open DevTools → Network tab → Check "Disable cache"

---

### Step 5: Test Review Submission

**Submit a Test Review:**
1. Go to your Angular app: http://localhost:5300
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Navigate to a product page
5. Submit a review: "Test review 9"
6. Rating: 4 stars
7. Click Submit

**Check Console Output:**
Should see:
```
Current User Object: {first_name: "Robin", last_name: "Hossain", ...}
Reviewer Name: Robin Hossain
Review Request: {reviewer_name: "Robin Hossain", ...}
```

**Check Response:**
Should see 201 Created

**Check WordPress Site:**
1. Go to the product page on WordPress
2. Scroll to reviews section
3. Should now show:
   - ✅ **Robin Hossain** (not "Anonymous Customer")
   - ✅ **Test review 9** (not `<p>Test review 9</p>`)

---

## 🔍 Advanced Diagnostics

### If Issues Still Persist After Upload

**Enable WordPress Debug Logging:**

1. Open `wp-config.php` via FTP/cPanel
2. Find this line:
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
4. Save file
5. Submit a test review
6. Check: `/wp-content/debug.log` for errors

**Add Debug Logging to Plugin:**

1. Via FTP, open: `custom-reviews-api.php`
2. Find the `cra_create_product_review` function (around line 150)
3. Add these lines right after `function cra_create_product_review($request) {`:
   ```php
   // DEBUG: Log incoming request
   error_log('=== REVIEW REQUEST DEBUG ===');
   error_log('Product ID: ' . $request->get_param('product_id'));
   error_log('Rating: ' . $request->get_param('rating'));
   error_log('Review: ' . $request->get_param('review'));
   error_log('Reviewer Name: ' . $request->get_param('reviewer_name'));
   error_log('Reviewer Email: ' . $request->get_param('reviewer_email'));
   error_log('First Name: ' . $request->get_param('first_name'));
   error_log('Last Name: ' . $request->get_param('last_name'));
   error_log('=== END DEBUG ===');
   ```
4. Save file
5. Submit a test review
6. Check `/wp-content/debug.log`
7. Should see all the parameters logged

**Expected Log Output:**
```
=== REVIEW REQUEST DEBUG ===
Product ID: 22
Rating: 4
Review: Test review 9
Reviewer Name: Robin Hossain
Reviewer Email: hossain.robin007@gmail.com
First Name: Robin
Last Name: Hossain
=== END DEBUG ===
```

**If Log Shows Empty Values:**
```
Reviewer Name:          ← Empty!
Reviewer Email:         ← Empty!
```
This means WordPress is NOT receiving the parameters from Angular.

---

## 🚨 Troubleshooting Scenarios

### Scenario 1: Plugin Upload Fails

**Symptoms:**
- Upload button shows error
- "Plugin could not be uploaded"

**Solutions:**
1. Check file size limit in WordPress:
   - Go to **Media** → **Add New**
   - Check "Maximum upload file size"
   - If less than 8 MB, your file is fine
2. Try FTP upload instead (Option B above)
3. Check server disk space (Hostinger control panel)

---

### Scenario 2: Old Version Still Active

**Symptoms:**
- Upload succeeds but issues persist
- File size check shows old file (15-20 KB)
- Code verification doesn't find `wp_strip_all_tags`

**Solutions:**
1. **Complete manual removal:**
   - Via FTP, go to `/wp-content/plugins/`
   - Delete entire `custom-reviews-api` folder
   - Re-upload fresh files
   - Activate plugin in WordPress

2. **Check for duplicate plugins:**
   - Via FTP, check if there are multiple folders:
     - `/wp-content/plugins/custom-reviews-api/`
     - `/wp-content/plugins/custom-reviews-api-old/`
     - `/wp-content/plugins/custom-reviews-api-v4/`
   - Delete all versions
   - Upload only the FINAL version

---

### Scenario 3: Server Cache Issues

**Symptoms:**
- New plugin uploaded and verified
- Code looks correct
- But issues still persist

**Solutions:**
1. **Restart PHP-FPM (if available):**
   - Via Hostinger control panel
   - Advanced → PHP Config
   - Restart PHP service

2. **Contact Hostinger Support:**
   - Ask them to:
     - Clear server-side cache
     - Restart PHP-FPM
     - Clear OPcache
     - Verify file permissions

3. **Wait 5-10 minutes:**
   - Sometimes server cache takes time to expire
   - Make a coffee, come back, test again

---

### Scenario 4: WordPress REST API Cache

**Symptoms:**
- Plugin code is correct
- Debug logs show correct parameters
- But frontend still shows old data

**Solutions:**
1. **Clear WordPress transients:**
   - Via phpMyAdmin or cPanel → MySQL
   - Run query:
     ```sql
     DELETE FROM wp_options WHERE option_name LIKE '%transient%';
     ```

2. **Flush WordPress rewrite rules:**
   - Go to **Settings** → **Permalinks**
   - Click **Save Changes** (don't change anything)
   - This flushes rewrite rules and REST API cache

---

## 📊 Verification Checklist

Use this checklist to confirm everything is correct:

### Before Upload:
- [ ] custom-reviews-api-FINAL.zip file size is 7.7KB
- [ ] ZIP contains 2 files: custom-reviews-api.php and cors-settings-admin.php
- [ ] Extracted custom-reviews-api.php locally shows version 5.0

### After Upload:
- [ ] Old plugin completely deleted (not just deactivated)
- [ ] New plugin uploaded successfully
- [ ] Plugin activated without errors
- [ ] Plugin list shows version 5.0 or higher
- [ ] File size on server is ~25-30 KB (checked via FTP)
- [ ] Code verification: `wp_strip_all_tags` found in file
- [ ] Code verification: `$request->get_param('reviewer_name')` found in file

### After Cache Clear:
- [ ] WordPress cache cleared (if applicable)
- [ ] Server cache cleared (Hostinger)
- [ ] OPcache cleared/reset
- [ ] Browser cache cleared (hard refresh)
- [ ] Waited 2-3 minutes

### After Test:
- [ ] Angular console shows correct user data
- [ ] Review submission returns 201 Created
- [ ] WordPress site shows reviewer name: "Robin Hossain"
- [ ] WordPress site shows plain text review (no HTML tags)
- [ ] No errors in browser console
- [ ] No errors in WordPress debug.log

---

## 🎯 Quick Fix Summary

If you just want the quickest path to resolution:

```
1. WordPress Admin → Plugins → Delete "Custom Reviews API"
2. Plugins → Add New → Upload → custom-reviews-api-FINAL.zip
3. Activate plugin
4. Clear all caches (WordPress, server, browser)
5. Wait 2 minutes
6. Test review submission
7. Check if name shows correctly
```

**If still fails:**
```
8. Enable debug logging (see above)
9. Check /wp-content/debug.log
10. Share log output with me
```

---

## 📞 What to Tell Me If Issues Persist

Please provide:

1. **Plugin Upload Confirmation:**
   - Screenshot of Plugins page showing version
   - File size of custom-reviews-api.php on server

2. **Code Verification:**
   - Search result: Is `wp_strip_all_tags` found in the file? (Yes/No)
   - Search result: Is `$request->get_param('reviewer_name')` found? (Yes/No)

3. **Debug Log Output:**
   - Enable debug logging (see above)
   - Submit test review
   - Copy lines from `/wp-content/debug.log`

4. **Review Output:**
   - Screenshot of review on WordPress site
   - What name does it show?
   - Does it show HTML tags?

5. **Cache Status:**
   - Did you clear WordPress cache? (Yes/No)
   - Did you clear server cache? (Yes/No)
   - Did you hard refresh browser? (Yes/No)

---

**Last Updated:** October 9, 2025  
**Version:** FINAL Diagnostic  
**Status:** Ready for Deployment 🚀
