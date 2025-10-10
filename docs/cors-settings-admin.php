<?php
/**
 * CORS Settings Admin Page with Database Storage
 * 
 * Allows WordPress admins to manage CORS origins through the admin panel
 * No coding required - just add/remove URLs via UI!
 */

/**
 * Add admin menu for CORS settings
 */
add_action('admin_menu', function() {
    add_options_page(
        'CORS Settings',           // Page title
        'CORS Settings',           // Menu title
        'manage_options',          // Capability
        'cors-settings',           // Menu slug
        'cra_cors_settings_page'   // Callback function
    );
});

/**
 * Register settings
 */
add_action('admin_init', function() {
    register_setting('cors_settings_group', 'cors_allowed_origins', [
        'type' => 'array',
        'sanitize_callback' => 'cra_sanitize_origins',
        'default' => [
            'http://localhost:4200',
            'http://localhost:5300',
            'http://localhost:3000',
        ]
    ]);
});

/**
 * Sanitize origins input
 */
if (!function_exists('cra_sanitize_origins')) {
    function cra_sanitize_origins($input) {
        if (!is_array($input)) {
            return [];
        }
        
        $sanitized = [];
        foreach ($input as $origin) {
            $origin = trim($origin);
            
            // Validate URL format
            if (filter_var($origin, FILTER_VALIDATE_URL)) {
                $sanitized[] = esc_url_raw($origin);
            }
        }
        
        return array_unique($sanitized);
    }
}

/**
 * Get allowed origins from database
 * (Admin panel version - simplified for display)
 */
if (!function_exists('cra_get_allowed_origins')) {
    function cra_get_allowed_origins() {
        $origins = get_option('cors_allowed_origins', [
            'http://localhost:4200',
            'http://localhost:5300',
            'http://localhost:3000',
        ]);
        
        return is_array($origins) ? $origins : [];
    }
}

/**
 * CORS Settings Admin Page
 */
if (!function_exists('cra_cors_settings_page')) {
    function cra_cors_settings_page() {
    // Check user permissions
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Handle form submission
    if (isset($_POST['cors_origins_submit'])) {
        check_admin_referer('cors_settings_update', 'cors_settings_nonce');
        
        // Get origins from textarea
        $origins_text = sanitize_textarea_field($_POST['cors_origins']);
        $origins_array = array_filter(array_map('trim', explode("\n", $origins_text)));
        
        // Sanitize and save
        $sanitized = cra_sanitize_origins($origins_array);
        update_option('cors_allowed_origins', $sanitized);
        
        echo '<div class="notice notice-success"><p>CORS settings saved successfully!</p></div>';
    }
    
    // Get current origins
    $current_origins = cra_get_allowed_origins();
    $origins_text = implode("\n", $current_origins);
    
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        <p>Manage allowed origins for CORS (Cross-Origin Resource Sharing). Add your Angular app URLs here.</p>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Allowed Origins</h2>
            <p>Enter one URL per line. These origins will be allowed to make authenticated requests to your API.</p>
            
            <form method="post" action="">
                <?php wp_nonce_field('cors_settings_update', 'cors_settings_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="cors_origins">Allowed Origins</label>
                        </th>
                        <td>
                            <textarea 
                                name="cors_origins" 
                                id="cors_origins" 
                                rows="10" 
                                cols="50" 
                                class="large-text code"
                                placeholder="http://localhost:4200&#10;https://yourdomain.com"
                            ><?php echo esc_textarea($origins_text); ?></textarea>
                            <p class="description">
                                Enter one URL per line. Examples:<br>
                                <code>http://localhost:4200</code><br>
                                <code>https://yourdomain.com</code><br>
                                <code>https://www.yourdomain.com</code>
                            </p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Save Origins', 'primary', 'cors_origins_submit'); ?>
            </form>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Current Configuration</h2>
            <p>Your currently configured origins:</p>
            
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th width="50">#</th>
                        <th>Origin URL</th>
                        <th width="100">Status</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($current_origins)): ?>
                        <tr>
                            <td colspan="3">No origins configured. Add some above!</td>
                        </tr>
                    <?php else: ?>
                        <?php foreach ($current_origins as $index => $origin): ?>
                        <tr>
                            <td><?php echo ($index + 1); ?></td>
                            <td><code><?php echo esc_html($origin); ?></code></td>
                            <td><span class="dashicons dashicons-yes-alt" style="color: green;"></span> Active</td>
                        </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>Generated .htaccess Rules</h2>
            <p>Copy these rules to your <code>.htaccess</code> file (replace the CORS section):</p>
            
            <textarea readonly style="width: 100%; height: 300px; font-family: monospace; font-size: 12px; padding: 10px; background: #f5f5f5;" onclick="this.select();"><?php
            
            echo "# BEGIN CORS Headers for WooCommerce API - AUTO-GENERATED\n";
            echo "# Generated on: " . date('Y-m-d H:i:s') . "\n";
            echo "# Source: WordPress Admin → Settings → CORS Settings\n";
            echo "# To update: Edit origins in admin panel, then copy new rules\n";
            echo "<IfModule mod_headers.c>\n";
            echo "    # Whitelist specific origins (no wildcard allowed with credentials)\n";
            
            foreach ($current_origins as $origin) {
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
                <button class="button button-primary" onclick="
                    var textarea = this.parentElement.previousElementSibling;
                    textarea.select();
                    document.execCommand('copy');
                    alert('Copied to clipboard! Paste into your .htaccess file.');
                ">
                    📋 Copy to Clipboard
                </button>
            </p>
        </div>
        
        <div class="card" style="max-width: 800px; margin-top: 20px;">
            <h2>📚 How to Use</h2>
            <ol>
                <li><strong>Add Origins:</strong> Enter your Angular app URLs in the textarea above (one per line)</li>
                <li><strong>Click "Save Origins":</strong> WordPress saves them to the database</li>
                <li><strong>WordPress Plugin Updates Automatically:</strong> No reactivation needed! ✅</li>
                <li><strong>Update .htaccess:</strong> Copy the generated rules and paste into your <code>.htaccess</code> file</li>
                <li><strong>Test:</strong> Your Angular app should now work without CORS errors! 🎉</li>
            </ol>
            
            <h3>📝 Common URLs to Add:</h3>
            <ul>
                <li><code>http://localhost:4200</code> - Default Angular dev server</li>
                <li><code>http://localhost:5300</code> - Custom port</li>
                <li><code>https://yourdomain.com</code> - Production (root)</li>
                <li><code>https://www.yourdomain.com</code> - Production (with www)</li>
                <li><code>https://staging.yourdomain.com</code> - Staging environment</li>
            </ul>
            
            <h3>⚠️ Important Notes:</h3>
            <ul>
                <li>Enter <strong>exact URLs</strong> - no wildcards or regex</li>
                <li>Include protocol (<code>http://</code> or <code>https://</code>)</li>
                <li><strong>No trailing slashes</strong> - use <code>https://domain.com</code> not <code>https://domain.com/</code></li>
                <li>WordPress plugin reads from database automatically</li>
                <li>.htaccess needs manual update (copy/paste from above)</li>
            </ul>
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
        .card ul, .card ol {
            padding-left: 20px;
        }
        .card code {
            background: #f0f0f1;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
    <?php
    }
}
