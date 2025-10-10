# Custom Reviews API Plugin - Installation Guide

## 🎯 Purpose

This WordPress plugin adds a public REST API endpoint that allows your Angular app to submit product reviews **without requiring user authentication**. This solves the issue where the WooCommerce Store API doesn't support creating reviews.

## 📦 What's Included

**File:** `wordpress-plugin/custom-reviews-api.php`
- Custom REST API endpoint: `POST /wp-json/custom/v1/reviews`
- Public access (no authentication required)
- Full validation and sanitization
- Automatic rating calculations
- Duplicate review prevention
- CORS support for cross-origin requests

## 🚀 Installation Instructions

### Option 1: Via WordPress Admin Panel (Recommended)

1. **Locate the Plugin File**
   - In your project: `wordpress-plugin/custom-reviews-api.php`

2. **Create Plugin ZIP**
   ```bash
   cd wordpress-plugin
   zip custom-reviews-api.zip custom-reviews-api.php
   ```

3. **Upload to WordPress**
   - Log into your WordPress admin panel: `https://woocommerce.rshossain.com/wp-admin`
   - Go to **Plugins → Add New → Upload Plugin**
   - Click "Choose File" and select `custom-reviews-api.zip`
   - Click "Install Now"
   - Click "Activate Plugin"

### Option 2: Via FTP/File Manager

1. **Connect to your server** via FTP (FileZilla, Cyberduck) or use cPanel File Manager

2. **Navigate to plugins directory**
   ```
   /public_html/wp-content/plugins/
   ```

3. **Create plugin folder**
   ```
   /public_html/wp-content/plugins/custom-reviews-api/
   ```

4. **Upload the file**
   - Copy `custom-reviews-api.php` to:
   ```
   /public_html/wp-content/plugins/custom-reviews-api/custom-reviews-api.php
   ```

5. **Activate in WordPress**
   - Go to **Plugins** in WordPress admin
   - Find "Custom Reviews API"
   - Click "Activate"

### Option 3: Via SSH/Terminal (Advanced)

```bash
# SSH into your server
ssh user@woocommerce.rshossain.com

# Navigate to plugins directory
cd /path/to/wordpress/wp-content/plugins/

# Create plugin directory
mkdir custom-reviews-api

# Upload file (from your local machine)
scp wordpress-plugin/custom-reviews-api.php user@woocommerce.rshossain.com:/path/to/wordpress/wp-content/plugins/custom-reviews-api/

# Or if you're already on the server, copy the file
# cp /path/to/custom-reviews-api.php /path/to/wordpress/wp-content/plugins/custom-reviews-api/

# Set proper permissions
chmod 644 custom-reviews-api.php

# Activate via WP-CLI (if available)
wp plugin activate custom-reviews-api
```

## ✅ Verification

### 1. Check Plugin is Active

Log into WordPress admin and go to **Plugins**. You should see:
- **Custom Reviews API** - Active
- Version: 1.0.0

### 2. Test the Endpoint

Open your browser or use `curl` to test:

```bash
# Test endpoint exists
curl -X POST https://woocommerce.rshossain.com/wp-json/custom/v1/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 24,
    "reviewer": "Test User",
    "reviewer_email": "test@example.com",
    "review": "This is a test review",
    "rating": 5
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "id": 123,
    "product_id": 24,
    "date_created": "2025-10-09 10:30:00",
    "reviewer": "Test User",
    "review": "This is a test review",
    "rating": 5,
    "verified": false,
    "status": "approved"
  }
}
```

### 3. Test in Angular App

1. **Refresh your Angular app** (clear cache if needed)
2. **Go to a product detail page**
3. **Click the "Reviews" tab**
4. **Fill out the review form:**
   - Name: Your Name
   - Email: your@email.com
   - Rating: Select stars
   - Review: Write a review
5. **Click "Submit Review"**
6. **Check for success message** and new review appearing

## 🔧 Configuration Options

### Auto-Approve Reviews

By default, reviews are **auto-approved**. To require moderation:

**Edit line 104 in `custom-reviews-api.php`:**
```php
// Change from:
'comment_approved' => 1, // Auto-approve

// To:
'comment_approved' => 0, // Require moderation
```

### Disable Duplicate Reviews

The plugin prevents users from reviewing the same product twice (based on email).

**To disable duplicate checking**, comment out lines 61-70:
```php
// Optional: Check for duplicate reviews (same email + product)
/*
$existing_reviews = get_comments([
    'post_id' => $product_id,
    'author_email' => $reviewer_email,
    'type' => 'review',
    'status' => 'approve',
    'number' => 1
]);

if (!empty($existing_reviews)) {
    return new WP_Error(
        'duplicate_review',
        'You have already reviewed this product',
        ['status' => 409]
    );
}
*/
```

### Add Review Moderation

To send reviews to moderation queue instead of auto-approving:

```php
'comment_approved' => 0, // Line 104
```

Then in WordPress admin, go to **Comments** to approve reviews manually.

## 🛡️ Security Features

✅ **Input Validation**
- Product ID must be valid integer
- Email must be valid format
- Rating must be 1-5
- All text fields sanitized

✅ **WordPress Security**
- Uses WordPress sanitization functions
- Prevents XSS attacks
- SQL injection protected

✅ **Business Rules**
- Verifies product exists
- Checks if reviews are enabled
- Prevents duplicate reviews
- Validates WooCommerce settings

✅ **CORS Headers**
- Allows cross-origin requests
- Supports preflight OPTIONS requests

## 🐛 Troubleshooting

### Issue: Plugin doesn't appear in WordPress

**Solution:**
1. Check file location: `/wp-content/plugins/custom-reviews-api/custom-reviews-api.php`
2. Check file permissions: `chmod 644 custom-reviews-api.php`
3. Check PHP syntax: `php -l custom-reviews-api.php`
4. Check WordPress error log: `/wp-content/debug.log`

### Issue: 404 Error when calling endpoint

**Solution:**
1. Make sure plugin is **activated** in WordPress
2. Flush permalinks: **Settings → Permalinks → Save Changes**
3. Check `.htaccess` file exists in WordPress root
4. Test: `https://woocommerce.rshossain.com/wp-json/custom/v1/reviews`

### Issue: "Product not found" error

**Solution:**
1. Verify product ID exists in WooCommerce
2. Check product is published (not draft)
3. Test with a different product ID

### Issue: "Reviews are disabled" error

**Solution:**
1. Go to **WooCommerce → Settings → Products**
2. Check "Enable product reviews" is enabled
3. Save changes

### Issue: CORS errors in browser console

**Solution:**
1. Plugin includes CORS headers automatically
2. If still failing, check server `.htaccess` file
3. May need to add CORS headers at server level

### Issue: Review submits but doesn't appear

**Check:**
1. WordPress Comments moderation settings
2. Review might be pending approval
3. Go to **WordPress Admin → Comments** to approve
4. Check if auto-approve is enabled (line 104)

## 📊 How It Works

### Review Submission Flow

```
1. User fills review form in Angular
   ↓
2. Angular calls: POST /wp-json/custom/v1/reviews
   ↓
3. Plugin validates all inputs
   ↓
4. Plugin checks product exists & reviews enabled
   ↓
5. Plugin checks for duplicate review
   ↓
6. Plugin creates WordPress comment
   ↓
7. Plugin adds rating metadata
   ↓
8. Plugin updates product rating average
   ↓
9. Plugin returns success response
   ↓
10. Angular displays success message
   ↓
11. Review appears in UI immediately
```

### Database Changes

**Comments Table** (`wp_comments`):
```sql
INSERT INTO wp_comments (
  comment_post_ID = 24,           -- Product ID
  comment_author = "John Doe",     -- Reviewer name
  comment_author_email = "john@...", -- Email
  comment_content = "Great!",      -- Review text
  comment_type = "review",         -- Type
  comment_approved = 1             -- Status
)
```

**Comment Meta** (`wp_commentmeta`):
```sql
INSERT INTO wp_commentmeta (
  comment_id = 123,
  meta_key = "rating",
  meta_value = 5
)
```

**Post Meta** (`wp_postmeta`):
```sql
UPDATE wp_postmeta 
SET meta_value = 4.5 
WHERE post_id = 24 
AND meta_key = "_wc_average_rating";

UPDATE wp_postmeta 
SET meta_value = 10 
WHERE post_id = 24 
AND meta_key = "_wc_rating_count";
```

## 🔄 Updating the Plugin

If you need to make changes:

1. **Edit the PHP file** on your local machine
2. **Re-upload via FTP** or WordPress admin
3. **Deactivate and reactivate** the plugin in WordPress
4. **Clear all caches** (WordPress, browser, CDN)

## 📝 API Documentation

### Endpoint

```
POST /wp-json/custom/v1/reviews
```

### Request Headers

```
Content-Type: application/json
```

### Request Body

```json
{
  "product_id": 24,              // Required: Integer, > 0
  "reviewer": "John Doe",         // Required: String, max 245 chars
  "reviewer_email": "john@x.com", // Required: Valid email
  "review": "Great product!",     // Required: String
  "rating": 5                     // Required: Integer, 1-5
}
```

### Success Response (201)

```json
{
  "success": true,
  "message": "Review submitted successfully",
  "review": {
    "id": 123,
    "product_id": 24,
    "date_created": "2025-10-09 10:30:00",
    "reviewer": "John Doe",
    "review": "Great product!",
    "rating": 5,
    "verified": false,
    "status": "approved"
  }
}
```

### Error Responses

**400 Bad Request** - Invalid input
```json
{
  "code": "rest_invalid_param",
  "message": "Invalid parameter(s): rating",
  "data": {
    "status": 400,
    "params": {
      "rating": "rating must be between 1 and 5"
    }
  }
}
```

**404 Not Found** - Product doesn't exist
```json
{
  "code": "product_not_found",
  "message": "Product not found",
  "data": {
    "status": 404
  }
}
```

**409 Conflict** - Duplicate review
```json
{
  "code": "duplicate_review",
  "message": "You have already reviewed this product",
  "data": {
    "status": 409
  }
}
```

**500 Internal Server Error** - Server error
```json
{
  "code": "review_creation_failed",
  "message": "Failed to create review",
  "data": {
    "status": 500
  }
}
```

## 🎉 Success!

Once installed, your Angular app can:
- ✅ Display reviews from Store API
- ✅ Submit new reviews via Custom API
- ✅ Update ratings automatically
- ✅ No authentication required
- ✅ Full validation and security

## 📞 Support

If you encounter issues:
1. Check WordPress error logs: `/wp-content/debug.log`
2. Enable WordPress debugging in `wp-config.php`:
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```
3. Check browser console for errors
4. Test endpoint directly with curl/Postman

## 🔗 Related Files

**Angular App:**
- `src/environments/environment.ts` - Added `reviewsApi` URL
- `src/app/core/services/api.service.ts` - Added `postReview()` method
- `src/app/core/services/product.service.ts` - Updated `addProductReview()`

**WordPress Plugin:**
- `wordpress-plugin/custom-reviews-api.php` - Main plugin file

**Documentation:**
- `STORE-API-IMPLEMENTATION.md` - Store API details
- `PLUGIN-INSTALLATION.md` - This file
