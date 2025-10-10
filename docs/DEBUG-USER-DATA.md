# 🔍 Debug Script - Check User Data

Open your Angular app and run these commands in the browser console (F12 → Console):

## Step 1: Check if user is logged in

```javascript
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
console.log('Current User:', currentUser);
console.log('First Name:', currentUser?.first_name);
console.log('Last Name:', currentUser?.last_name);
console.log('Email:', currentUser?.email);
console.log('Username:', currentUser?.username);
```

**What you should see:**
- If logged in: User object with first_name, last_name, email
- If not logged in: null

## Step 2: Check the review request payload

1. Open DevTools (F12)
2. Go to **Network** tab
3. Keep it open
4. Submit a review
5. Find the POST request to `/reviews`
6. Click on it
7. Look at **Payload** or **Request** tab

**Copy the entire JSON payload and send it to me**

Example of what it SHOULD look like:
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

**If reviewer_name is missing or empty, that's the problem!**
