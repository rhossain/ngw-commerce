<?php
/**
 * CORS Origin Checker - For .htaccess
 * 
 * This file is called by .htaccess to dynamically check if origin is allowed
 * Location: /wp-content/cors-check.php
 * 
 * .htaccess will use: RewriteMap to call this script
 */

// Load CORS config
$config_file = __DIR__ . '/wp-cors-config.php';
if (file_exists($config_file)) {
    require_once($config_file);
    
    // Get origin from STDIN (passed by RewriteMap)
    $origin = trim(fgets(STDIN));
    
    // Check if allowed
    if (wp_cors_is_origin_allowed($origin)) {
        echo $origin; // Return the origin if allowed
    } else {
        echo "null"; // Return null if not allowed
    }
} else {
    echo "null";
}
