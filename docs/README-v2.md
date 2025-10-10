# Custom Reviews API - WordPress Plugin

**Version:** 2.0 (Dynamic CORS Configuration)  
**Requires:** WordPress 5.0+, WooCommerce 3.0+  
**License:** GPL v2 or later

---

## 🆕 What's New in v2.0

### Dynamic CORS Configuration ⭐

No more hardcoded URLs! Now uses a **centralized config file** for all allowed origins.

**Benefits:**
- ✅ Edit origins in ONE file only
- ✅ WordPress admin UI to manage CORS
- ✅ Auto-generate .htaccess rules
- ✅ Plugin auto-updates (no reactivation needed)

---

## 📦 Installation

### Files to Upload:

1. **Main config (REQUIRED):**
   ```
   wp-cors-config.php → /wp-content/wp-cors-config.php
   ```

2. **Plugin files:**
   ```
   /wp-content/plugins/custom-reviews-api/
   ├── custom-reviews-api.php
   ├── cors-admin-page.php
   ├── generate-htaccess-cors.php (optional)
   └── cors-check.php (optional)
   ```

3. **Activate** in WordPress Admin → Plugins

---

## 🎯 Quick Setup

### Step 1: Upload Config File

**File:** `wp-cors-config.php`  
**Location:** `/wp-content/wp-cors-config.php`

This file contains your allowed origins:
```php
$wp_cors_allowed_origins = [
    'http://localhost:4200',
    'http://localhost:5300',
    'https://yourdomain.com',
];
```

### Step 2: Activate Plugin

Upload plugin files and activate in WordPress admin.

### Step 3: Generate .htaccess Rules

1. Go to: **WordPress Admin → Tools → CORS Config**
2. Copy the generated `.htaccess` rules
3. Paste into your `/public_html/.htaccess` file

---

## 🔄 How to Update Origins

### Add a New Domain:

1. **Edit:** `/wp-content/wp-cors-config.php`
   ```php
   $wp_cors_allowed_origins = [
       'http://localhost:5300',
       'https://new-domain.com',  // ← Add here
   ];
   ```

2. **Save** file

3. **WordPress plugin automatically updates** ✅

4. **Update .htaccess** (one-time):
   - Go to: Tools → CORS Config
   - Copy new rules
   - Paste into `.htaccess`

**Done!** No plugin reactivation needed.

---

## 🎨 WordPress Admin Page

### Access:
**WordPress Admin → Tools → CORS Config**

### Features:

- **View Allowed Origins Table**
- **Auto-Generate .htaccess Rules**
- **One-Click Copy to Clipboard**
- **Step-by-Step Instructions**

---

## 📋 API Endpoints

### Create Review
```
POST /wp-json/custom/v1/reviews
```
**Authentication:** Required (WordPress login)  

### Update Review
```
PUT /wp-json/custom/v1/reviews/{id}
```
**Authentication:** Required (review owner only)  

### Delete Review
```
DELETE /wp-json/custom/v1/reviews/{id}
```
**Authentication:** Required (review owner only)

---

## 📚 Full Documentation

See the complete documentation in the parent directory:
- **DYNAMIC-CORS-SETUP.md** - Quick setup guide
- **DYNAMIC-CORS-CONFIG.md** - Detailed configuration
- **CORS-SUMMARY-DYNAMIC.md** - Complete overview

---

**Version:** 2.0  
**Last Updated:** October 9, 2025  
**Status:** Production Ready ✅
