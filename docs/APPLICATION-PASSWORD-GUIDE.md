# 🔑 Create WordPress Application Password - Visual Guide

## 📍 Step-by-Step with Screenshots

### Step 1: Go to Users Section

```
WordPress Dashboard
    ├─ Posts
    ├─ Media
    ├─ Pages
    ├─ Comments
    ├─ WooCommerce
    └─ Users  ← Click here!
        ├─ All Users
        └─ Your Profile  ← Then click here!
```

### Step 2: Scroll Down to Application Passwords

```
┌────────────────────────────────────────────────────┐
│  Your Profile                                      │
│  ───────────────────────────────────────────────  │
│                                                    │
│  [Personal Options section...]                    │
│  [Name section...]                                │
│  [Contact Info section...]                        │
│  [About Yourself section...]                      │
│  [Account Management section...]                  │
│                                                    │
│  ↓ Scroll down ↓                                  │
│                                                    │
│  ───────────────────────────────────────────────  │
│  Application Passwords                             │
│  ───────────────────────────────────────────────  │
│                                                    │
│  Application passwords allow authentication       │
│  via non-interactive systems, such as XMLRPC      │
│  or the REST API, without providing your          │
│  actual password.                                 │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Step 3: Create New Application Password

```
┌────────────────────────────────────────────────────┐
│  Application Passwords                             │
│  ───────────────────────────────────────────────  │
│                                                    │
│  New Application Password Name                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ Angular App                    ← Type here   │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Add New Application Password]  ← Click button   │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Step 4: COPY THE PASSWORD!

```
┌────────────────────────────────────────────────────┐
│  ⚠️ IMPORTANT: Copy this password now!            │
│     You won't be able to see it again.            │
│                                                    │
│  ┌──────────────────────────────────────────────┐ │
│  │ xxxx xxxx xxxx xxxx xxxx xxxx               │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Copy Password]  ← Click to copy                 │
│                                                    │
│  ───────────────────────────────────────────────  │
│                                                    │
│  Application Password created successfully!        │
│                                                    │
│  Name: Angular App                                │
│  Created: 2025-10-09                              │
│  Last Used: Never                                 │
│  Last IP: —                                       │
│                                                    │
│  [Revoke]  ← Can delete later if needed           │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Step 5: Save Password Somewhere Safe

```
┌────────────────────────────────────────────────────┐
│  📝 Save this information:                        │
│  ───────────────────────────────────────────────  │
│                                                    │
│  WordPress Username: admin                         │
│  Application Password: xxxx xxxx xxxx xxxx xxxx   │
│                                                    │
│  ⚠️ Keep this secure!                             │
│  ✅ Save in password manager                      │
│  ✅ Or save in secure note                        │
│  ❌ Don't commit to Git                           │
│  ❌ Don't share publicly                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

## 🎯 How to Use in Angular App

### Login Form:

```
┌────────────────────────────────────────────────────┐
│  Login to Your Account                            │
│  ───────────────────────────────────────────────  │
│                                                    │
│  Username                                         │
│  ┌──────────────────────────────────────────────┐ │
│  │ admin            ← WordPress username        │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  Password                                         │
│  ┌──────────────────────────────────────────────┐ │
│  │ xxxx xxxx xxxx xxxx xxxx xxxx               │ │
│  │  ↑ Application Password (with spaces)        │ │
│  └──────────────────────────────────────────────┘ │
│                                                    │
│  [Login]                                          │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Example Credentials:

```
✅ CORRECT:
  Username: admin
  Password: AbCd EfGh IjKl MnOp QrSt UvWx

✅ ALSO CORRECT (no spaces):
  Username: admin
  Password: AbCdEfGhIjKlMnOpQrStUvWx

❌ WRONG:
  Username: admin@example.com  ← Don't use email!
  Password: your-normal-password  ← Don't use main password!
```

## 🔍 Where to Find Your WordPress Username

Not sure what your WordPress username is?

### Method 1: Check Profile

```
WordPress Admin → Users → Your Profile
Look at the top: "Profile" or URL shows username
Example URL: /wp-admin/profile.php?user=admin
                                          ↑
                                    Your username
```

### Method 2: Check Users List

```
WordPress Admin → Users → All Users
Find your account in the list
Look at "Username" column
```

### Method 3: Check Login Screen

```
When you normally log into WordPress,
what do you use as username?
That's the username you need!
```

## 🧪 Test Your Application Password

### Test 1: WordPress API (using curl)

```bash
# Replace with your credentials
USERNAME="admin"
APP_PASSWORD="xxxx xxxx xxxx xxxx xxxx xxxx"

# Test authentication
curl -u "$USERNAME:$APP_PASSWORD" \
  https://woocommerce.rshossain.com/wp-json/wp/v2/users/me

# Should return your user data (JSON)
```

### Test 2: Create Review (using curl)

```bash
# Test creating a review
curl -X POST https://woocommerce.rshossain.com/wp-json/custom/v1/reviews \
  -u "$USERNAME:$APP_PASSWORD" \
  -H "Content-Type: application/json" \
  -d '{
    "product_id": 123,
    "rating": 5,
    "review": "Test review from API"
  }'

# Should return success response
```

### Test 3: Angular App

```
1. Open Angular app
2. Go to Login page
3. Enter:
   - Username: admin
   - Password: xxxx xxxx xxxx xxxx xxxx xxxx
4. Click Login
5. Open browser console (F12)
6. Check: localStorage.getItem('wp_auth_header')
   ✅ Should show: "Basic <base64-string>"
```

## ⚙️ Managing Application Passwords

### View All Application Passwords

```
WordPress Admin → Users → Your Profile → Application Passwords

┌────────────────────────────────────────────────────┐
│  Application Passwords                             │
│  ───────────────────────────────────────────────  │
│                                                    │
│  Name          Created      Last Used    Actions  │
│  ────────────  ──────────  ──────────   ────────  │
│  Angular App   2025-10-09  2 mins ago   [Revoke]  │
│  Mobile App    2025-09-15  1 day ago    [Revoke]  │
│  Testing       2025-08-01  Never        [Revoke]  │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Revoke Application Password

If you need to delete an Application Password:

```
1. Go to: Users → Your Profile
2. Scroll to: Application Passwords
3. Find the password you want to delete
4. Click: [Revoke] button
5. Confirm deletion

⚠️ Apps using this password will immediately stop working!
```

### Create Multiple Application Passwords

You can create different passwords for different apps:

```
✅ Angular App (Development)
✅ Angular App (Production)
✅ Mobile App
✅ Testing/Debug
✅ Third-party integration

Each can be revoked independently!
```

## 🔐 Security Best Practices

### DO:
- ✅ Create separate Application Passwords for each app
- ✅ Use descriptive names ("Angular Dev", "Angular Prod")
- ✅ Revoke unused Application Passwords regularly
- ✅ Store passwords in password manager
- ✅ Use environment variables in production code

### DON'T:
- ❌ Share Application Passwords
- ❌ Commit passwords to Git
- ❌ Use your main WordPress password
- ❌ Create generic names like "Test" or "App"
- ❌ Leave old passwords active forever

## 🎯 Troubleshooting

### "I don't see Application Passwords section"

**Possible causes:**
1. Your site doesn't use HTTPS
   - Solution: Application Passwords require HTTPS
2. Your WordPress version is too old
   - Solution: Update to WordPress 5.6+
3. Application Passwords are disabled
   - Solution: Check with hosting provider

### "Password doesn't work"

**Check these:**
1. ✅ Using WordPress username (not email)
2. ✅ Copied password correctly (with or without spaces)
3. ✅ Password not expired/revoked
4. ✅ Account has proper permissions
5. ✅ HTTPS enabled on site

### "Can I use my regular password instead?"

**No!** Regular passwords don't work with REST API authentication.

**Why?**
- REST API requires Application Passwords
- Regular passwords need session cookies
- Application Passwords are more secure
- Can revoke without changing main password

## 📞 Quick Reference

| What | Where | How |
|------|-------|-----|
| Create Password | Users → Your Profile | Scroll to "Application Passwords" |
| Copy Password | After creation | Click "Copy Password" button |
| Find Username | Users → Your Profile | Top of page or URL |
| Test Password | Browser/curl | `curl -u username:password` |
| Revoke Password | Users → Your Profile | Click [Revoke] button |
| View Last Used | Application Passwords list | "Last Used" column |

---

**Created:** October 9, 2025  
**WordPress Version:** 5.6+  
**Requirement:** HTTPS enabled  
**Status:** Production ready 🚀
