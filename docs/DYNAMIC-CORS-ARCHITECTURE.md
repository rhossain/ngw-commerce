# 🎯 Dynamic CORS Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Angular Application                         │
│                   (http://localhost:5300)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP Request with Origin header
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      WordPress Server                           │
│                  (woocommerce.rshossain.com)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │             .htaccess (Apache Layer)                     │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────┐         │  │
│  │  │ SetEnvIf Origin "^http://localhost:5300$" │         │  │
│  │  │    ORIGIN_MATCHED=http://localhost:5300   │         │  │
│  │  │                                            │         │  │
│  │  │ Header set Access-Control-Allow-Origin    │         │  │
│  │  │    "%{ORIGIN_MATCHED}e"                   │         │  │
│  │  └────────────────────────────────────────────┘         │  │
│  │                      ▲                                   │  │
│  │                      │ Generated from                    │  │
│  │                      │ Tools → CORS Config               │  │
│  └──────────────────────┼───────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │          WordPress Plugin Layer                          │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────┐         │  │
│  │  │    custom-reviews-api.php                 │         │  │
│  │  │                                            │         │  │
│  │  │  if (wp_cors_is_origin_allowed($origin))  │         │  │
│  │  │    header('Access-Control-Allow-Origin')  │         │  │
│  │  └────────────────────────────────────────────┘         │  │
│  │                      ▲                                   │  │
│  │                      │ Reads from                        │  │
│  │                      │                                   │  │
│  │  ┌────────────────────────────────────────────┐         │  │
│  │  │    cors-admin-page.php                    │         │  │
│  │  │  (WordPress Admin → Tools → CORS Config)  │         │  │
│  │  │                                            │         │  │
│  │  │  - Lists allowed origins                  │         │  │
│  │  │  - Generates .htaccess rules              │         │  │
│  │  └────────────────────────────────────────────┘         │  │
│  │                      ▲                                   │  │
│  │                      │ Both read from                    │  │
│  └──────────────────────┼───────────────────────────────────┘  │
│                         │                                      │
│  ┌──────────────────────┴───────────────────────────────────┐  │
│  │  ⭐ wp-cors-config.php (Single Source of Truth)          │  │
│  │                                                          │  │
│  │  $wp_cors_allowed_origins = [                           │  │
│  │      'http://localhost:4200',                           │  │
│  │      'http://localhost:5300',  ← EDIT HERE ONLY!        │  │
│  │      'https://rshossain.com',                           │  │
│  │  ];                                                      │  │
│  │                                                          │  │
│  │  Helper functions:                                       │  │
│  │  - wp_cors_is_origin_allowed($origin)                   │  │
│  │  - wp_cors_get_allowed_origins()                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Workflow: Adding a New Origin

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Edit wp-cors-config.php                            │
│                                                             │
│ $ nano /wp-content/wp-cors-config.php                      │
│                                                             │
│ $wp_cors_allowed_origins = [                               │
│     'http://localhost:5300',                               │
│     'https://new-domain.com',  ← Add new origin            │
│ ];                                                          │
│                                                             │
│ $ save file                                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Plugin Automatically Updates ✅                     │
│                                                             │
│ WordPress plugin reads config on every request             │
│ No need to reactivate or restart anything                  │
│                                                             │
│ $ curl -H "Origin: https://new-domain.com" ...             │
│ ✅ Works immediately!                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Update .htaccess (One-time)                        │
│                                                             │
│ 1. Go to: WordPress Admin → Tools → CORS Config            │
│ 2. See new origin in the table ✅                           │
│ 3. Copy generated .htaccess rules                          │
│ 4. Paste into /public_html/.htaccess                       │
│                                                             │
│ Why? .htaccess is static, needs manual update              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ Step 4: Test ✅                                             │
│                                                             │
│ $ ./test-cors.sh                                            │
│ ✅ Correct: Access-Control-Allow-Origin: https://...       │
│                                                             │
│ $ Open Angular app                                          │
│ ✅ No CORS errors                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## File Dependencies

```
wp-cors-config.php (Main Config)
    │
    ├── Read by: custom-reviews-api.php
    │   └── Sets CORS headers dynamically
    │
    ├── Read by: cors-admin-page.php
    │   ├── Displays origins in admin UI
    │   └── Generates .htaccess rules
    │
    └── Read by: generate-htaccess-cors.php (CLI)
        └── Outputs .htaccess rules to terminal
```

---

## Data Flow

### Request Flow:
```
1. Browser sends request
   Origin: http://localhost:5300
   │
   ▼
2. Apache (.htaccess) checks origin
   SetEnvIf Origin "^http://localhost:5300$" ORIGIN_MATCHED=...
   │
   ▼
3. WordPress Plugin double-checks
   wp_cors_is_origin_allowed($origin)
   │
   ▼
4. Response sent with header
   Access-Control-Allow-Origin: http://localhost:5300
   │
   ▼
5. Browser accepts response ✅
```

### Config Update Flow:
```
1. Edit wp-cors-config.php
   $wp_cors_allowed_origins[] = 'new-origin'
   │
   ├── Plugin reads config ✅ (automatic)
   │   └── Works immediately for API calls
   │
   └── Admin page reads config ✅ (automatic)
       └── Shows new origin in UI
       └── Generates new .htaccess rules
       │
       ▼
2. Copy .htaccess rules
   │
   ▼
3. Paste into .htaccess file
   │
   ▼
4. Apache uses new rules ✅
```

---

## Component Responsibilities

### wp-cors-config.php
**Role:** Configuration storage
**Contains:** Array of allowed origins
**Used by:** All other components
**Update frequency:** When origins change

### custom-reviews-api.php
**Role:** WordPress REST API + CORS enforcement
**Reads:** wp-cors-config.php
**Updates:** Automatically on every request
**Manual action:** None (auto-updates)

### cors-admin-page.php
**Role:** WordPress admin UI
**Reads:** wp-cors-config.php
**Generates:** .htaccess rules
**Manual action:** Copy/paste to .htaccess

### .htaccess
**Role:** Apache-level CORS headers
**Source:** Generated by admin page
**Updates:** Manual copy/paste
**Manual action:** Required after config change

---

## Comparison: Old vs New

### Old Architecture (Hardcoded):
```
custom-reviews-api.php
    │
    └── $allowed_origins = ['hardcoded', 'urls']
        ❌ Must edit plugin code
        ❌ Must reactivate plugin

.htaccess
    │
    └── SetEnvIf Origin "hardcoded" ...
        ❌ Must edit manually
        ❌ Easy to have typos
        ❌ Can get out of sync with plugin
```

### New Architecture (Dynamic):
```
wp-cors-config.php ⭐
    │
    ├── custom-reviews-api.php
    │   └── wp_cors_is_origin_allowed()
    │       ✅ Auto-reads config
    │       ✅ No reactivation needed
    │
    └── cors-admin-page.php
        └── Generates .htaccess rules
            ✅ Always in sync
            ✅ No typos (copy-paste)
            ✅ One-click copy
```

---

## Benefits Visualized

### Time to Add New Origin:

**Before (Hardcoded):**
```
1. Edit plugin file (5 min)
2. Edit .htaccess file (5 min)
3. Upload plugin (2 min)
4. Deactivate/Activate (1 min)
5. Test (2 min)
─────────────────────────
Total: ~15 minutes
❌ Risk of typos: High
❌ Risk of sync issues: High
```

**After (Dynamic):**
```
1. Edit wp-cors-config.php (2 min)
2. Copy .htaccess from admin (1 min)
3. Paste into .htaccess (1 min)
4. Test (2 min)
─────────────────────────
Total: ~6 minutes
✅ Risk of typos: None (copy-paste)
✅ Risk of sync issues: None (single source)
```

---

## Security Model

```
┌───────────────────────────────────────────────┐
│           Request from Browser                │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│    Layer 1: .htaccess (Apache)                │
│    Checks: Origin header                      │
│    Action: Set ORIGIN_MATCHED if allowed      │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│    Layer 2: WordPress Plugin                  │
│    Checks: wp_cors_is_origin_allowed()        │
│    Action: Set header if allowed              │
│    Fallback: Remove wildcard if present       │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│    Layer 3: WordPress REST API                │
│    Checks: is_user_logged_in()                │
│    Action: Allow/deny based on auth           │
└───────────────┬───────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────┐
│           Response Sent                       │
│    Headers: Specific origin + credentials     │
└───────────────────────────────────────────────┘

🔒 Triple Protection:
   1. Apache filters by origin
   2. WordPress plugin filters by origin
   3. REST API filters by authentication
```

---

**Last Updated:** October 9, 2025  
**Architecture Version:** 2.0 Dynamic ✅
