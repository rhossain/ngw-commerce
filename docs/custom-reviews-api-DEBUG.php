<?php
/**
 * Plugin Name: Custom Reviews API - DEBUG VERSION
 * Description: Debug version with extensive logging to diagnose user info issue
 * Version: 5.1-DEBUG
 * Author: Your Name
 */

// Enable error logging
ini_set('log_errors', 1);
ini_set('error_log', WP_CONTENT_DIR . '/debug.log');

/**
 * Create a product review with extensive debugging
 */
function cra_create_product_review_debug($request) {
    // ============================================
    // DEBUG: Log ALL incoming request parameters
    // ============================================
    error_log('========================================');
    error_log('=== REVIEW REQUEST DEBUG (Version 5.1) ===');
    error_log('========================================');
    error_log('Timestamp: ' . date('Y-m-d H:i:s'));
    error_log('');
    
    // Log ALL parameters
    error_log('--- ALL REQUEST PARAMETERS ---');
    $all_params = $request->get_params();
    foreach ($all_params as $key => $value) {
        error_log($key . ': ' . (is_array($value) ? json_encode($value) : $value));
    }
    error_log('');
    
    // Log specific parameters we're looking for
    error_log('--- SPECIFIC PARAMETERS ---');
    error_log('product_id: ' . $request->get_param('product_id'));
    error_log('rating: ' . $request->get_param('rating'));
    error_log('review: ' . $request->get_param('review'));
    error_log('reviewer_name: ' . $request->get_param('reviewer_name'));
    error_log('reviewer_email: ' . $request->get_param('reviewer_email'));
    error_log('first_name: ' . $request->get_param('first_name'));
    error_log('last_name: ' . $request->get_param('last_name'));
    error_log('email: ' . $request->get_param('email'));
    error_log('');
    
    // Log request body
    error_log('--- RAW REQUEST BODY ---');
    error_log('Body: ' . $request->get_body());
    error_log('');
    
    // Log headers
    error_log('--- REQUEST HEADERS ---');
    $headers = $request->get_headers();
    foreach ($headers as $key => $value) {
        error_log($key . ': ' . (is_array($value) ? implode(', ', $value) : $value));
    }
    error_log('');
    
    // ============================================
    // ACTUAL REVIEW CREATION LOGIC
    // ============================================
    
    $product_id = $request->get_param('product_id');
    $review = $request->get_param('review');
    $rating = $request->get_param('rating');

    error_log('--- PROCESSING USER INFO ---');
    
    // Get current user (works for both logged-in and anonymous)
    $current_user = wp_get_current_user();
    error_log('WordPress User ID: ' . ($current_user->ID ?: 'Not logged in'));
    error_log('WordPress User Display Name: ' . ($current_user->display_name ?: 'None'));
    error_log('WordPress User Email: ' . ($current_user->user_email ?: 'None'));
    error_log('');
    
    // Use logged-in user info if available, otherwise try to get from request
    if ($current_user && $current_user->ID) {
        // User is logged into WordPress
        $reviewer = $current_user->display_name;
        $reviewer_email = $current_user->user_email;
        $user_id = $current_user->ID;
        
        error_log('Using WordPress User Info:');
        error_log('  Reviewer: ' . $reviewer);
        error_log('  Email: ' . $reviewer_email);
        error_log('  User ID: ' . $user_id);
    } else {
        error_log('Not logged into WordPress, checking request parameters...');
        
        // Try to get user info from Angular app (stored in localStorage)
        $reviewer = $request->get_param('reviewer_name');
        $reviewer_email = $request->get_param('reviewer_email');
        
        error_log('  reviewer_name param: ' . ($reviewer ?: 'EMPTY'));
        error_log('  reviewer_email param: ' . ($reviewer_email ?: 'EMPTY'));
        
        // If still empty, check if there's user info from Angular's currentUser
        if (empty($reviewer)) {
            error_log('  reviewer_name is empty, checking first_name/last_name...');
            
            $first_name = $request->get_param('first_name');
            $last_name = $request->get_param('last_name');
            
            error_log('  first_name param: ' . ($first_name ?: 'EMPTY'));
            error_log('  last_name param: ' . ($last_name ?: 'EMPTY'));
            
            $reviewer = $first_name ?: 'Anonymous Customer';
            if ($last_name) {
                $reviewer .= ' ' . $last_name;
            }
            
            error_log('  Constructed reviewer name: ' . $reviewer);
        }
        
        if (empty($reviewer_email)) {
            error_log('  reviewer_email is empty, checking email param...');
            
            $email_param = $request->get_param('email');
            error_log('  email param: ' . ($email_param ?: 'EMPTY'));
            
            $reviewer_email = $email_param ?: 'anonymous@example.com';
            
            error_log('  Final reviewer_email: ' . $reviewer_email);
        }
        
        $user_id = 0;
        
        error_log('');
        error_log('Using Request Parameters:');
        error_log('  Reviewer: ' . $reviewer);
        error_log('  Email: ' . $reviewer_email);
        error_log('  User ID: ' . $user_id);
    }
    error_log('');
    
    // Sanitize review content - strip HTML tags and clean up
    error_log('--- SANITIZING REVIEW CONTENT ---');
    error_log('Original review: ' . $review);
    
    $review = wp_strip_all_tags($review); // Remove all HTML tags
    $review = trim($review); // Remove extra whitespace
    
    error_log('Sanitized review: ' . $review);
    error_log('');

    // Verify product exists
    $product = wc_get_product($product_id);
    if (!$product) {
        error_log('ERROR: Product not found (ID: ' . $product_id . ')');
        error_log('========================================');
        return new WP_Error(
            'product_not_found',
            'Product not found',
            ['status' => 404]
        );
    }

    error_log('Product found: ' . $product->get_name());

    // Check if WooCommerce reviews are enabled
    if (!wc_reviews_enabled()) {
        error_log('ERROR: Reviews are disabled in WooCommerce settings');
        error_log('========================================');
        return new WP_Error(
            'reviews_disabled',
            'Reviews are disabled',
            ['status' => 403]
        );
    }

    // TEMPORARY: Commented out duplicate check for testing
    /*
    // Check for duplicate reviews
    $existing_review = get_comments([
        'post_id' => $product_id,
        'author_email' => $reviewer_email,
        'type' => 'review',
        'count' => true
    ]);

    if ($existing_review > 0) {
        return new WP_Error(
            'duplicate_review',
            'You have already reviewed this product',
            ['status' => 409]
        );
    }
    */

    // Create the review comment
    error_log('--- CREATING COMMENT ---');
    $comment_data = [
        'comment_post_ID' => $product_id,
        'comment_author' => $reviewer,
        'comment_author_email' => $reviewer_email,
        'comment_content' => $review,
        'comment_type' => 'review',
        'comment_parent' => 0,
        'user_id' => $user_id,
        'comment_approved' => 1, // Auto-approve for testing
    ];
    
    error_log('Comment data:');
    error_log('  comment_author: ' . $comment_data['comment_author']);
    error_log('  comment_author_email: ' . $comment_data['comment_author_email']);
    error_log('  comment_content: ' . $comment_data['comment_content']);
    error_log('');

    $comment_id = wp_insert_comment($comment_data);

    if (is_wp_error($comment_id)) {
        error_log('ERROR: Comment creation failed');
        error_log('Error message: ' . $comment_id->get_error_message());
        error_log('========================================');
        return $comment_id;
    }

    error_log('SUCCESS: Comment created with ID: ' . $comment_id);

    // Add rating
    if ($rating && $rating >= 1 && $rating <= 5) {
        update_comment_meta($comment_id, 'rating', intval($rating));
        error_log('Rating added: ' . $rating);
        
        // Update product rating
        cra_update_product_rating($product_id);
        error_log('Product rating updated');
    }

    error_log('========================================');
    error_log('');

    return new WP_REST_Response([
        'success' => true,
        'message' => 'Review created successfully',
        'review_id' => $comment_id,
        'debug_info' => [
            'reviewer_used' => $reviewer,
            'email_used' => $reviewer_email,
            'plugin_version' => '5.1-DEBUG'
        ]
    ], 201);
}

/**
 * Register REST API routes
 */
add_action('rest_api_init', function() {
    register_rest_route('custom/v1', '/reviews', [
        'methods' => 'POST',
        'callback' => 'cra_create_product_review_debug',
        'permission_callback' => '__return_true', // Allow anonymous
    ]);
});

/**
 * Update product rating (helper function)
 */
function cra_update_product_rating($product_id) {
    global $wpdb;

    $ratings = $wpdb->get_results($wpdb->prepare("
        SELECT meta_value
        FROM $wpdb->commentmeta
        LEFT JOIN $wpdb->comments ON $wpdb->commentmeta.comment_id = $wpdb->comments.comment_ID
        WHERE meta_key = 'rating'
        AND comment_post_ID = %d
        AND comment_approved = '1'
    ", $product_id));

    if ($ratings) {
        $rating_count = count($ratings);
        $rating_total = array_sum(array_column($ratings, 'meta_value'));
        $average_rating = $rating_total / $rating_count;

        update_post_meta($product_id, '_wc_average_rating', $average_rating);
        update_post_meta($product_id, '_wc_rating_count', $rating_count);
        update_post_meta($product_id, '_wc_review_count', $rating_count);
    }
}
