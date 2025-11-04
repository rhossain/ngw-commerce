<?php
class NGWCS_REST_Category_Products_Test extends WP_UnitTestCase {
    protected $category_id;

    public function setUp(): void {
        parent::setUp();
        $term = wp_insert_term( 'Sample Category', 'product_cat' );
        $this->category_id = is_wp_error( $term ) ? 0 : $term['term_id'];
        for ( $i = 0; $i < 3; $i++ ) {
            $pid = wp_insert_post( array(
                'post_type'   => 'product',
                'post_title'  => 'Cat Product ' . $i,
                'post_status' => 'publish',
            ) );
            if ( $this->category_id ) {
                wp_set_object_terms( $pid, array( $this->category_id ), 'product_cat' );
            }
            // Assign price meta for sorting tests
            update_post_meta( $pid, '_price', 10 + $i );
        }
    }

    public function test_category_products_endpoint() {
        if ( ! $this->category_id ) {
            $this->markTestSkipped( 'Category creation failed.' );
        }
        $request = new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id );
        $response = rest_do_request( $request );
        $this->assertEquals( 200, $response->get_status() );
        $data = $response->get_data();
        $this->assertEquals( $this->category_id, $data['category'] );
        $this->assertArrayHasKey( 'items', $data );
        if ( ! empty( $data['items'] ) ) {
            $first = $data['items'][0];
            $this->assertArrayHasKey( 'id', $first );
            $this->assertArrayHasKey( 'title', $first );
            $this->assertArrayHasKey( 'thumbUrl', $first );
        }
    }

    public function test_category_products_paging_and_search() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        // Add more products to category
        for ( $i = 3; $i < 25; $i++ ) {
            $pid = wp_insert_post( array(
                'post_type'   => 'product',
                'post_title'  => 'Extra Cat Product ' . $i,
                'post_status' => 'publish',
            ) );
            wp_set_object_terms( $pid, array( $this->category_id ), 'product_cat' );
            update_post_meta( $pid, '_price', 10 + $i );
        }
        $page2 = rest_do_request( new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?page=2&per_page=10' ) );
        $this->assertEquals( 200, $page2->get_status() );
        $data2 = $page2->get_data();
        $this->assertEquals( 2, $data2['page'] );
        $search = rest_do_request( new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?search=Extra' ) );
        $this->assertEquals( 200, $search->get_status() );
        $searchData = $search->get_data();
        $this->assertNotEmpty( $searchData['items'] );
    }

    public function test_category_products_sort_price_desc() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        // Ensure enough products with price
        for ( $i = 25; $i < 30; $i++ ) {
            $pid = wp_insert_post( array(
                'post_type'   => 'product',
                'post_title'  => 'Priced Product ' . $i,
                'post_status' => 'publish',
            ) );
            wp_set_object_terms( $pid, array( $this->category_id ), 'product_cat' );
            update_post_meta( $pid, '_price', 5 + $i );
        }
        $req = new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?sort=price_desc&per_page=5' );
        $resp = rest_do_request( $req );
        $this->assertEquals( 200, $resp->get_status() );
        $data = $resp->get_data();
        $this->assertArrayHasKey( 'items', $data );
        $items = $data['items'];
        if ( count( $items ) >= 2 ) {
            $this->assertArrayHasKey( 'price', $items[0] );
            $this->assertTrue( $items[0]['price'] >= $items[1]['price'], 'Expected first item to have price >= second item' );
        }
    }

    public function test_category_products_sort_price_asc() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        $req = new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?sort=price_asc&per_page=5' );
        $resp = rest_do_request( $req );
        $this->assertEquals( 200, $resp->get_status() );
        $data = $resp->get_data();
        $items = $data['items'];
        if ( count( $items ) >= 2 ) {
            $this->assertTrue( $items[0]['price'] <= $items[1]['price'], 'Expected ascending price order' );
        }
    }

    public function test_category_products_sort_newest() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        // Create a newer product explicitly
        $new_id = wp_insert_post( array(
            'post_type'   => 'product',
            'post_title'  => 'Newest Product',
            'post_status' => 'publish',
        ) );
        wp_set_object_terms( $new_id, array( $this->category_id ), 'product_cat' );
        update_post_meta( $new_id, '_price', 999 );
        $req = new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?sort=newest&per_page=5' );
        $resp = rest_do_request( $req );
        $this->assertEquals( 200, $resp->get_status() );
        $data = $resp->get_data();
        $items = $data['items'];
        if ( ! empty( $items ) ) {
            $this->assertEquals( $new_id, $items[0]['id'], 'Expected newest product first when sorting by newest.' );
        }
    }

    public function test_category_products_sort_newest_price_asc() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        // Create two products with identical post_date but different prices to test tie-break ascending
        $date = current_time( 'mysql' );
        $p_low = wp_insert_post( array( 'post_type' => 'product', 'post_title' => 'Tie Low Price', 'post_status' => 'publish', 'post_date' => $date, 'post_date_gmt' => get_gmt_from_date( $date ) ) );
        $p_high = wp_insert_post( array( 'post_type' => 'product', 'post_title' => 'Tie High Price', 'post_status' => 'publish', 'post_date' => $date, 'post_date_gmt' => get_gmt_from_date( $date ) ) );
        wp_set_object_terms( $p_low, array( $this->category_id ), 'product_cat' );
        wp_set_object_terms( $p_high, array( $this->category_id ), 'product_cat' );
        update_post_meta( $p_low, '_price', 50 );
        update_post_meta( $p_high, '_price', 150 );
        $req = new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?sort=newest_price_asc&per_page=5' );
        $resp = rest_do_request( $req );
        $this->assertEquals( 200, $resp->get_status() );
        $data = $resp->get_data();
        $items = $data['items'];
        if ( count( $items ) >= 2 ) {
            // Both tie-date products should appear with lower price first inside same-date grouping
            $ids = wp_list_pluck( $items, 'id' );
            $low_index = array_search( $p_low, $ids );
            $high_index = array_search( $p_high, $ids );
            $this->assertTrue( $low_index !== false && $high_index !== false && $low_index < $high_index, 'Expected lower price before higher price for newest_price_asc tie-break.' );
        }
    }

    public function test_category_products_sort_newest_price_desc() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        $date = current_time( 'mysql' );
        $p_low = wp_insert_post( array( 'post_type' => 'product', 'post_title' => 'Tie Low Price Desc', 'post_status' => 'publish', 'post_date' => $date, 'post_date_gmt' => get_gmt_from_date( $date ) ) );
        $p_high = wp_insert_post( array( 'post_type' => 'product', 'post_title' => 'Tie High Price Desc', 'post_status' => 'publish', 'post_date' => $date, 'post_date_gmt' => get_gmt_from_date( $date ) ) );
        wp_set_object_terms( $p_low, array( $this->category_id ), 'product_cat' );
        wp_set_object_terms( $p_high, array( $this->category_id ), 'product_cat' );
        update_post_meta( $p_low, '_price', 40 );
        update_post_meta( $p_high, '_price', 240 );
        $req = new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?sort=newest_price_desc&per_page=5' );
        $resp = rest_do_request( $req );
        $this->assertEquals( 200, $resp->get_status() );
        $data = $resp->get_data();
        $items = $data['items'];
        if ( count( $items ) >= 2 ) {
            $ids = wp_list_pluck( $items, 'id' );
            $high_index = array_search( $p_high, $ids );
            $low_index  = array_search( $p_low, $ids );
            $this->assertTrue( $high_index !== false && $low_index !== false && $high_index < $low_index, 'Expected higher price before lower price for newest_price_desc tie-break.' );
        }
    }

    public function test_category_products_stock_fields_present() {
        if ( ! $this->category_id ) { $this->markTestSkipped( 'Category creation failed.' ); }
        // Add a product with stock meta
        $pid = wp_insert_post( array( 'post_type' => 'product', 'post_title' => 'Stocked Product', 'post_status' => 'publish' ) );
        wp_set_object_terms( $pid, array( $this->category_id ), 'product_cat' );
        update_post_meta( $pid, '_price', 77 );
        update_post_meta( $pid, '_stock_status', 'instock' );
        update_post_meta( $pid, '_stock', 12 );
        $resp = rest_do_request( new WP_REST_Request( 'GET', '/ngw/v1/category-products/' . $this->category_id . '?per_page=10' ) );
        $this->assertEquals( 200, $resp->get_status() );
        $data = $resp->get_data();
        $found = false;
        foreach ( $data['items'] as $it ) {
            if ( $it['id'] === $pid ) {
                $this->assertArrayHasKey( 'stockStatus', $it );
                $this->assertArrayHasKey( 'stock', $it );
                $this->assertEquals( 'instock', $it['stockStatus'] );
                $this->assertEquals( 12, $it['stock'] );
                $found = true;
                break;
            }
        }
        $this->assertTrue( $found, 'Expected stocked product with stock fields in response.' );
    }
}
