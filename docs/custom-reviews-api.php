<?php
/**
 * Plugin Name: Custom Reviews API
 * Plugin URI: https://github.com/rhossain/ngw-commerce
 * Description: Adds a custom REST API endpoint for submitting product reviews without authentication
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://github.com/rhossain
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: custom-reviews-api
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Load CORS Settings Admin Page (Database-driven configuration)
 */
if (is_admin()) {
    require_once(plugin_dir_path(__FILE__) . 'cors-settings-admin.php');
}

/**
 * Get allowed origins from WordPress database
 * This is set via: WordPress Admin → Settings → CORS Settings
 */
function cra_get_allowed_origins_from_db() {
    // Try database first (set via admin panel)
    $origins = get_option('cors_allowed_origins', false);
    
    if ($origins !== false && is_array($origins) && !empty($origins)) {
        return $origins;
    }
    
    // Fallback: Check for old config file
    $cors_config_file = WP_CONTENT_DIR . '/wp-cors-config.php';
    if (file_exists($cors_config_file)) {
        require_once($cors_config_file);
        if (isset($wp_cors_allowed_origins) && is_array($wp_cors_allowed_origins)) {
            return $wp_cors_allowed_origins;
        }
    }
    
    // Final fallback: Default localhost origins
    return [
        'http://localhost:4200',
        'http://localhost:5300',
        'http://localhost:3000',
    ];
}

/**
 * Check if origin is allowed (reads from database)
 */
function cra_is_origin_allowed($origin) {
    $allowed = cra_get_allowed_origins_from_db();
    return in_array($origin, $allowed);
}

/**
 * Register custom REST API route for product reviews
 */
add_action('rest_api_init', function () {
    // Create review - TEMPORARY: Allows anonymous submissions for testing
    // Change '__return_true' back to 'is_user_logged_in' when you have proper authentication
    register_rest_route('custom/v1', '/reviews', [
        'methods' => 'POST',
        'callback' => 'cra_create_product_review',
        'permission_callback' => '__return_true', // Allows anyone (temporary for testing)
        'args' => [
            'product_id' => [
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                }
            ],
            'review' => [
                'required' => true,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
                'validate_callback' => function($param) {
                    return !empty($param);
                }
            ],
            'rating' => [
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param >= 1 && $param <= 5;
                }
            ]
        ]
    ]);

    // Update review - User can only update their own review
    register_rest_route('custom/v1', '/reviews/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'cra_update_product_review',
        'permission_callback' => 'is_user_logged_in',
        'args' => [
            'id' => [
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                }
            ],
            'review' => [
                'required' => false,
                'type' => 'string',
                'sanitize_callback' => 'sanitize_textarea_field',
                'validate_callback' => function($param) {
                    return !empty($param);
                }
            ],
            'rating' => [
                'required' => false,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param >= 1 && $param <= 5;
                }
            ]
        ]
    ]);

    // Delete review - User can only delete their own review
    register_rest_route('custom/v1', '/reviews/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'cra_delete_product_review',
        'permission_callback' => 'is_user_logged_in',
        'args' => [
            'id' => [
                'required' => true,
                'type' => 'integer',
                'validate_callback' => function($param) {
                    return is_numeric($param) && $param > 0;
                }
            ]
        ]
    ]);
});

/**
 * Create a product review
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function cra_create_product_review($request) {
    $product_id = $request->get_param('product_id');
    $review = $request->get_param('review');
    $rating = $request->get_param('rating');

    // Get current user (works for both logged-in and anonymous)
    $current_user = wp_get_current_user();
    
    // TEMPORARY: Allow anonymous reviews for testing
    // When you have proper authentication, uncomment the check below:
    /*
    if (!$current_user || !$current_user->ID) {
        return new WP_Error(
            'not_authenticated',
            'You must be logged in to submit a review',
            ['status' => 401]
        );
    }
    */
    
    // Use logged-in user info if available, otherwise try to get from request or localStorage
    if ($current_user && $current_user->ID) {
        // User is logged into WordPress
        $reviewer = $current_user->display_name;
        $reviewer_email = $current_user->user_email;
        $user_id = $current_user->ID;
    } else {
        // Try to get user info from Angular app (stored in localStorage)
        // Angular should send reviewer_name and reviewer_email in request
        $reviewer = $request->get_param('reviewer_name');
        $reviewer_email = $request->get_param('reviewer_email');
        
        // If still empty, check if there's user info from Angular's currentUser
        if (empty($reviewer)) {
            $reviewer = $request->get_param('first_name') ?: 'Anonymous Customer';
            if ($request->get_param('last_name')) {
                $reviewer .= ' ' . $request->get_param('last_name');
            }
        }
        
        if (empty($reviewer_email)) {
            $reviewer_email = $request->get_param('email') ?: 'anonymous@example.com';
        }
        
        $user_id = 0;
    }
    
    // Sanitize review content - strip HTML tags and clean up
    $review = wp_strip_all_tags($review); // Remove all HTML tags
    $review = trim($review); // Remove extra whitespace

    // Verify product exists
    $product = wc_get_product($product_id);
    if (!$product) {
        return new WP_Error(
            'product_not_found',
            'Product not found',
            ['status' => 404]
        );
    }

    // Check if WooCommerce reviews are enabled
    if (!wc_reviews_enabled()) {
        return new WP_Error(
            'reviews_disabled',
            'Reviews are disabled',
            ['status' => 403]
        );
    }

    // Check if product allows reviews
    if (!$product->get_reviews_allowed()) {
        return new WP_Error(
            'reviews_not_allowed',
            'Reviews are not allowed for this product',
            ['status' => 403]
        );
    }

    // TEMPORARY: Disable duplicate review check for testing
    // Uncomment this section when you want to prevent duplicate reviews
    /*
    // Check for duplicate reviews (same user + product)
    $existing_reviews = get_comments([
        'post_id' => $product_id,
        'user_id' => $user_id,
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

    // Prepare comment data
    $comment_data = [
        'comment_post_ID' => $product_id,
        'comment_author' => $reviewer,
        'comment_author_email' => $reviewer_email,
        'comment_content' => $review,
        'comment_type' => 'review',
        'comment_parent' => 0,
        'user_id' => $user_id,
        'comment_approved' => 1, // Auto-approve (change to 0 for moderation)
        'comment_date' => current_time('mysql'),
        'comment_date_gmt' => current_time('mysql', 1)
    ];

    // Insert comment
    $comment_id = wp_insert_comment($comment_data);

    if (!$comment_id) {
        return new WP_Error(
            'review_creation_failed',
            'Failed to create review',
            ['status' => 500]
        );
    }

    // Add rating meta
    update_comment_meta($comment_id, 'rating', intval($rating));

    // Update product rating count and average
    cra_update_product_rating($product_id);

    // Get the created comment
    $comment = get_comment($comment_id);

    // Format response
    $response = [
        'success' => true,
        'message' => 'Review submitted successfully',
        'review' => [
            'id' => $comment->comment_ID,
            'product_id' => $product_id,
            'date_created' => $comment->comment_date,
            'reviewer' => $comment->comment_author,
            'reviewer_email' => $comment->comment_author_email,
            'review' => $comment->comment_content,
            'rating' => intval(get_comment_meta($comment_id, 'rating', true)),
            'verified' => wc_review_is_from_verified_owner($comment_id),
            'status' => $comment->comment_approved === '1' ? 'approved' : 'pending',
            'user_id' => $user_id
        ]
    ];

    return new WP_REST_Response($response, 201);
}

/**
 * Update a product review
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function cra_update_product_review($request) {
    $comment_id = $request->get_param('id');
    $review_text = $request->get_param('review');
    $rating = $request->get_param('rating');

    // Get current user
    $current_user = wp_get_current_user();
    
    if (!$current_user || !$current_user->ID) {
        return new WP_Error(
            'not_authenticated',
            'You must be logged in to update a review',
            ['status' => 401]
        );
    }

    // Get the comment
    $comment = get_comment($comment_id);
    
    if (!$comment) {
        return new WP_Error(
            'review_not_found',
            'Review not found',
            ['status' => 404]
        );
    }

    // Check if user owns this review
    if (intval($comment->user_id) !== $current_user->ID) {
        return new WP_Error(
            'not_authorized',
            'You can only edit your own reviews',
            ['status' => 403]
        );
    }

    // Update comment content if provided
    if ($review_text !== null) {
        $update_data = [
            'comment_ID' => $comment_id,
            'comment_content' => sanitize_textarea_field($review_text)
        ];
        wp_update_comment($update_data);
    }

    // Update rating if provided
    if ($rating !== null) {
        update_comment_meta($comment_id, 'rating', intval($rating));
        // Recalculate product rating
        cra_update_product_rating($comment->comment_post_ID);
    }

    // Get updated comment
    $updated_comment = get_comment($comment_id);

    // Format response
    $response = [
        'success' => true,
        'message' => 'Review updated successfully',
        'review' => [
            'id' => $updated_comment->comment_ID,
            'product_id' => $updated_comment->comment_post_ID,
            'date_created' => $updated_comment->comment_date,
            'reviewer' => $updated_comment->comment_author,
            'review' => $updated_comment->comment_content,
            'rating' => intval(get_comment_meta($comment_id, 'rating', true)),
            'verified' => wc_review_is_from_verified_owner($comment_id),
            'status' => $updated_comment->comment_approved === '1' ? 'approved' : 'pending',
            'user_id' => $updated_comment->user_id
        ]
    ];

    return new WP_REST_Response($response, 200);
}

/**
 * Delete a product review
 *
 * @param WP_REST_Request $request
 * @return WP_REST_Response|WP_Error
 */
function cra_delete_product_review($request) {
    $comment_id = $request->get_param('id');

    // Get current user
    $current_user = wp_get_current_user();
    
    if (!$current_user || !$current_user->ID) {
        return new WP_Error(
            'not_authenticated',
            'You must be logged in to delete a review',
            ['status' => 401]
        );
    }

    // Get the comment
    $comment = get_comment($comment_id);
    
    if (!$comment) {
        return new WP_Error(
            'review_not_found',
            'Review not found',
            ['status' => 404]
        );
    }

    // Check if user owns this review or is admin
    if (intval($comment->user_id) !== $current_user->ID && !current_user_can('moderate_comments')) {
        return new WP_Error(
            'not_authorized',
            'You can only delete your own reviews',
            ['status' => 403]
        );
    }

    $product_id = $comment->comment_post_ID;

    // Delete the comment
    $deleted = wp_delete_comment($comment_id, true); // true = force delete permanently

    if (!$deleted) {
        return new WP_Error(
            'review_deletion_failed',
            'Failed to delete review',
            ['status' => 500]
        );
    }

    // Recalculate product rating
    cra_update_product_rating($product_id);

    // Format response
    $response = [
        'success' => true,
        'message' => 'Review deleted successfully',
        'id' => $comment_id
    ];

    return new WP_REST_Response($response, 200);
}

/**
 * Update product rating count and average
 *
 * @param int $product_id
 */
function cra_update_product_rating($product_id) {
    if (!function_exists('wc_get_product')) {
        return;
    }

    $product = wc_get_product($product_id);
    if (!$product) {
        return;
    }

    // Get all approved reviews with ratings
    $comments = get_comments([
        'post_id' => $product_id,
        'type' => 'review',
        'status' => 'approve',
        'meta_query' => [
            [
                'key' => 'rating',
                'value' => 0,
                'compare' => '>',
                'type' => 'NUMERIC'
            ]
        ]
    ]);

    $rating_count = 0;
    $rating_total = 0;

    foreach ($comments as $comment) {
        $rating = intval(get_comment_meta($comment->comment_ID, 'rating', true));
        if ($rating > 0) {
            $rating_count++;
            $rating_total += $rating;
        }
    }

    // Update product meta
    update_post_meta($product_id, '_wc_rating_count', $rating_count);
    
    if ($rating_count > 0) {
        $average_rating = number_format($rating_total / $rating_count, 2, '.', '');
        update_post_meta($product_id, '_wc_average_rating', $average_rating);
    } else {
        delete_post_meta($product_id, '_wc_average_rating');
    }

    // Clear product cache
    wc_delete_product_transients($product_id);
}

/**
 * CRITICAL: Remove ALL default WordPress CORS headers first
 * This prevents wildcard '*' from being sent
 */
add_action('rest_api_init', function() {
    // Remove default WordPress CORS
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
}, 5);

/**
 * Add our custom CORS headers with HIGHEST PRIORITY
 * This runs VERY EARLY to override any other CORS configurations
 * Now reads from WordPress database (Settings → CORS Settings)
 */
add_action('send_headers', function() {
    // Only process REST API requests
    if (strpos($_SERVER['REQUEST_URI'], '/wp-json/') !== false) {
        // Get the origin from the request
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        // Check if origin is allowed (using database config)
        if (cra_is_origin_allowed($origin)) {
            // Remove any existing CORS headers first
            header_remove('Access-Control-Allow-Origin');
            header_remove('Access-Control-Allow-Methods');
            header_remove('Access-Control-Allow-Credentials');
            header_remove('Access-Control-Allow-Headers');
            
            // Set our specific headers
            header('Access-Control-Allow-Origin: ' . $origin, true);
            header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
            header('Access-Control-Allow-Credentials: true', true);
            header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-WP-Nonce', true);
            header('Access-Control-Max-Age: 86400', true); // Cache preflight for 24 hours
        }
        
        // Handle OPTIONS preflight immediately
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            status_header(200);
            exit();
        }
    }
}, 1); // Priority 1 = runs FIRST

/**
 * Double-check CORS headers right before serving the response
 * This is our second line of defense
 * Now reads from WordPress database (Settings → CORS Settings)
 */
add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
    // Only apply to our custom endpoint
    if (strpos($request->get_route(), '/custom/v1/reviews') !== false) {
        $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
        
        // Check if origin is allowed (using database config)
        if (cra_is_origin_allowed($origin)) {
            // Force remove any wildcards
            header_remove('Access-Control-Allow-Origin');
            
            // Set correct header
            header('Access-Control-Allow-Origin: ' . $origin, true);
            header('Access-Control-Allow-Credentials: true', true);
        }
    }
    return $served;
}, 99, 4); // Priority 99 = runs LAST
