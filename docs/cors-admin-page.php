<?php
/**
 * CORS Configuration Admin Page
 * 
 * Add this to custom-reviews-api.php to create an admin page
 * that shows current CORS origins and generates .htaccess rules
 */

/**
 * Add admin menu for CORS configuration
 */
add_action('admin_menu', function() {
    add_management_page(
        'CORS Configuration',
        'CORS Config',
        'manage_options',
        'cors-config',
        'cra_cors_config_page'
    );
});

/**
 * CORS Configuration Admin Page
 */
function cra_cors_config_page() {
    // Check user permissions
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Get allowed origins
    $allowed_origins = wp_cors_get_allowed_origins();
    
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <div class="card">
            <h2>Current Allowed Origins</h2>
            <p>These origins are configured in <code>/wp-content/wp-cors-config.php</code></p>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Origin</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($allowed_origins as $index => $origin): ?>
                    <tr>
                        <td><?php echo ($index + 1); ?></td>
                        <td><code><?php echo esc_html($origin); ?></code></td>
                        <td><span class="dashicons dashicons-yes-alt" style="color: green;"></span> Active</td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h2>Generated .htaccess Rules</h2>
            <p>Copy and paste these rules into your <code>.htaccess</code> file (replace the CORS section):</p>
            
            <textarea readonly style="width: 100%; height: 400px; font-family: monospace; font-size: 12px; padding: 10px;" onclick="this.select();"><?php
            
            echo "# BEGIN CORS Headers for WooCommerce API - AUTO-GENERATED\n";
            echo "# Generated on: " . date('Y-m-d H:i:s') . "\n";
            echo "# Source: /wp-content/wp-cors-config.php\n";
            echo "# Update origins in wp-cors-config.php, then regenerate from Tools → CORS Config\n";
            echo "<IfModule mod_headers.c>\n";
            echo "    # Whitelist specific origins (no wildcard allowed with credentials)\n";
            
            foreach ($allowed_origins as $origin) {
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
            
            ?></textarea>
            
            <p>
                <button class="button button-primary" onclick="document.querySelector('textarea').select(); document.execCommand('copy'); alert('Copied to clipboard!');">
                    Copy to Clipboard
                </button>
            </p>
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h2>How to Update Origins</h2>
            <ol>
                <li>Edit <code>/wp-content/wp-cors-config.php</code> on your server</li>
                <li>Add or remove origins in the <code>$wp_cors_allowed_origins</code> array</li>
                <li>Save the file - the WordPress plugin will use it automatically</li>
                <li>Come back to this page and copy the new .htaccess rules</li>
                <li>Update your <code>.htaccess</code> file with the new rules</li>
            </ol>
            
            <p><strong>Example:</strong></p>
            <pre style="background: #f5f5f5; padding: 10px; border-left: 3px solid #0073aa;">$wp_cors_allowed_origins = [
    'http://localhost:4200',
    'https://yourdomain.com',  // Add your production URL here
];</pre>
        </div>
    </div>
    
    <style>
        .card {
            padding: 20px;
            background: white;
            border: 1px solid #ccd0d4;
            box-shadow: 0 1px 1px rgba(0,0,0,.04);
        }
        .card h2 {
            margin-top: 0;
        }
    </style>
    <?php
}
