<?php
class NGWCS_REST_Products_Test extends WP_UnitTestCase {
    public function setUp(): void {
        parent::setUp();
        // Create sample products.
        for ( $i = 0; $i < 5; $i++ ) {
            wp_insert_post( array(
                'post_type'   => 'product',
                'post_title'  => 'Test Product ' . $i,
                'post_status' => 'publish',
            ) );
        }
    }

    public function test_products_endpoint_structure() {
        $request = new WP_REST_Request( 'GET', '/ngw/v1/products' );
        $response = rest_do_request( $request );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertArrayHasKey( 'items', $data );
        $this->assertArrayHasKey( 'page', $data );
        $this->assertArrayHasKey( 'perPage', $data );
        $this->assertArrayHasKey( 'totalPages', $data );
        $this->assertArrayHasKey( 'total', $data );
        if ( ! empty( $data['items'] ) ) {
            $first = $data['items'][0];
            $this->assertArrayHasKey( 'id', $first );
            $this->assertArrayHasKey( 'title', $first );
            $this->assertArrayHasKey( 'thumbUrl', $first );
        }
    }

    public function test_products_paging_and_search() {
        // Create extra products for paging
        for ( $i = 5; $i < 35; $i++ ) {
            wp_insert_post( array(
                'post_type'   => 'product',
                'post_title'  => 'Searchable Product ' . $i,
                'post_status' => 'publish',
            ) );
        }
        $page2 = rest_do_request( new WP_REST_Request( 'GET', '/ngw/v1/products?page=2&per_page=20' ) );
        $this->assertEquals( 200, $page2->get_status() );
        $data2 = $page2->get_data();
        $this->assertEquals( 2, $data2['page'] );
        // Search
        $searchReq = new WP_REST_Request( 'GET', '/ngw/v1/products?search=Searchable' );
        $searchResp = rest_do_request( $searchReq );
        $this->assertEquals( 200, $searchResp->get_status() );
        $searchData = $searchResp->get_data();
        $this->assertNotEmpty( $searchData['items'] );
    }
}
