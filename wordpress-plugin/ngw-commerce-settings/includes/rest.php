<?php
class NGWCS_Rest {
    const NAMESPACE = 'ngw/v1';

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( self::NAMESPACE, '/settings', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'get_settings' ),
                'permission_callback' => '__return_true', // Public consumption by Angular app (consider adding API key in future).
            ),
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'update_settings' ),
                'permission_callback' => array( $this, 'can_manage' ),
                'args'                => $this->update_args_schema(),
            ),
        ) );

        // Search products
        register_rest_route( self::NAMESPACE, '/search/products', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'search_products' ),
                'permission_callback' => array( $this, 'can_manage' ), // Admin-only for backend UI.
                'args'                => array(
                    'q'      => array( 'type' => 'string', 'required' => false ),
                    'exclude'=> array( 'type' => 'array', 'required' => false ),
                    'page'   => array( 'type' => 'integer', 'required' => false ),
                ),
            )
        ) );

        // Search categories
        register_rest_route( self::NAMESPACE, '/search/categories', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'search_categories' ),
                'permission_callback' => array( $this, 'can_manage' ),
                'args'                => array(
                    'q'    => array( 'type' => 'string', 'required' => false ),
                    'page' => array( 'type' => 'integer', 'required' => false ),
                ),
            )
        ) );

        // Paginated products list
        register_rest_route( self::NAMESPACE, '/products', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'list_products' ),
                'permission_callback' => array( $this, 'can_manage' ),
                'args'                => array(
                    'page'       => array( 'type' => 'integer', 'required' => false ),
                    'per_page'   => array( 'type' => 'integer', 'required' => false ),
                    'search'     => array( 'type' => 'string', 'required' => false ),
                    'sort'       => array( 'type' => 'string', 'required' => false, 'description' => __( 'Sort key: newest|price_asc|price_desc', 'ngw-commerce-settings' ) ),
                ),
            )
        ) );

        // Paginated products for category
        register_rest_route( self::NAMESPACE, '/category-products/(?P<id>\d+)', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'list_category_products' ),
                'permission_callback' => array( $this, 'can_manage' ),
                'args'                => array(
                    'id'        => array( 'type' => 'integer', 'required' => true ),
                    'page'      => array( 'type' => 'integer', 'required' => false ),
                    'per_page'  => array( 'type' => 'integer', 'required' => false ),
                    'search'    => array( 'type' => 'string', 'required' => false ),
                    'sort'      => array( 'type' => 'string', 'required' => false, 'description' => __( 'Sort key: newest|price_asc|price_desc', 'ngw-commerce-settings' ) ),
                ),
            )
        ) );

        // Cache flush endpoint
        register_rest_route( self::NAMESPACE, '/cache/flush', array(
            array(
                'methods'             => WP_REST_Server::EDITABLE,
                'callback'            => array( $this, 'flush_cache' ),
                'permission_callback' => array( $this, 'can_manage' ),
            )
        ) );

        // Flush log (audit) endpoint - secured.
        register_rest_route( self::NAMESPACE, '/cache/flush-log', array(
            array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( $this, 'flush_log' ),
                'permission_callback' => array( $this, 'can_manage' ),
                'args'                => array(
                    'limit' => array( 'type' => 'integer', 'required' => false ),
                ),
            )
        ) );
    }

    public function can_manage() {
        return function_exists( 'ngwcs_current_user_can_manage' ) ? ngwcs_current_user_can_manage() : current_user_can( 'manage_options' );
    }

    public function get_settings( WP_REST_Request $request ) {
        $settings = ngwcs_get_settings();
        // Optionally enrich with product/category meta (titles) maintaining order.
    $ordered_ids = ! empty( $settings['hero_slider_order'] ) ? $settings['hero_slider_order'] : $settings['hero_slider_products'];
    $settings['hero_slider_details'] = $this->augment_products( $ordered_ids );
    // Increment schema version when we add/change fields so ETag busts and clients refetch body.
    $settings['schema_version'] = 5; // v5 adds product slug for internal routing
        $settings['featured_category_details'] = $this->augment_categories( $settings['featured_categories'] );
        $settings['highlighted_category_details'] = $this->augment_map( $settings['highlighted_category_map'] );
        $settings['cache_version'] = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        // Generate ETag from cache version + updated_at for efficient Angular client caching.
    $etag = md5( $settings['cache_version'] . '|' . $settings['updated_at'] . '|' . $settings['schema_version'] );
        $if_none_match = $request->get_header( 'if-none-match' );
        if ( $if_none_match && trim( $if_none_match, '"' ) === $etag ) {
            $response = new WP_REST_Response( null, 304 );
            $response->header( 'ETag', '"' . $etag . '"' );
            return $response;
        }
        $response = new WP_REST_Response( $settings, 200 );
        $response->header( 'ETag', '"' . $etag . '"' );
        return $response;
    }

    public function update_settings( WP_REST_Request $request ) {
        $params = $request->get_json_params();
        if ( empty( $params ) ) {
            $params = $request->get_body_params();
        }
        if ( ! is_array( $params ) ) {
            return new WP_Error( 'ngwcs_invalid', __( 'Invalid payload.', 'ngw-commerce-settings' ), array( 'status' => 400 ) );
        }
        $updated = ngwcs_update_settings( $params );
        return new WP_REST_Response( $updated, 200 );
    }

    private function update_args_schema() {
        return array(
            'hero_slider_products' => array(
                'type'        => 'array',
                'items'       => array( 'type' => 'integer' ),
                'required'    => false,
                'description' => __( 'Array of product IDs for hero slider.', 'ngw-commerce-settings' )
            ),
            'featured_categories' => array(
                'type'        => 'array',
                'items'       => array( 'type' => 'integer' ),
                'required'    => false,
                'description' => __( 'Array of category term IDs to feature.', 'ngw-commerce-settings' )
            ),
            'highlighted_category_map' => array(
                'type'        => 'object',
                'required'    => false,
                'description' => __( 'Category ID to array of product IDs mapping.', 'ngw-commerce-settings' )
            ),
        );
    }

    private function augment_products( $ids ) {
        $out = array();
        $currency = function_exists( 'get_woocommerce_currency' ) ? get_woocommerce_currency() : get_option( 'woocommerce_currency', 'USD' );
        foreach ( (array) $ids as $id ) {
            $id = absint( $id );
            $post = get_post( $id );
            if ( $post && $post->post_type === 'product' ) {
                $product = function_exists( 'wc_get_product' ) ? wc_get_product( $id ) : null;
                $regular_num  = null;
                $sale_num     = null;
                $price_num    = null;
                if ( $product ) {
                    // These return string prices; cast to float or null
                    $regular_raw = $product->get_regular_price();
                    $sale_raw    = $product->get_sale_price();
                    $price_raw   = $product->get_price(); // effective (sale if applicable)
                    $regular_num = $regular_raw !== '' ? (float) $regular_raw : null;
                    $sale_num    = $sale_raw !== '' ? (float) $sale_raw : null;
                    $price_num   = $price_raw !== '' ? (float) $price_raw : null;
                } else {
                    // Fallback to meta if product API unavailable
                    $price        = get_post_meta( $id, '_price', true );
                    $regular      = get_post_meta( $id, '_regular_price', true );
                    $sale         = get_post_meta( $id, '_sale_price', true );
                    $price_num    = $price !== '' ? (float) $price : null;
                    $regular_num  = $regular !== '' ? (float) $regular : null;
                    $sale_num     = $sale !== '' ? (float) $sale : null;
                }
                $discount_pct = null;
                if ( $regular_num && $sale_num && $sale_num < $regular_num && $regular_num > 0 ) {
                    $discount_pct = (int) round( ( ( $regular_num - $sale_num ) / $regular_num ) * 100 );
                }
                $thumb_url = get_the_post_thumbnail_url( $id, 'large' );
                if ( ! $thumb_url && function_exists( 'wc_placeholder_img_src' ) ) {
                    $thumb_url = wc_placeholder_img_src();
                }
                $currency_symbol_raw = function_exists( 'get_woocommerce_currency_symbol' ) ? get_woocommerce_currency_symbol( $currency ) : $currency;
                // WooCommerce may return HTML entities (&nbsp; etc.). Decode & strip whitespace entities.
                $currency_symbol = html_entity_decode( wp_strip_all_tags( $currency_symbol_raw ), ENT_QUOTES, 'UTF-8' );
                $currency_symbol = str_replace( array( '\u{00A0}', '\xA0', "\u00A0", "\xC2\xA0", "\xA0", "\u\00A0", "\u00a0", "\u{a0}", '\u{A0}', '&nbsp;' ), ' ', $currency_symbol );
                $currency_symbol = trim( $currency_symbol );
                $has_discount    = ( $discount_pct !== null && $discount_pct > 0 );
                $discount_amount = null;
                if ( $has_discount && $regular_num && $sale_num ) {
                    $discount_amount = (float) ( $regular_num - $sale_num );
                }
                $out[]     = array(
                    'id'              => $id,
                    'title'           => get_the_title( $id ),
                    'slug'            => $post->post_name,
                    'link'            => get_permalink( $id ),
                    'thumbUrl'        => $thumb_url ? $thumb_url : '',
                    'price'           => $price_num,
                    'regularPrice'    => $regular_num,
                    'salePrice'       => $sale_num,
                    'discountPercent' => $discount_pct,
                    'hasDiscount'     => $has_discount,
                    'discountAmount'  => $discount_amount,
                    'currency'        => $currency,
                    'currencySymbol'  => $currency_symbol,
                );
            }
        }
        return $out;
    }

    private function augment_categories( $ids ) {
        $out = array();
        foreach ( (array) $ids as $id ) {
            $id = absint( $id );
            $term = get_term( $id, 'product_cat' );
            if ( $term && ! is_wp_error( $term ) ) {
                $out[] = array(
                    'id'   => $id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'link' => get_term_link( $term ),
                );
            }
        }
        return $out;
    }

    private function augment_map( $map ) {
        $out = array();
        foreach ( (array) $map as $cat_id => $product_ids ) {
            $cat_id = absint( $cat_id );
            $term = get_term( $cat_id, 'product_cat' );
            if ( ! $term || is_wp_error( $term ) ) { continue; }
            $out[] = array(
                'category' => array(
                    'id'   => $cat_id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    'link' => get_term_link( $term ),
                ),
                'products' => $this->augment_products( $product_ids ),
            );
        }
        return $out;
    }

    public function search_products( WP_REST_Request $request ) {
        $q = sanitize_text_field( $request->get_param( 'q' ) );
        $page = max( 1, absint( $request->get_param( 'page' ) ) );
        $exclude = (array) $request->get_param( 'exclude' );
        $exclude = array_filter( array_map( 'absint', $exclude ) );
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => 20,
            'paged'          => $page,
            's'              => $q,
            'post__not_in'   => $exclude,
        );
        $query = new WP_Query( $args );
        $items = array();
        foreach ( $query->posts as $post ) {
            $items[] = array(
                'id'    => $post->ID,
                'title' => get_the_title( $post->ID ),
            );
        }
        return new WP_REST_Response( array(
            'items'      => $items,
            'page'       => $page,
            'totalPages' => $query->max_num_pages,
        ), 200 );
    }

    public function search_categories( WP_REST_Request $request ) {
        $q = sanitize_text_field( $request->get_param( 'q' ) );
        $page = max( 1, absint( $request->get_param( 'page' ) ) );
        $per_page = 25;
        $offset = ( $page - 1 ) * $per_page;
        $args = array(
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'name__like' => $q,
            'number'     => $per_page,
            'offset'     => $offset,
        );
        $terms = get_terms( $args );
        if ( is_wp_error( $terms ) ) {
            return new WP_Error( 'ngwcs_terms_error', $terms->get_error_message(), array( 'status' => 500 ) );
        }
        $items = array();
        foreach ( $terms as $term ) {
            $items[] = array(
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            );
        }
        // Total pages estimation (WP does not give direct pagination for terms with offset well). Simplify by additional count query.
        $count_args = $args; unset( $count_args['number'], $count_args['offset'] );
        $all_terms = get_terms( $count_args );
        $total = is_wp_error( $all_terms ) ? count( $terms ) : count( $all_terms );
        $total_pages = (int) ceil( $total / $per_page );
        return new WP_REST_Response( array(
            'items'      => $items,
            'page'       => $page,
            'totalPages' => $total_pages,
        ), 200 );
    }

    public function list_products( WP_REST_Request $request ) {
        $page     = max( 1, absint( $request->get_param( 'page' ) ) );
        $per_page = min( 50, max( 1, absint( $request->get_param( 'per_page' ) ) ) );
        if ( ! $per_page ) { $per_page = 20; }
        $search   = sanitize_text_field( $request->get_param( 'search' ) );
        $sort     = sanitize_text_field( $request->get_param( 'sort' ) );
        $ver      = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        $cache_key_base = 'ngwcs_products_' . md5( serialize( array( $page, $per_page, $search, $sort, $ver ) ) );
        $cached = wp_using_ext_object_cache() ? wp_cache_get( $cache_key_base, 'ngwcs' ) : get_transient( $cache_key_base );
        if ( $cached ) { return new WP_REST_Response( $cached, 200 ); }
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'paged'          => $page,
        );
        if ( $search ) { $args['s'] = $search; }
        if ( $sort ) {
            switch ( $sort ) {
                case 'newest':
                    $args['orderby'] = 'date';
                    $args['order']   = 'DESC';
                    break;
                case 'price_asc':
                    $args['meta_key'] = '_price';
                    $args['orderby']  = 'meta_value_num';
                    $args['order']    = 'ASC';
                    break;
                case 'price_desc':
                    $args['meta_key'] = '_price';
                    $args['orderby']  = 'meta_value_num';
                    $args['order']    = 'DESC';
                    break;
                case 'newest_price_asc':
                case 'newest_price_desc':
                    // Primary date ordering; we'll post-process secondary price ordering.
                    $args['orderby'] = 'date';
                    $args['order']   = 'DESC';
                    break;
            }
        }
        $query = new WP_Query( $args );
        $items = array();
        foreach ( $query->posts as $post ) {
            $thumb = get_the_post_thumbnail_url( $post->ID, 'thumbnail' );
            $price_raw = get_post_meta( $post->ID, '_price', true );
            $price = is_numeric( $price_raw ) ? (float) $price_raw : null;
            $stock_status = get_post_meta( $post->ID, '_stock_status', true );
            $stock_qty_raw = get_post_meta( $post->ID, '_stock', true );
            $stock_qty = is_numeric( $stock_qty_raw ) ? (int) $stock_qty_raw : null;
            $items[] = array(
                'id'       => $post->ID,
                'title'    => get_the_title( $post->ID ),
                'thumbUrl' => $thumb ? $thumb : '',
                'link'     => get_permalink( $post->ID ),
                'price'    => $price,
                'date'     => $post->post_date,
                'stockStatus' => $stock_status ? $stock_status : '',
                'stock'    => $stock_qty,
            );
        }
        if ( in_array( $sort, array( 'newest_price_asc', 'newest_price_desc' ), true ) ) {
            usort( $items, function( $a, $b ) use ( $sort ) {
                $date_cmp = strtotime( $b['date'] ) - strtotime( $a['date'] ); // newest first
                if ( $date_cmp !== 0 ) { return $date_cmp; }
                $pa = is_null( $a['price'] ) ? PHP_FLOAT_MAX : $a['price'];
                $pb = is_null( $b['price'] ) ? PHP_FLOAT_MAX : $b['price'];
                if ( $sort === 'newest_price_asc' ) {
                    return $pa <=> $pb;
                } else {
                    return $pb <=> $pa;
                }
            } );
        }
        $response = array(
            'items'      => $items,
            'page'       => $page,
            'perPage'    => $per_page,
            'totalPages' => $query->max_num_pages,
            'total'      => intval( $query->found_posts ),
            'sort'       => $sort ? $sort : 'default',
        );
        if ( wp_using_ext_object_cache() ) {
            wp_cache_set( $cache_key_base, $response, 'ngwcs', 5 * MINUTE_IN_SECONDS );
        } else {
            set_transient( $cache_key_base, $response, 5 * MINUTE_IN_SECONDS );
        }
        return new WP_REST_Response( $response, 200 );
    }

    public function list_category_products( WP_REST_Request $request ) {
        $cat_id   = absint( $request->get_param( 'id' ) );
        if ( ! $cat_id ) {
            return new WP_Error( 'ngwcs_invalid_category', __( 'Invalid category ID.', 'ngw-commerce-settings' ), array( 'status' => 400 ) );
        }
        $page     = max( 1, absint( $request->get_param( 'page' ) ) );
        $per_page = min( 50, max( 1, absint( $request->get_param( 'per_page' ) ) ) );
        if ( ! $per_page ) { $per_page = 20; }
        $search   = sanitize_text_field( $request->get_param( 'search' ) );
        $sort     = sanitize_text_field( $request->get_param( 'sort' ) );
        $ver      = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        $cache_key_base = 'ngwcs_cat_products_' . md5( serialize( array( $cat_id, $page, $per_page, $search, $sort, $ver ) ) );
        $cached = wp_using_ext_object_cache() ? wp_cache_get( $cache_key_base, 'ngwcs' ) : get_transient( $cache_key_base );
        if ( $cached ) { return new WP_REST_Response( $cached, 200 ); }
        $tax_query = array(
            array(
                'taxonomy' => 'product_cat',
                'field'    => 'term_id',
                'terms'    => array( $cat_id ),
            ),
        );
        $args = array(
            'post_type'      => 'product',
            'post_status'    => 'publish',
            'posts_per_page' => $per_page,
            'paged'          => $page,
            'tax_query'      => $tax_query,
        );
        if ( $search ) { $args['s'] = $search; }
        if ( $sort ) {
            switch ( $sort ) {
                case 'newest':
                    $args['orderby'] = 'date';
                    $args['order']   = 'DESC';
                    break;
                case 'price_asc':
                    $args['meta_key'] = '_price';
                    $args['orderby']  = 'meta_value_num';
                    $args['order']    = 'ASC';
                    break;
                case 'price_desc':
                    $args['meta_key'] = '_price';
                    $args['orderby']  = 'meta_value_num';
                    $args['order']    = 'DESC';
                    break;
                case 'newest_price_asc':
                case 'newest_price_desc':
                    $args['orderby'] = 'date';
                    $args['order']   = 'DESC';
                    break;
            }
        }
        $query = new WP_Query( $args );
        $items = array();
        foreach ( $query->posts as $post ) {
            $thumb = get_the_post_thumbnail_url( $post->ID, 'thumbnail' );
            $price_raw = get_post_meta( $post->ID, '_price', true );
            $price = is_numeric( $price_raw ) ? (float) $price_raw : null;
            $stock_status = get_post_meta( $post->ID, '_stock_status', true );
            $stock_qty_raw = get_post_meta( $post->ID, '_stock', true );
            $stock_qty = is_numeric( $stock_qty_raw ) ? (int) $stock_qty_raw : null;
            $items[] = array(
                'id'       => $post->ID,
                'title'    => get_the_title( $post->ID ),
                'thumbUrl' => $thumb ? $thumb : '',
                'link'     => get_permalink( $post->ID ),
                'price'    => $price,
                'date'     => $post->post_date,
                'stockStatus' => $stock_status ? $stock_status : '',
                'stock'    => $stock_qty,
            );
        }
        if ( in_array( $sort, array( 'newest_price_asc', 'newest_price_desc' ), true ) ) {
            usort( $items, function( $a, $b ) use ( $sort ) {
                $date_cmp = strtotime( $b['date'] ) - strtotime( $a['date'] );
                if ( $date_cmp !== 0 ) { return $date_cmp; }
                $pa = is_null( $a['price'] ) ? PHP_FLOAT_MAX : $a['price'];
                $pb = is_null( $b['price'] ) ? PHP_FLOAT_MAX : $b['price'];
                if ( $sort === 'newest_price_asc' ) { return $pa <=> $pb; }
                return $pb <=> $pa; // newest_price_desc
            } );
        }
        $response = array(
            'items'      => $items,
            'page'       => $page,
            'perPage'    => $per_page,
            'totalPages' => $query->max_num_pages,
            'total'      => intval( $query->found_posts ),
            'category'   => $cat_id,
            'sort'       => $sort ? $sort : 'default',
        );
        if ( wp_using_ext_object_cache() ) {
            wp_cache_set( $cache_key_base, $response, 'ngwcs', 5 * MINUTE_IN_SECONDS );
        } else {
            set_transient( $cache_key_base, $response, 5 * MINUTE_IN_SECONDS );
        }
        return new WP_REST_Response( $response, 200 );
    }

    public function flush_cache( WP_REST_Request $request ) {
        // Enforce nonce explicitly (even though permission check runs) for defense-in-depth.
        $nonce = $request->get_header( 'x-wp-nonce' );
        if ( ! $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
            return new WP_Error( 'ngwcs_nonce_fail', __( 'Invalid or missing nonce.', 'ngw-commerce-settings' ), array( 'status' => 403 ) );
        }
        $user_id = get_current_user_id();
        if ( ! $user_id ) {
            return new WP_Error( 'ngwcs_auth_required', __( 'Authentication required.', 'ngw-commerce-settings' ), array( 'status' => 401 ) );
        }
        // Simple rate limiting: one flush per 60 seconds per user.
        $limit_seconds = 60;
        $last_flush_map = get_option( 'ngwcs_last_flush', array() );
        $now = time();
        $last_for_user = isset( $last_flush_map[ $user_id ] ) ? intval( $last_flush_map[ $user_id ] ) : 0;
        if ( $last_for_user && ( $now - $last_for_user ) < $limit_seconds ) {
            $retry_in = $limit_seconds - ( $now - $last_for_user );
            return new WP_Error( 'ngwcs_rate_limited', sprintf( __( 'Cache flush rate limit: try again in %d seconds.', 'ngw-commerce-settings' ), $retry_in ), array( 'status' => 429, 'retry_after' => $retry_in ) );
        }
        $new_ver = ngwcs_purge_cache();
        // Update last flush timestamp map.
        $last_flush_map[ $user_id ] = $now;
        update_option( 'ngwcs_last_flush', $last_flush_map );
        // Append to flush log (retain last 50 entries).
        $log = get_option( 'ngwcs_flush_log', array() );
        $ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
        $log[] = array(
            'time'    => current_time( 'mysql' ),
            'user'    => $user_id,
            'version' => $new_ver,
            'ip'      => $ip,
        );
        if ( count( $log ) > 50 ) {
            $log = array_slice( $log, -50 );
        }
        update_option( 'ngwcs_flush_log', $log );
        return new WP_REST_Response( array(
            'success'       => true,
            'cache_version' => $new_ver,
            'rate_limit'    => $limit_seconds,
            'flushed_by'    => $user_id,
            'log_count'     => count( $log ),
            'next_allowed'  => $now + $limit_seconds,
        ), 200 );
    }

    public function flush_log( WP_REST_Request $request ) {
        $limit = absint( $request->get_param( 'limit' ) );
        if ( ! $limit ) { $limit = 50; }
        $log = get_option( 'ngwcs_flush_log', array() );
        if ( empty( $log ) ) { return new WP_REST_Response( array( 'items' => array(), 'count' => 0 ), 200 ); }
        $slice = array_slice( array_reverse( $log ), 0, $limit ); // newest first
        return new WP_REST_Response( array(
            'items' => $slice,
            'count' => count( $log ),
            'returned' => count( $slice ),
            'limit' => $limit,
        ), 200 );
    }
}
