<?php
/**
 * CORS Configuration - Single Source of Truth
 * 
 * Update allowed origins HERE ONLY - both plugin and .htaccess will read from this file
 * 
 * Location: /wp-content/wp-cors-config.php
 * 
 * To add new origins:
 * 1. Add URL to the array below
 * 2. Save file
 * 3. Done! No need to modify plugin or .htaccess
 */

// Define allowed origins
$wp_cors_allowed_origins = [
    // Development
    'http://localhost:4200',
    'http://localhost:5300',
    'http://localhost:3000',
    
    // Production
    'https://rshossain.com',
    'https://www.rshossain.com',
    'https://rshossain.com/demo/ngwcommerce',
    'https://www.rshossain.com/demo/ngwcommerce',
    
    // Add more origins here as needed
    // 'https://staging.yourdomain.com',
    // 'https://app.yourdomain.com',
];

/**
 * Helper function to check if origin is allowed
 */
function wp_cors_is_origin_allowed($origin) {
    global $wp_cors_allowed_origins;
    return in_array($origin, $wp_cors_allowed_origins);
}

/**
 * Get all allowed origins as array
 */
function wp_cors_get_allowed_origins() {
    global $wp_cors_allowed_origins;
    return $wp_cors_allowed_origins;
}

/**
 * Get allowed origins formatted for .htaccess SetEnvIf directives
 * This generates the SetEnvIf lines dynamically
 */
function wp_cors_get_htaccess_rules() {
    global $wp_cors_allowed_origins;
    
    $rules = [];
    foreach ($wp_cors_allowed_origins as $origin) {
        // Escape dots for regex
        $escaped_origin = str_replace('.', '\.', $origin);
        $escaped_origin = str_replace('/', '\/', $escaped_origin);
        
        $rules[] = "SetEnvIf Origin \"^{$escaped_origin}$\" ORIGIN_MATCHED={$origin}";
    }
    
    return implode("\n    ", $rules);
}
