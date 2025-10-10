# Custom Reviews API - WordPress Plugin v3.0

**🎉 NEW: WordPress Admin Panel for CORS Management!**

No coding required - manage CORS origins directly from WordPress admin!

---

## 🆕 What's New in v3.0

### WordPress Admin Interface ⭐

**Access:** WordPress Admin → **Settings → CORS Settings**

**Features:**
- ✅ Add/remove origins via browser (no coding!)
- ✅ Database storage (WordPress options)
- ✅ Auto-validation (rejects invalid URLs)
- ✅ Auto-generate .htaccess rules
- ✅ One-click copy to clipboard
- ✅ Real-time configuration table
- ✅ Built-in instructions and examples

---

## 📦 Installation

### Files Required:

1. `custom-reviews-api.php` - Main plugin
2. `cors-settings-admin.php` - Admin interface ⭐ NEW

### Upload to:

```
/wp-content/plugins/custom-reviews-api/
├── custom-reviews-api.php
└── cors-settings-admin.php
```

### Activate:

```
WordPress Admin → Plugins → Activate "Custom Reviews API"
```

---

## 🚀 Quick Start

### Step 1: Go to Settings

```
WordPress Dashboard → Settings → CORS Settings
```

### Step 2: Add Your URLs

Enter one URL per line:
```
http://localhost:4200
http://localhost:5300
https://yourdomain.com
https://www.yourdomain.com
```

### Step 3: Save

Click **"Save Origins"** button ✅

### Step 4: Update .htaccess

1. Copy the **"Generated .htaccess Rules"** (click copy button)
2. Paste into your `.htaccess` file
3. Done! 🎉

---

## 🎨 Admin Panel Features

### 1. Textarea Input
- Enter URLs directly in browser
- One URL per line
- Auto-validation on save

### 2. Current Configuration Table
- Shows all active origins
- Green checkmark = working
- Real-time updates

### 3. Auto-Generated .htaccess Rules
- Reads from database
- Always up-to-date
- One-click copy button

### 4. Built-in Help
- Instructions on page
- Common URLs examples
- Important notes and tips

---

## 📝 Usage Examples

### Add Development URL:

1. Go to: Settings → CORS Settings
2. Add: `http://localhost:5300`
3. Click: "Save Origins"
4. Copy .htaccess rules
5. Done! ✅

### Add Production URL:

1. Go to: Settings → CORS Settings
2. Add: 
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```
3. Click: "Save Origins"
4. Copy new .htaccess rules
5. Update .htaccess file
6. Done! 🎉

### Remove URL:

1. Go to: Settings → CORS Settings
2. Delete URL from textarea
3. Click: "Save Origins"
4. Copy updated .htaccess rules
5. Update .htaccess file
6. Done! ✅

---

## 📋 API Endpoints

### Create Review
```
POST /wp-json/custom/v1/reviews
```
**Auth:** Required (WordPress user)

### Update Review
```
PUT /wp-json/custom/v1/reviews/{id}
```
**Auth:** Required (review owner)

### Delete Review
```
DELETE /wp-json/custom/v1/reviews/{id}
```
**Auth:** Required (review owner)

---

## 🔒 Security

- ✅ Admin only (requires `manage_options` capability)
- ✅ WordPress nonce (CSRF protection)
- ✅ URL validation (`filter_var`)
- ✅ Input sanitization (`esc_url_raw`)
- ✅ Database storage (WordPress options)

---

## 📊 Benefits

### vs File Editing:

| Feature | File Editing | Admin Panel |
|---------|-------------|-------------|
| Access | SSH/FTP | Browser |
| Skills | PHP | None |
| Time | ~5 min | ~1 min |
| Errors | Possible | Auto-validated |
| Copy Rules | Manual | One-click |

---

## 🔄 Backward Compatibility

### Old Config File Support:

Plugin still supports `wp-cors-config.php`:
1. Checks database first (admin panel)
2. Falls back to config file if no database entry
3. Uses default localhost as last resort

### Migration:

If you have `wp-cors-config.php`:
1. Plugin reads it automatically
2. Go to Settings → CORS Settings
3. URLs appear in textarea
4. Click "Save Origins"
5. Now stored in database ✅

---

## 📚 Documentation

- **ADMIN-PANEL-SUMMARY.md** - Quick overview
- **ADMIN-PANEL-GUIDE.md** - Complete user guide
- **ADMIN-PANEL-VISUAL-GUIDE.md** - Visual tutorial

---

## 🆘 Troubleshooting

### Can't find admin page?

**Go to:** Settings → CORS Settings

**If not there:**
- Check plugin is activated
- Login as administrator
- Clear browser cache

### URLs not saving?

**Check:**
- Valid URL format (http:// or https://)
- No trailing slashes
- Protocol included

### Still seeing CORS errors?

**Steps:**
1. Save origins in admin panel ✅
2. Copy .htaccess rules ✅
3. Paste into .htaccess file ⚠️ (don't forget this!)
4. Test with `./test-cors.sh`

---

## 📞 Support

### Quick Help:
- **Admin panel:** Settings → CORS Settings
- **Documentation:** See `ADMIN-PANEL-GUIDE.md`
- **Testing:** Run `./test-cors.sh`

---

## 📄 License

GPL v2 or later

---

**Version:** 3.0 - Admin Panel Edition  
**Last Updated:** October 9, 2025  
**Coding Required:** ZERO ✅  
**Status:** Production Ready 🚀
