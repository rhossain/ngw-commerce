# 🔧 .htaccess CORS Fix - Step by Step Guide

## 🎯 Problem Identified

Your `.htaccess` file has this problematic section:
```apache
Header always set Access-Control-Allow-Origin "*"  ❌ WILDCARD
Header always set Access-Control-Allow-Credentials "true"
```

This is **incompatible** because:
- Wildcard `*` cannot be used when credentials mode is `include`
- Your Angular app uses `withCredentials: true` for authentication
- Browser blocks the request due to security policy

---

## ✅ Solution: Replace Wildcard with Origin Whitelist

### Step 1: Backup Current .htaccess

**IMPORTANT:** Always backup before editing!

```bash
# Via SSH/FTP
cp /public_html/.htaccess /public_html/.htaccess.backup

# Or via Hostinger hPanel
# File Manager → Right-click .htaccess → Download
```

---

### Step 2: Update .htaccess File

**Location:** `/public_html/.htaccess` (WordPress root directory)

**Find this section (around line 40):**
```apache
# BEGIN CORS Headers for WooCommerce API
<IfModule mod_headers.c>
    # Allow requests from localhost during development
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, Origin"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "3600"
    
    # Handle OPTIONS preflight requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
# END CORS Headers
```

**Replace with:**
```apache
# BEGIN CORS Headers for WooCommerce API - FIXED (No Wildcard)
<IfModule mod_headers.c>
    # Whitelist specific origins (no wildcard allowed with credentials)
    SetEnvIf Origin "^http://localhost:4200$" ORIGIN_MATCHED=http://localhost:4200
    SetEnvIf Origin "^http://localhost:5300$" ORIGIN_MATCHED=http://localhost:5300
    SetEnvIf Origin "^http://localhost:3000$" ORIGIN_MATCHED=http://localhost:3000
    SetEnvIf Origin "^https://rshossain\.com$" ORIGIN_MATCHED=https://rshossain.com
    SetEnvIf Origin "^https://www\.rshossain\.com$" ORIGIN_MATCHED=https://www.rshossain.com
    SetEnvIf Origin "^https://rshossain\.com/demo/ngwcommerce$" ORIGIN_MATCHED=https://rshossain.com/demo/ngwcommerce
    SetEnvIf Origin "^https://www\.rshossain\.com/demo/ngwcommerce$" ORIGIN_MATCHED=https://www.rshossain.com/demo/ngwcommerce
    
    # Set CORS headers only for whitelisted origins
    Header always set Access-Control-Allow-Origin "%{ORIGIN_MATCHED}e" env=ORIGIN_MATCHED
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS, PATCH"
    Header always set Access-Control-Allow-Headers "Authorization, Content-Type, X-Requested-With, Accept, Origin, X-WP-Nonce"
    Header always set Access-Control-Allow-Credentials "true"
    Header always set Access-Control-Max-Age "3600"
    
    # Handle OPTIONS preflight requests
    RewriteCond %{REQUEST_METHOD} OPTIONS
    RewriteRule ^(.*)$ $1 [R=200,L]
</IfModule>
# END CORS Headers
```

---

### Step 3: Upload to Server

**Method A: Hostinger hPanel File Manager**
```
1. Login to hpanel.hostinger.com
2. Select your domain
3. Click "File Manager"
4. Navigate to: /public_html/
5. Right-click .htaccess → Edit
6. Replace the CORS section
7. Save (Ctrl+S or Cmd+S)
```

**Method B: FTP (FileZilla, Cyberduck, etc.)**
```
1. Connect to your server via FTP
2. Navigate to: /public_html/
3. Download .htaccess (backup)
4. Edit locally
5. Upload the updated .htaccess
6. Overwrite the existing file
```

**Method C: SSH (Terminal)**
```bash
# Connect to server
ssh your-username@woocommerce.rshossain.com

# Backup
cp /public_html/.htaccess /public_html/.htaccess.backup

# Edit (use nano or vi)
nano /public_html/.htaccess

# Replace the CORS section
# Save: Ctrl+X → Y → Enter
```

**Method D: Use the complete file I created**
```bash
# Upload the file: .htaccess-new
# Located at: /Users/bs1071/Documents/RnD/angular/ngw-commerce/.htaccess-new

# On server, rename it:
mv /public_html/.htaccess /public_html/.htaccess.backup
mv /public_html/.htaccess-new /public_html/.htaccess
```

---

### Step 4: Test the Fix

**Test 1: Run the CORS test script**
```bash
cd /Users/bs1071/Documents/RnD/angular/ngw-commerce
./test-cors.sh
```

**Expected output:**
```
✅ Correct: Access-Control-Allow-Origin: http://localhost:5300
✅ Correct: Access-Control-Allow-Credentials: true
```

**Test 2: Manual cURL test**
```bash
curl -X OPTIONS \
  -H "Origin: http://localhost:5300" \
  -H "Access-Control-Request-Method: POST" \
  -i \
  https://woocommerce.rshossain.com/wp-json/custom/v1/reviews
```

**Look for:**
```
Access-Control-Allow-Origin: http://localhost:5300  ✅
Access-Control-Allow-Credentials: true  ✅
```

**NOT:**
```
Access-Control-Allow-Origin: *  ❌
```

---

### Step 5: Test in Angular App

1. **Hard refresh** your Angular app: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)
2. **Open DevTools** → Network tab
3. **Try to post a review**
4. **Check Response Headers:**
   ```
   Access-Control-Allow-Origin: http://localhost:5300  ✅
   Access-Control-Allow-Credentials: true  ✅
   ```
5. **Check Console** → Should be NO CORS errors

---

## 🔍 What Changed?

### Before (Broken):
```apache
Header always set Access-Control-Allow-Origin "*"  ❌
```
- Sends wildcard to ALL requests
- Incompatible with `withCredentials: true`
- Browser blocks the request

### After (Fixed):
```apache
SetEnvIf Origin "^http://localhost:5300$" ORIGIN_MATCHED=http://localhost:5300
Header always set Access-Control-Allow-Origin "%{ORIGIN_MATCHED}e" env=ORIGIN_MATCHED  ✅
```
- Checks origin against whitelist
- Only sends header if origin matches
- Sets **specific origin**, not wildcard
- Compatible with credentials

---

## 🚨 Important Notes

### 1. Keep LiteSpeed Cache Sections
```apache
# BEGIN LSCACHE
## LITESPEED WP CACHE PLUGIN - Do not edit the contents of this block! ##
```
**DO NOT** modify these sections! They're managed by LiteSpeed Cache plugin.

### 2. WordPress Rewrite Rules
```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
```
**DO NOT** modify these sections! They're required for WordPress permalinks.

### 3. Only Edit CORS Section
Only replace the section between:
```apache
# BEGIN CORS Headers for WooCommerce API
...
# END CORS Headers
```

---

## ✅ Verification Checklist

After updating `.htaccess`:

- [ ] Backup created
- [ ] CORS section replaced (not entire file)
- [ ] File uploaded to `/public_html/.htaccess`
- [ ] WordPress site still loads correctly
- [ ] Run `./test-cors.sh` → Shows correct origin (no wildcard)
- [ ] Angular app → Hard refresh (`Cmd+Shift+R`)
- [ ] Post review → No CORS error
- [ ] DevTools → Network → Response Headers show specific origin

---

## 🆘 Troubleshooting

### Problem: 500 Internal Server Error after update

**Cause:** Syntax error in `.htaccess`

**Fix:**
```bash
# Restore backup
mv /public_html/.htaccess.backup /public_html/.htaccess

# Check for typos in the new version
# Make sure you copied the entire CORS section correctly
```

### Problem: Still seeing wildcard `*`

**Cause:** Browser cache or .htaccess not updated

**Fix:**
1. Hard refresh browser: `Cmd+Shift+R`
2. Check file on server: `cat /public_html/.htaccess | grep "Access-Control-Allow-Origin"`
3. Should NOT see: `"*"`
4. Should see: `"%{ORIGIN_MATCHED}e"`

### Problem: No CORS headers at all

**Cause:** `mod_headers` module not enabled

**Fix:**
```bash
# Check with hosting support
# Or add to .htaccess (very top):
LoadModule headers_module modules/mod_headers.so
```

---

## 📚 Additional Resources

- **Complete .htaccess file:** `.htaccess-new` (in your project folder)
- **Just CORS section:** `htaccess-cors-fix.txt` (in your project folder)
- **Test script:** `./test-cors.sh`
- **Full troubleshooting:** `CORS-TROUBLESHOOTING.md`

---

## 🎉 Success Criteria

When everything works:
```bash
# Terminal test
./test-cors.sh
✅ PASSED: Correct CORS headers

# Browser console
No errors! 🎉

# Angular app
Review submission works! ✨
```

---

**Last Updated:** October 9, 2025  
**Status:** Ready to Deploy ✅
