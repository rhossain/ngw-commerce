# 🔧 Troubleshooting Guide - Issues Not Fixed

## ✅ Checklist - Complete These Steps in Order

### Step 1: Did You Upload the New WordPress Plugin?

**File:** `custom-reviews-api-v5-complete.zip`  
**Location:** `/Users/bs1071/Documents/RnD/angular/ngw-commerce/wordpress-plugin/`

**How to check:**
1. Go to WordPress Admin → Plugins
2. Check the plugin version or modification date
3. If it's still the old version, you need to:
   - Deactivate the old plugin
   - Delete it
   - Upload `custom-reviews-api-v5-complete.zip`
   - Activate it

### Step 2: Did You Restart Your Angular App?

**The Angular changes won't take effect until you restart!**

**How to restart:**
```bash
# In the terminal running your Angular app:
1. Press Ctrl+C (to stop the server)
2. Wait for it to fully stop
3. Run: npm start
4. Wait for "Compiled successfully"
5. Then test again
```

### Step 3: Clear Browser Cache

**Old JavaScript may be cached in your browser**

**How to clear:**
```
Option 1: Hard Refresh
- Windows/Linux: Ctrl + Shift + R
- Mac: Cmd + Shift + R

Option 2: Clear All Cache
- Open DevTools (F12)
- Right-click the Refresh button
- Select "Empty Cache and Hard Reload"

Option 3: Incognito/Private Window
- Test in a new incognito window
```

### Step 4: Check Browser Console

**Open DevTools and check what's being sent**

**How to check:**
1. Open your Angular app
2. Press F12 (open DevTools)
3. Go to "Network" tab
4. Submit a review
5. Find the POST request to `/reviews`
6. Click on it
7. Check "Request Payload" section

**What you should see:**
```json
{
  "product_id": 123,
  "review": "Test review",
  "rating": 5,
  "reviewer_name": "John Doe",
  "reviewer_email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com"
}
```

**If you DON'T see these fields, Angular didn't restart properly!**

### Step 5: Check WordPress Debug

**Check what the WordPress plugin is receiving**

**Add this to your plugin temporarily:**
```php
// In custom-reviews-api.php, add at the start of cra_create_product_review():
error_log('Review Request Data: ' . print_r($request->get_params(), true));
error_log('Reviewer Name: ' . $request->get_param('reviewer_name'));
error_log('Reviewer Email: ' . $request->get_param('reviewer_email'));
```

**Then check WordPress debug.log:**
```
Location: /wp-content/debug.log
```

## 🐛 Common Issues & Solutions

### Issue 1: Still Shows "Anonymous Customer"

**Possible Causes:**

❌ **Didn't restart Angular app**
```bash
Solution: Stop Angular (Ctrl+C) and restart (npm start)
```

❌ **Browser cached old JavaScript**
```bash
Solution: Hard refresh (Ctrl+Shift+R) or use incognito
```

❌ **Didn't upload new WordPress plugin**
```bash
Solution: Delete old plugin, upload custom-reviews-api-v5-complete.zip
```

❌ **currentUser is null/empty in Angular**
```bash
Check: Are you actually logged in to the Angular app?
Check localStorage: localStorage.getItem('currentUser')
Should show user data with first_name, last_name, email
```

### Issue 2: Still Shows HTML Tags

**Possible Causes:**

❌ **Didn't upload new WordPress plugin**
```bash
Solution: The plugin has wp_strip_all_tags() - must upload v5!
```

❌ **Old reviews still in database**
```bash
The fix only applies to NEW reviews.
Old reviews in database still have HTML.
Solution: Delete old test reviews and create new ones.
```

## 🧪 Step-by-Step Test Procedure

### Test 1: Verify Angular is Sending User Info

```bash
1. Open Angular app: http://localhost:5300
2. Login if not already logged in
3. Open DevTools (F12) → Console tab
4. Run this command:
   localStorage.getItem('currentUser')
   
Expected: Should show JSON with first_name, last_name, email
```

### Test 2: Verify Request Payload

```bash
1. DevTools → Network tab
2. Keep it open
3. Go to a product page
4. Write a review: "This is a test"
5. Submit review
6. In Network tab, click the POST /reviews request
7. Click "Payload" or "Request" tab

Expected: Should see reviewer_name, reviewer_email, etc.
```

### Test 3: Verify WordPress Response

```bash
1. After submitting review
2. In Network tab, same POST /reviews request
3. Click "Response" tab

Check the response:
{
  "success": true,
  "review": {
    "reviewer": "Your Name Here",  ← Should NOT be "Anonymous Customer"
    "review": "This is a test",     ← Should NOT have <p> tags
    ...
  }
}
```

## 📋 Quick Diagnostic Commands

### Check if Angular code is updated:
```bash
cd /Users/bs1071/Documents/RnD/angular/ngw-commerce
grep -n "reviewer_name:" src/app/features/products/product-detail/product-detail.component.ts
```
**Expected:** Should find line with `reviewer_name: `

### Check if plugin file is updated:
```bash
cd /Users/bs1071/Documents/RnD/angular/ngw-commerce/wordpress-plugin
grep -n "wp_strip_all_tags" custom-reviews-api.php
```
**Expected:** Should find the line with `wp_strip_all_tags()`

### Check localStorage in browser:
```javascript
// In browser console:
const user = JSON.parse(localStorage.getItem('currentUser'));
console.log('First Name:', user?.first_name);
console.log('Last Name:', user?.last_name);
console.log('Email:', user?.email);
```

## 🎯 Most Likely Issues (Check These First!)

### 1. ❌ Angular App Not Restarted
**THE #1 REASON!**
```bash
Stop: Ctrl+C
Start: npm start
Wait for "Compiled successfully"
```

### 2. ❌ Browser Cache
**THE #2 REASON!**
```bash
Hard Refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
Or use Incognito mode
```

### 3. ❌ Plugin Not Updated
**THE #3 REASON!**
```bash
Check: WordPress Admin → Plugins
Should be the v5 plugin (latest upload)
If not: Delete old, upload custom-reviews-api-v5-complete.zip
```

## 🆘 If Nothing Works

### Nuclear Option: Fresh Start

```bash
# 1. Stop Angular
Ctrl+C in terminal

# 2. Clear browser completely
- Close all browser tabs
- Clear all cache
- Restart browser

# 3. Clear Angular cache
cd /Users/bs1071/Documents/RnD/angular/ngw-commerce
rm -rf node_modules/.cache
rm -rf .angular

# 4. Restart Angular
npm start

# 5. In WordPress:
- Deactivate plugin
- Delete plugin completely
- Upload custom-reviews-api-v5-complete.zip fresh
- Activate

# 6. Test in Incognito window
```

## 📞 Report Back

**After following all steps above, tell me:**

1. Did you restart Angular? (Yes/No)
2. Did you clear browser cache? (Yes/No)
3. Did you upload v5 plugin? (Yes/No)
4. What does browser console show in Request Payload? (Copy/paste the JSON)
5. What does the WordPress response show? (Copy/paste the JSON)

**This will help me identify exactly what's wrong!**

---

**Created:** October 9, 2025  
**Purpose:** Debug why fixes aren't working  
**Key Point:** 90% of the time, it's because Angular wasn't restarted! 🔄
