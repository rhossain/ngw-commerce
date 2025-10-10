<?php
/**
 * CORS .htaccess Rules Generator
 * 
 * This script generates .htaccess rules from the centralized CORS config
 * Run this script whenever you update wp-cors-config.php
 * 
 * Usage:
 * 1. Upload wp-cors-config.php to /wp-content/
 * 2. Run this script: php generate-htaccess-cors.php
 * 3. Copy output and paste into your .htaccess file
 * 
 * Or run via WordPress admin:
 * - Tools → CORS Config → Generate .htaccess Rules
 */

// Load WordPress
require_once(__DIR__ . '/../../../wp-load.php');

// Load CORS config
require_once(WP_CONTENT_DIR . '/wp-cors-config.php');

// Get allowed origins
$allowed_origins = wp_cors_get_allowed_origins();

echo "# BEGIN CORS Headers for WooCommerce API - AUTO-GENERATED\n";
echo "# Generated on: " . date('Y-m-d H:i:s') . "\n";
echo "# DO NOT EDIT MANUALLY - Regenerate using generate-htaccess-cors.php\n";
echo "<IfModule mod_headers.c>\n";
echo "    # Whitelist specific origins (no wildcard allowed with credentials)\n";

// Generate SetEnvIf rules for each origin
foreach ($allowed_origins as $origin) {
    // Escape dots and slashes for regex
    $escaped = str_replace('.', '\.', $origin);
    $escaped = str_replace('/', '\/', $escaped);
    
    echo "    SetEnvIf Origin \"^{$escaped}$\" ORIGIN_MATCHED={$origin}\n";
}

echo "    \n";
echo "    # Set CORS headers only for whitelisted origins\n";
echo "    Header always set Access-Control-Allow-Origin \"%{ORIGIN_MATCHED}e\" env=ORIGIN_MATCHED\n";
echo "    Header always set Access-Control-Allow-Methods \"GET, POST, PUT, DELETE, OPTIONS, PATCH\"\n";
echo "    Header always set Access-Control-Allow-Headers \"Authorization, Content-Type, X-Requested-With, Accept, Origin, X-WP-Nonce\"\n";
echo "    Header always set Access-Control-Allow-Credentials \"true\"\n";
echo "    Header always set Access-Control-Max-Age \"3600\"\n";
echo "    \n";
echo "    # Handle OPTIONS preflight requests\n";
echo "    RewriteCond %{REQUEST_METHOD} OPTIONS\n";
echo "    RewriteRule ^(.*)$ $1 [R=200,L]\n";
echo "</IfModule>\n";
echo "# END CORS Headers\n";
