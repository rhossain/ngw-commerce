# 🎨 WordPress CORS Admin Panel - Visual Guide

## 📍 How to Access

```
WordPress Dashboard
    └─ Settings
        └─ CORS Settings  ← Click here!
```

---

## 🖼️ Admin Page Layout

### Section 1: Allowed Origins (Input)

```
┌──────────────────────────────────────────────────────┐
│  Allowed Origins                                     │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Enter one URL per line. These origins will be      │
│  allowed to make authenticated requests to your API. │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Allowed Origins                                │ │
│  │                                                │ │
│  │ ┌──────────────────────────────────────────┐  │ │
│  │ │ http://localhost:4200                    │  │ │
│  │ │ http://localhost:5300                    │  │ │
│  │ │ https://rshossain.com                    │  │ │
│  │ │ https://www.rshossain.com                │  │ │
│  │ │                                          │  │ │
│  │ │                                          │  │ │
│  │ └──────────────────────────────────────────┘  │ │
│  │                                                │ │
│  │ Enter one URL per line. Examples:              │ │
│  │ http://localhost:4200                          │ │
│  │ https://yourdomain.com                         │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [Save Origins]  ← Click to save                    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**What to do:**
1. Type or paste your URLs
2. One URL per line
3. Click "Save Origins" button
4. See success message ✅

---

### Section 2: Current Configuration (Table)

```
┌──────────────────────────────────────────────────────┐
│  Current Configuration                               │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Your currently configured origins:                  │
│                                                      │
│  ┌──┬─────────────────────────────┬──────────────┐  │
│  │# │ Origin URL                  │ Status       │  │
│  ├──┼─────────────────────────────┼──────────────┤  │
│  │1 │ http://localhost:4200       │ ✓ Active     │  │
│  │2 │ http://localhost:5300       │ ✓ Active     │  │
│  │3 │ https://rshossain.com       │ ✓ Active     │  │
│  │4 │ https://www.rshossain.com   │ ✓ Active     │  │
│  └──┴─────────────────────────────┴──────────────┘  │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**What you see:**
- ✅ All your active origins
- ✅ Green checkmark = working
- ✅ Numbered list for easy reference

---

### Section 3: Generated .htaccess Rules (Auto-Generated)

```
┌──────────────────────────────────────────────────────┐
│  Generated .htaccess Rules                           │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  Copy these rules to your .htaccess file             │
│  (replace the CORS section):                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ # BEGIN CORS Headers - AUTO-GENERATED          │ │
│  │ # Generated on: 2025-10-09 12:00:00            │ │
│  │ # Source: WordPress Admin → Settings → CORS    │ │
│  │ <IfModule mod_headers.c>                       │ │
│  │     SetEnvIf Origin "^http://localhost:5300$" │ │
│  │         ORIGIN_MATCHED=http://localhost:5300   │ │
│  │     SetEnvIf Origin "^https://rshossain\.com$"│ │
│  │         ORIGIN_MATCHED=https://rshossain.com   │ │
│  │     ...                                        │ │
│  │     Header always set Access-Control-Allow-    │ │
│  │         Origin "%{ORIGIN_MATCHED}e"            │ │
│  │ </IfModule>                                    │ │
│  │ # END CORS Headers                             │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [📋 Copy to Clipboard]  ← Click to copy            │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**What to do:**
1. Click "Copy to Clipboard" button
2. Open your `.htaccess` file (via FTP, cPanel, etc.)
3. Find the CORS section
4. Paste the new rules (replace old ones)
5. Save `.htaccess` file
6. Done! ✅

---

### Section 4: How to Use (Instructions)

```
┌──────────────────────────────────────────────────────┐
│  📚 How to Use                                       │
│  ──────────────────────────────────────────────────  │
│                                                      │
│  1. Add Origins: Enter your Angular app URLs        │
│     in the textarea above (one per line)            │
│                                                      │
│  2. Click "Save Origins": WordPress saves them      │
│     to the database                                 │
│                                                      │
│  3. WordPress Plugin Updates Automatically:         │
│     No reactivation needed! ✅                       │
│                                                      │
│  4. Update .htaccess: Copy the generated rules      │
│     and paste into your .htaccess file              │
│                                                      │
│  5. Test: Your Angular app should now work          │
│     without CORS errors! 🎉                         │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  📝 Common URLs to Add:                             │
│  • http://localhost:4200 - Angular dev server       │
│  • https://yourdomain.com - Production (root)       │
│  • https://www.yourdomain.com - With www            │
│  • https://staging.yourdomain.com - Staging         │
│                                                      │
│  ─────────────────────────────────────────────────  │
│                                                      │
│  ⚠️ Important Notes:                                │
│  • Enter exact URLs - no wildcards or regex         │
│  • Include protocol (http:// or https://)           │
│  • No trailing slashes                              │
│  • WordPress plugin reads from database auto        │
│  • .htaccess needs manual update (copy/paste)       │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 📸 Success Messages

### After Saving:

```
┌──────────────────────────────────────────────────────┐
│  ✅ CORS settings saved successfully!                │
└──────────────────────────────────────────────────────┘
```

### After Copying:

```
┌──────────────────────────────────────────────────────┐
│  ✅ Copied to clipboard! Paste into your .htaccess   │
│     file.                                            │
└──────────────────────────────────────────────────────┘
```

---

## 🎬 Step-by-Step Tutorial

### Tutorial 1: Add Development Origin

**Step 1:** Go to WordPress Admin
```
Dashboard → Settings → CORS Settings
```

**Step 2:** Add localhost URL
```
In the textarea, add:
http://localhost:5300
```

**Step 3:** Save
```
Click "Save Origins" button
```

**Step 4:** See confirmation
```
✅ CORS settings saved successfully!
```

**Step 5:** Check table
```
Current Configuration shows:
#1 | http://localhost:5300 | ✓ Active
```

**Step 6:** Copy .htaccess rules
```
Click "📋 Copy to Clipboard"
```

**Step 7:** Update .htaccess
```
Paste into your .htaccess file
```

**Done!** ✅

---

### Tutorial 2: Add Production URL

**Scenario:** You're deploying to production at `https://rshossain.com`

**Step 1:** Open CORS Settings
```
WordPress Admin → Settings → CORS Settings
```

**Step 2:** Add to existing URLs
```
Textarea now shows:
http://localhost:5300
https://rshossain.com       ← Add this
https://www.rshossain.com   ← And this (with www)
```

**Step 3:** Save
```
Click "Save Origins"
```

**Step 4:** Verify
```
Current Configuration table shows:
#1 | http://localhost:5300      | ✓ Active
#2 | https://rshossain.com      | ✓ Active
#3 | https://www.rshossain.com  | ✓ Active
```

**Step 5:** Copy new rules
```
Click "📋 Copy to Clipboard"
Notice: Rules now include rshossain.com!
```

**Step 6:** Update .htaccess
```
Paste new rules into .htaccess
```

**Step 7:** Test
```
curl -H "Origin: https://rshossain.com" \
  https://woocommerce.rshossain.com/wp-json/custom/v1/reviews

✅ Access-Control-Allow-Origin: https://rshossain.com
```

**Done!** 🎉

---

### Tutorial 3: Remove an Origin

**Scenario:** You no longer need `http://localhost:3000`

**Step 1:** Open CORS Settings
```
Settings → CORS Settings
```

**Step 2:** Edit textarea
```
Before:
http://localhost:4200
http://localhost:5300
http://localhost:3000    ← Remove this line
https://rshossain.com

After:
http://localhost:4200
http://localhost:5300
https://rshossain.com
```

**Step 3:** Save
```
Click "Save Origins"
```

**Step 4:** Verify
```
Current Configuration table no longer shows localhost:3000
```

**Step 5:** Copy new rules
```
Click "📋 Copy to Clipboard"
```

**Step 6:** Update .htaccess
```
Paste into .htaccess
```

**Done!** ✅

---

## 🔍 What Each Section Does

| Section | Purpose | Action Required |
|---------|---------|-----------------|
| **Allowed Origins** | Input field for URLs | Enter URLs, click Save |
| **Current Configuration** | Shows active origins | View only (reference) |
| **Generated .htaccess** | Auto-generated rules | Copy and paste to .htaccess |
| **How to Use** | Instructions | Read for guidance |

---

## 💡 Pro Tips

### Tip 1: Bulk Add URLs
```
You can paste multiple URLs at once:

http://localhost:4200
http://localhost:5300
https://staging.yourdomain.com
https://yourdomain.com
https://www.yourdomain.com

Click Save once → All added! ✅
```

### Tip 2: Include Both www and non-www
```
Always add both versions:
https://yourdomain.com
https://www.yourdomain.com

Why? Users might access either version.
```

### Tip 3: Test Before Production
```
1. Add staging URL first
2. Test in staging environment
3. Then add production URL
4. Deploy with confidence! ✅
```

### Tip 4: Keep Localhost for Development
```
Don't remove localhost origins!
You'll need them for local development.

Keep:
http://localhost:4200
http://localhost:5300
```

---

## 🎯 Summary

### Three Simple Steps:
1. **Add URLs** in WordPress admin
2. **Copy .htaccess rules** (one-click)
3. **Paste into .htaccess** file

### No Coding Required:
- ✅ User-friendly interface
- ✅ Simple textarea input
- ✅ Auto-validation
- ✅ One-click copy

### Instant Results:
- ✅ WordPress plugin updates immediately
- ✅ No reactivation needed
- ✅ See changes in real-time table

---

**Last Updated:** October 9, 2025  
**Version:** 3.0 - Admin Panel  
**Status:** Production Ready 🚀
