<?php
class NGWCS_ETag_Test extends WP_UnitTestCase {
    public function test_etag_304() {
        // Initial GET
        $request1 = new WP_REST_Request('GET', '/ngw/v1/settings');
        $response1 = rest_do_request($request1);
        $this->assertEquals(200, $response1->get_status());
        $etag = $response1->get_headers()['ETag'] ?? '';
        $this->assertNotEmpty($etag, 'ETag header should be present');
        // Second GET with If-None-Match
        $request2 = new WP_REST_Request('GET', '/ngw/v1/settings');
        $request2->set_header('If-None-Match', $etag);
        $response2 = rest_do_request($request2);
        $this->assertEquals(304, $response2->get_status(), 'Should return 304 Not Modified when ETag matches');
    }
}
