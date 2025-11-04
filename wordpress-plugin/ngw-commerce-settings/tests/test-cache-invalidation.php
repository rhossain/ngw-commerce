<?php
/**
 * Cache invalidation tests.
 */
class NGWCS_Cache_Invalidation_Test extends WP_UnitTestCase {

    public function test_product_save_bumps_cache_version() {
        $initial = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        // Create a product (assuming 'product' CPT exists in environment; if not, simulate via register_post_type).
        if ( ! post_type_exists( 'product' ) ) {
            register_post_type( 'product', array( 'public' => true ) );
        }
        $pid = wp_insert_post( array( 'post_title' => 'Test Product Flush', 'post_type' => 'product', 'post_status' => 'publish' ) );
        $this->assertTrue( (bool) $pid );
        // Saving again should trigger bump.
        wp_update_post( array( 'ID' => $pid, 'post_title' => 'Test Product Flush Updated' ) );
        $after = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        $this->assertGreaterThan( $initial, $after, 'Cache version should bump after product save.' );
    }

    public function test_category_change_bumps_cache_version() {
        $initial = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        // Ensure taxonomy exists.
        if ( ! taxonomy_exists( 'product_cat' ) ) {
            register_taxonomy( 'product_cat', 'product' );
        }
        $term = wp_insert_term( 'FlushCat', 'product_cat' );
        $this->assertFalse( is_wp_error( $term ) );
        $after_create = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        $this->assertGreaterThan( $initial, $after_create, 'Cache version should bump after category create.' );
        // Edit term.
        wp_update_term( $term['term_id'], 'product_cat', array( 'name' => 'FlushCatEdited' ) );
        $after_edit = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        $this->assertGreaterThan( $after_create, $after_edit, 'Cache version should bump after category edit.' );
        // Delete term.
        wp_delete_term( $term['term_id'], 'product_cat' );
        $after_delete = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        $this->assertGreaterThan( $after_edit, $after_delete, 'Cache version should bump after category delete.' );
    }
}
