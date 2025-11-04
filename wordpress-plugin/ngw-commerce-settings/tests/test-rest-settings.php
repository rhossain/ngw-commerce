<?php
class NGWCS_REST_Settings_Test extends WP_UnitTestCase {
    public function test_settings_contains_hero_order() {
        // Ensure plugin initializes.
        $request = new WP_REST_Request( 'GET', '/ngw/v1/settings' );
        $response = rest_do_request( $request );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'hero_slider_order', $data );
        $this->assertArrayHasKey( 'hero_slider_products', $data );
    }

    public function test_flush_cache_endpoint() {
        $before = intval( get_option( 'ngwcs_cache_version', 1 ) );
        $request = new WP_REST_Request( 'POST', '/ngw/v1/cache/flush' );
        $response = rest_do_request( $request );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertTrue( $data['success'] );
        $this->assertEquals( $before + 1, $data['cache_version'] );
    }
}
