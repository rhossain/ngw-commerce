<?php
class NGWCS_Flush_Rate_Limit_Test extends WP_UnitTestCase {
    public function setUp(): void {
        parent::setUp();
        // Ensure custom capability present.
        $admin = get_role('administrator');
        if($admin && !$admin->has_cap('manage_ngw_commerce_settings')){ $admin->add_cap('manage_ngw_commerce_settings'); }
        wp_set_current_user(1); // assume admin user id 1 exists in test suite
    }

    public function test_flush_rate_limit() {
        // First flush should succeed.
        $request1 = new WP_REST_Request('POST', '/ngw/v1/cache/flush');
        $request1->set_header('x-wp-nonce', wp_create_nonce('wp_rest'));
        $response1 = rest_do_request($request1);
        $this->assertEquals(200, $response1->get_status());
        $data1 = $response1->get_data();
        $this->assertTrue($data1['success']);
        // Immediate second flush should give 429.
        $request2 = new WP_REST_Request('POST', '/ngw/v1/cache/flush');
        $request2->set_header('x-wp-nonce', wp_create_nonce('wp_rest'));
        $response2 = rest_do_request($request2);
        $this->assertEquals(429, $response2->get_status(), 'Second flush should be rate-limited');
        $data2 = $response2->get_data();
        $this->assertArrayHasKey('retry_after', $data2);
    }
}
