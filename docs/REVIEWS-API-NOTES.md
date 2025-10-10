# Product Reviews API - Implementation Notes

## Current Status: ⚠️ Requires Backend Configuration

The review feature UI is fully implemented, but requires proper backend API configuration to work.

## Issue Encountered

### Problem:
- WordPress Comments API (`/wp/v2/comments`) returns **401 Unauthorized**
- Error: `"rest_comment_login_required"` - "Sorry, you must be logged in to comment."
- This happens even when trying to **read** comments (should be public)

### Root Cause:
WordPress by default requires authentication to access the Comments REST API, even for reading public comments. This is a WordPress security configuration.

## Solutions (Choose One)

### Option 1: Enable WooCommerce Product Reviews Endpoint ✅ (Recommended)

The code now uses: `GET /wc/v3/products/{id}/reviews`

**Requirements:**
- WooCommerce 3.5.0+
- Product reviews must be enabled in WooCommerce settings
- REST API must be enabled

**To Enable:**
1. Go to WooCommerce → Settings → Products
2. Check "Enable product reviews"
3. Save changes
4. Ensure WooCommerce REST API is enabled

**Benefits:**
- Uses WooCommerce authentication (consumer key/secret) ✅
- No additional WordPress configuration needed ✅
- Handles ratings properly ✅
- Verified purchase status ✅

### Option 2: Install Custom Plugin for Reviews

Create a WordPress plugin that provides a public endpoint:

```php
// wp-content/plugins/wc-angular-api/includes/reviews.php
add_action('rest_api_init', function () {
    register_rest_route('wc-angular/v1', '/products/(?P<id>\d+)/reviews', [
        'methods' => 'GET',
        'callback' => 'get_product_reviews_public',
        'permission_callback' => '__return_true', // Public access
    ]);
});

function get_product_reviews_public($request) {
    $product_id = $request['id'];
    $args = [
        'post_id' => $product_id,
        'status' => 'approve',
        'type' => 'review',
    ];
    
    $comments = get_comments($args);
    $reviews = [];
    
    foreach ($comments as $comment) {
        $reviews[] = [
            'id' => $comment->comment_ID,
            'product_id' => $product_id,
            'reviewer' => $comment->comment_author,
            'reviewer_email' => $comment->comment_author_email,
            'review' => $comment->comment_content,
            'rating' => get_comment_meta($comment->comment_ID, 'rating', true),
            'date_created' => $comment->comment_date,
            'verified' => wc_customer_bought_product($comment->comment_author_email, $comment->user_id, $product_id),
            'reviewer_avatar_urls' => [
                '24' => get_avatar_url($comment->comment_author_email, ['size' => 24]),
                '48' => get_avatar_url($comment->comment_author_email, ['size' => 48]),
                '96' => get_avatar_url($comment->comment_author_email, ['size' => 96]),
            ]
        ];
    }
    
    return $reviews;
}
```

### Option 3: Configure WordPress to Allow Public Comment Access

Modify WordPress REST API permissions (not recommended for security):

```php
// In theme's functions.php or custom plugin
add_filter('rest_allow_anonymous_comments', '__return_true');
```

**Warning:** This opens up your comments API to anonymous access, which may have security implications.

### Option 4: Use Mock Data (Development Only)

For development/testing, use mock review data:

```typescript
// In product.service.ts
getProductReviews(productId: number): Observable<ProductReview[]> {
  // Mock data for development
  const mockReviews: ProductReview[] = [
    {
      id: 1,
      product_id: productId,
      date_created: new Date().toISOString(),
      date_created_gmt: new Date().toISOString(),
      status: 'approved',
      reviewer: 'John Doe',
      reviewer_email: 'john@example.com',
      review: 'Great product! Highly recommended.',
      rating: 5,
      verified: true,
      reviewer_avatar_urls: {
        '24': 'https://www.gravatar.com/avatar/?s=24',
        '48': 'https://www.gravatar.com/avatar/?s=48',
        '96': 'https://www.gravatar.com/avatar/?s=96'
      }
    }
  ];
  
  return of(mockReviews);
}
```

## Current Implementation

### API Service Changes:
- Added `getWp()` and `postWp()` methods for WordPress API
- WordPress methods don't send WooCommerce authentication
- Error handling returns empty array for graceful degradation

### Error Interceptor:
- Updated to **not redirect** on 401 errors for WordPress API (`/wp/v2/`)
- This prevents automatic redirect to login when reviews fail to load

### Product Service:
- **Currently using**: WooCommerce `/products/{id}/reviews` endpoint
- Falls back to empty array if API fails
- Logs helpful warning message

## Testing

### Check if Reviews Endpoint Exists:

```bash
# Test WooCommerce reviews endpoint
curl -u "consumer_key:consumer_secret" \
  "https://woocommerce.rshossain.com/wp-json/wc/v3/products/24/reviews"

# If 404, reviews endpoint doesn't exist in WooCommerce v3
# Try WordPress comments endpoint
curl "https://woocommerce.rshossain.com/wp-json/wp/v2/comments?post=24"
```

### Expected Responses:

**Success (WooCommerce):**
```json
[
  {
    "id": 22,
    "product_id": 24,
    "reviewer": "John Doe",
    "reviewer_email": "john@example.com",
    "review": "Great product!",
    "rating": 5,
    "date_created": "2025-01-15T10:30:00",
    "verified": true
  }
]
```

**Error (401):**
```json
{
  "code": "rest_comment_login_required",
  "message": "Sorry, you must be logged in to comment.",
  "data": {"status": 401}
}
```

**Error (404):**
```json
{
  "code": "rest_no_route",
  "message": "No route was found matching the URL and request method.",
  "data": {"status": 404}
}
```

## Recommended Next Steps

1. **Check WooCommerce Version**: Ensure you have WooCommerce 3.5.0+
2. **Enable Reviews**: WooCommerce → Settings → Products → Enable reviews
3. **Test Endpoint**: Use curl to test if `/products/{id}/reviews` works
4. **If 404**: Reviews endpoint doesn't exist - install custom plugin (Option 2)
5. **If 401 on GET**: WordPress is blocking - use custom plugin (Option 2)

## UI Behavior

### Current Behavior:
- ✅ Reviews tab displays
- ✅ Form is visible and functional
- ⚠️ Reviews list will be empty if API fails
- ✅ No error shown to user (graceful degradation)
- ✅ No automatic redirect (fixed)

### Expected Behavior (When Fixed):
- ✅ Reviews load and display
- ✅ User can submit reviews (if authenticated)
- ✅ Real-time rating updates
- ✅ Verified purchase badges
- ✅ Avatar images

## Documentation Links

- [WooCommerce REST API - Product Reviews](https://woocommerce.github.io/woocommerce-rest-api-docs/#product-reviews)
- [WordPress REST API - Comments](https://developer.wordpress.org/rest-api/reference/comments/)
- [WooCommerce Reviews Settings](https://woocommerce.com/document/settings-products/#section-6)
