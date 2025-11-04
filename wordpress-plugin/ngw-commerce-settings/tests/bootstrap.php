<?php
/**
 * Basic PHPUnit bootstrap for NGW Commerce Settings plugin.
 * Assumes WordPress test suite is installed and WP_TESTS_DIR env var points to its directory.
 */
$tests_dir = getenv('WP_TESTS_DIR');
if ( ! $tests_dir ) {
    fwrite(STDERR, "WP_TESTS_DIR environment variable not set. Skipping tests.\n");
    return;
}
require_once $tests_dir . '/includes/functions.php';

function _load_ngwcs_plugin() {
    require dirname( __DIR__ ) . '/ngw-commerce-settings.php';
}

tests_add_filter( 'muplugins_loaded', '_load_ngwcs_plugin' );
require $tests_dir . '/includes/bootstrap.php';
