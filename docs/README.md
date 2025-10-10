# Documentation Directory# Custom Reviews API - WordPress Plugin



This directory contains all project documentation, guides, and WordPress plugin files.A WordPress plugin that adds REST API endpoints for managing WooCommerce product reviews with **authentication required** for creating, editing, and deleting reviews.



## 📚 Contents## ⚡ Quick Install



### WordPress Plugin Files### Via WordPress Admin

- `custom-reviews-api.php` - Main WordPress plugin for custom reviews REST API

- `custom-reviews-api-DEBUG.php` - Debug version with extensive logging1. **Zip the plugin:**

- `cors-settings-admin.php` - Admin panel for managing CORS settings   ```bash

- `*.zip` - Plugin installation packages   cd wordpress-plugin

   zip custom-reviews-api.zip custom-reviews-api.php

### CORS Documentation   ```

- `CORS-FIXED.md` - CORS fix summary

- `CORS-TROUBLESHOOTING.md` - CORS troubleshooting guide2. **Upload in WordPress:**

- `DYNAMIC-CORS-CONFIG.md` - Dynamic CORS configuration guide   - Go to: Plugins → Add New → Upload Plugin

- `DYNAMIC-CORS-SETUP.md` - Setup instructions for dynamic CORS   - Choose `custom-reviews-api.zip`

- `HTACCESS-BEFORE-AFTER.md` - .htaccess changes comparison   - Click "Install Now" → "Activate"



### Admin Panel Documentation### Via FTP

- `ADMIN-PANEL-SUMMARY.md` - Admin panel overview

- `ADMIN-PANEL-VISUAL-GUIDE.md` - Visual guide with ASCII diagrams1. Upload `custom-reviews-api.php` to:

- `README-ADMIN-PANEL.md` - Admin panel README   ```

   /wp-content/plugins/custom-reviews-api/custom-reviews-api.php

### Review System Documentation   ```

- `REVIEWS-API-NOTES.md` - Review API implementation notes

- `REVIEWS-COMPLETE.md` - Complete review system documentation2. Activate in WordPress admin: **Plugins** → Find "Custom Reviews API" → Click "Activate"

- `REVIEW-AUTH-UPDATE.md` - Authentication updates for reviews

## 🔒 Authentication Model

### Troubleshooting & Fixes

- `404-DIAGNOSIS.md` - 404 error diagnosis guide### Public Access (No Login Required)

- `FIX-404-ERROR.md` - Quick fix for 404 errors- ✅ **View reviews** - Anyone can read reviews (Store API)

- `DIAGNOSTIC-GUIDE.md` - Comprehensive diagnostic guide

- `ISSUES-STILL-EXIST-GUIDE.md` - Guide for persistent issues### Requires Login (WordPress Authentication)

- `TROUBLESHOOTING-FIXES.md` - General troubleshooting- 🔐 **Create reviews** - Must be logged into WordPress

- `NEXT-CHECKS.md` - Next steps for debugging- 🔐 **Edit reviews** - Only review owner

- `QUICK-TEST.md` - Quick testing procedures- 🔐 **Delete reviews** - Only review owner (or admin)



### Product & Price Fixes## 📡 API Endpoints

- `PRICE-FIX-SUMMARY.md` - Price variation fix summary

- `PRICE-FIX-COMPLETE.md` - Complete price fix documentation### Create Review (POST) - Requires Login

- `FINAL-PRICE-VARIATION-FIX-SUMMARY.md` - Final price variation summary

- `TODO-PRICE-VARIATION-FIX.md` - Price variation TODO list```

- `VARIABLE-PRODUCT-SELECT-OPTIONS.md` - Variable product options guidePOST https://woocommerce.rshossain.com/wp-json/custom/v1/reviews

- `INLINE-VARIANT-SELECTION.md` - Inline variant selection```

- `METHOD-PARAMETERS-SOLUTION.md` - Method parameters solution

- `COMPUTED-GETTERS-SOLUTION.md` - Computed getters solution**Authentication:** WordPress cookies (sent automatically by Angular with `withCredentials: true`)



### Deployment**Request Body:**

- `DEPLOYMENT-CHECKLIST.md` - Production deployment checklist```json

{

## 🚀 Quick Links  "product_id": 24,

  "review": "Great product!",

### For WordPress Setup:  "rating": 5

1. Start with `README-ADMIN-PANEL.md`}

2. Follow `DYNAMIC-CORS-SETUP.md````

3. Use `ADMIN-PANEL-VISUAL-GUIDE.md` for UI guide

**Response (201):**

### For Troubleshooting:```json

1. Check `TROUBLESHOOTING-FIXES.md` first{

2. If 404 errors: `FIX-404-ERROR.md`  "success": true,

3. For CORS issues: `CORS-TROUBLESHOOTING.md`  "message": "Review submitted successfully",

4. For review issues: `ISSUES-STILL-EXIST-GUIDE.md`  "review": {

    "id": 123,

### For Development:    "product_id": 24,

1. Review system: `REVIEWS-COMPLETE.md`    "date_created": "2025-10-09 10:30:00",

2. Price variations: `FINAL-PRICE-VARIATION-FIX-SUMMARY.md`    "reviewer": "John Doe",

3. Product options: `VARIABLE-PRODUCT-SELECT-OPTIONS.md`    "reviewer_email": "john@example.com",

    "review": "Great product!",

## ⚠️ Note    "rating": 5,

    "verified": true,

This directory is excluded from version control via `.gitignore`. These are development/deployment documentation files and should not be committed to the repository.    "status": "approved",

    "user_id": 5

---  }

}

**Last Updated:** October 11, 2025  ```

**Project:** NGW Commerce (Angular + WooCommerce)

### Update Review (PUT) - Owner Only

```
PUT https://woocommerce.rshossain.com/wp-json/custom/v1/reviews/{id}
```

**Request Body:**
```json
{
  "review": "Updated review text",
  "rating": 4
}
```

### Delete Review (DELETE) - Owner Only

```
DELETE https://woocommerce.rshossain.com/wp-json/custom/v1/reviews/{id}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Review deleted successfully",
  "id": 123
}
```

## ✨ Features

✅ **WordPress Authentication** - Uses standard WordPress cookies  
✅ **Owner Verification** - Users can only edit/delete their own reviews  
✅ **Auto-fill User Data** - Name and email from WordPress account  
✅ **Verified Purchases** - Automatic from WooCommerce purchase data  
✅ **Duplicate Prevention** - One review per user per product  
✅ **Rating Calculation** - Automatic product rating updates  
✅ **CORS Support** - Works with Angular/React frontend  
✅ **Input Validation** - Full sanitization and validation  
✅ **Admin Override** - Admins can delete any review  

## 🛡️ Security

✅ **Authentication Required** - Only logged-in users can create/edit/delete  
✅ **Ownership Check** - Users can only modify their own reviews  
✅ **Input Sanitization** - All inputs sanitized with WordPress functions  
✅ **SQL Injection Safe** - Uses WordPress API functions  
✅ **XSS Prevention** - Proper escaping of all output  

## 📝 How It Works

### Review Submission Flow

```
1. User must be logged into WordPress
   ↓
2. Angular calls POST /custom/v1/reviews with withCredentials: true
   ↓
3. Plugin checks is_user_logged_in()
   ↓
4. Plugin gets user name/email from wp_get_current_user()
   ↓
5. Plugin validates product exists and allows reviews
   ↓
6. Plugin checks for duplicate (user already reviewed this product)
   ↓
7. Plugin creates comment with user_id
   ↓
8. Plugin adds rating metadata
   ↓
9. Plugin updates product rating average
   ↓
10. Returns review object with user_id
```

### Edit/Delete Flow

```
1. User clicks Edit/Delete on their review
   ↓
2. Angular calls PUT/DELETE /custom/v1/reviews/{id}
   ↓
3. Plugin checks is_user_logged_in()
   ↓
4. Plugin verifies comment.user_id === current_user.ID
   ↓
5. If match: Allow operation
6. If not: Return 403 Forbidden
```

## 🔧 Configuration

### CORS Origins (Important!)

The plugin uses a whitelist of allowed origins for security. **Add your domains here:**

**Edit `custom-reviews-api.php` around line 433:**
```php
### CORS Configuration

The plugin includes CORS headers to allow cross-origin requests from your Angular app. The `$allowed_origins` array is configured in two places:

```php
$allowed_origins = [
    'http://localhost:4200',
    'http://localhost:5300',
    'http://localhost:3000',
    'https://rshossain.com/demo/ngwcommerce',
    'https://www.rshossain.com/demo/ngwcommerce',
    'https://rshossain.com',
    'https://www.rshossain.com'
];
```

**To add more domains:**
1. Locate the `$allowed_origins` array in both CORS filter hooks (lines ~433 and ~468)
2. Add your production domain URLs
3. Include both www and non-www variants if needed
```

**Why This Matters:**
- When using `withCredentials: true`, you cannot use wildcard `*`
- WordPress specification requires exact origin match
- Prevents CORS errors in production

See **[CORS-FIX.md](../CORS-FIX.md)** for detailed explanation.

### Auto-Approve Reviews

By default, reviews are **auto-approved**. To require moderation:

**Edit `custom-reviews-api.php` line 104:**
```php
// Change from:
'comment_approved' => 1, // Auto-approve (current)

// To:
'comment_approved' => 0, // Require moderation
```

### Allow Admins to Delete Any Review

Already enabled! Admins can delete any review:

```php
// Line in delete function checks:
if (user_id !== current_user_id && !current_user_can('moderate_comments'))
```

## 🐛 Troubleshooting

### Issue: CORS error with withCredentials

**Error Message:**
```
Access-Control-Allow-Origin header must not be the wildcard '*' 
when the request's credentials mode is 'include'
```

**Solution:**
1. Add your domain to `$allowed_origins` array in plugin (line 433)
2. Make sure you're using the correct port (e.g., `http://localhost:5300`)
3. Upload updated plugin and clear browser cache
4. See **[CORS-FIX.md](../CORS-FIX.md)** for details

### Issue: 401 Unauthorized when submitting review

**Cause:** User not logged into WordPress, or cookies not being sent

**Solution:**
1. Verify user is logged into WordPress
2. Check Angular is using `withCredentials: true` in HTTP requests
3. Check CORS headers allow credentials
4. Test in same browser that's logged into WordPress

### Issue: 403 Forbidden when editing/deleting

**Cause:** User doesn't own the review

**Solution:**
1. Verify review `user_id` matches logged-in user ID
2. Check review was created by current user
3. Old anonymous reviews (user_id = 0) cannot be edited

### Issue: "You have already reviewed this product"

**Cause:** Duplicate prevention - user already has a review for this product

**Solution:**
1. This is expected behavior
2. User should edit existing review instead
3. To disable: Comment out lines 61-70 in plugin

## 📚 Documentation

- **[REVIEW-AUTH-UPDATE.md](../REVIEW-AUTH-UPDATE.md)** - Complete authentication guide
- **[PLUGIN-INSTALLATION.md](../PLUGIN-INSTALLATION.md)** - Detailed installation
- **[REVIEWS-COMPLETE.md](../REVIEWS-COMPLETE.md)** - Full implementation

## 🔄 Updating from Previous Version

If you had the anonymous review version:

### What Changed
- ❌ `reviewer` and `reviewer_email` parameters removed from POST
- ✅ Now uses WordPress user's name and email automatically
- ✅ Added PUT endpoint for editing reviews
- ✅ Added DELETE endpoint for deleting reviews
- ✅ Changed `permission_callback` to `is_user_logged_in`

### Migration
**Existing reviews are safe!**
- Old anonymous reviews (user_id = 0) remain visible
- Old reviews cannot be edited (no owner)
- New reviews require authentication

### Steps
1. Deactivate old plugin
2. Upload new plugin file
3. Activate new plugin
4. Test with logged-in WordPress user

## 📊 Database

### WordPress Tables Used

**wp_comments:**
- Stores review content
- `user_id` field links to WordPress user
- `comment_type = 'review'`

**wp_commentmeta:**
- Stores rating: `meta_key = 'rating'`

**wp_postmeta:**
- `_wc_average_rating` - Product average rating
- `_wc_rating_count` - Total number of ratings

## 🎯 Requirements

- WordPress 5.0+
- WooCommerce 3.0+
- PHP 7.4+
- Users must have WordPress accounts

## 📜 License

GPL v2 or later

## 👤 Author

Created for the ngw-commerce Angular + WooCommerce project

---

**Version:** 2.0.0 (Authentication Required)  
**Updated:** October 9, 2025  
**Status:** Production Ready 🚀
