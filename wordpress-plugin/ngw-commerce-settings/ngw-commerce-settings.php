<?php
/**
 * Plugin Name: NGW Commerce Settings
 * Plugin URI:  https://example.com/ngw-commerce
 * Description: Provides admin configuration for homepage hero slider products, featured categories, and highlighted products per category for the NGW Commerce Angular app.
 * Version:     0.1.0
 * Author:      NGW Team
 * Author URI:  https://example.com
 * License:     GPLv2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ngw-commerce-settings
 * Domain Path: /languages
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly.
}

// Define constants.
define( 'NGWCS_VERSION', '0.1.0' );
define( 'NGWCS_PLUGIN_FILE', __FILE__ );
define( 'NGWCS_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'NGWCS_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'NGWCS_OPTION_KEY', 'ngw_commerce_settings' );
define( 'NGWCS_CACHE_VERSION_OPTION', 'ngwcs_cache_version' );

// Simple autoloader for plugin classes.
spl_autoload_register( function ( $class ) {
    if ( strpos( $class, 'NGWCS_' ) !== 0 ) {
        return;
    }
    $path = NGWCS_PLUGIN_DIR . 'includes/' . strtolower( str_replace( 'NGWCS_', '', $class ) ) . '.php';
    if ( file_exists( $path ) ) {
        include $path;
    }
} );

/**
 * Activation hook - ensure option exists.
 */
function ngwcs_activate() {
    if ( false === get_option( NGWCS_OPTION_KEY ) ) {
        add_option( NGWCS_OPTION_KEY, array(
            'hero_slider_products'       => array(), // array of product IDs
            'hero_slider_order'          => array(),
            'featured_categories'        => array(), // array of category term IDs
            'highlighted_category_map'   => array(), // category_id => array(product IDs)
            'component_settings'         => array(
                'category_products_sections' => array(
                    array(
                        'categoryId'           => 22,  // Smartphones
                        'displayStyle'         => 'carousel',
                        'limit'                => 8,
                        'carouselAutoplay'     => false,
                        'carouselDelay'        => 3000,
                        'carouselLoop'         => true,
                        'carouselSlidesPerView'=> 4,
                        'carouselSpaceBetween' => 20,
                        'gridColumns'          => 4,
                        'sortBy'               => 'date',
                        'sortOrder'            => 'desc',
                        'showViewAll'          => true,
                        'showOnSaleOnly'       => false,
                        'showFeaturedOnly'     => false,
                    ),
                ),
                'categories_display' => array(
                    'displayStyle'    => 'flat-list',
                    'size'            => 'md',
                    'showTitle'       => true,
                    'showViewAll'     => true,
                    'showCount'       => false,
                    'enableHover'     => true,
                    'cardStyle'       => 'elevated',
                    'gridColumns'     => array( 'mobile' => 3, 'tablet' => 4, 'desktop' => 7 ),
                    'gridGap'         => 24,
                    'carouselSlidesPerView' => 'auto',
                    'carouselSpaceBetween'  => 20,
                    'carouselLoop'          => false,
                    'carouselAutoplay'      => false,
                    'carouselNavigation'    => true,
                    'carouselPagination'    => true,
                ),
            ),
            'updated_at'                 => current_time( 'mysql' ),
            'version'                    => NGWCS_VERSION,
        ), '', false );
    }
    if ( false === get_option( NGWCS_CACHE_VERSION_OPTION ) ) {
        add_option( NGWCS_CACHE_VERSION_OPTION, 1 );
    }
    // Add custom capability to administrator role.
    $admin = get_role( 'administrator' );
    if ( $admin && ! $admin->has_cap( 'manage_ngw_commerce_settings' ) ) {
        $admin->add_cap( 'manage_ngw_commerce_settings' );
    }
}
register_activation_hook( __FILE__, 'ngwcs_activate' );

/**
 * Deactivation hook - (keep data for reactivation) could add cleanup logic if needed.
 */
function ngwcs_deactivate() {
    // Intentionally do nothing for now (data persistence).
}
register_deactivation_hook( __FILE__, 'ngwcs_deactivate' );

/**
 * Initialize plugin pieces on plugins_loaded.
 */
function ngwcs_init() {
    // Load text domain for translations.
    load_plugin_textdomain( 'ngw-commerce-settings', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );

    // Instantiate admin + REST controller.
    if ( is_admin() ) {
        new NGWCS_Admin();
    }
    new NGWCS_Rest();
}
add_action( 'plugins_loaded', 'ngwcs_init' );

/**
 * Helper capability check wrapper to centralize permission logic.
 */
function ngwcs_current_user_can_manage() {
    // Fallback: if custom cap missing, allow manage_options for backwards compatibility.
    if ( current_user_can( 'manage_ngw_commerce_settings' ) ) { return true; }
    return current_user_can( 'manage_options' );
}

/**
 * Helper: Get settings (with defaults merged).
 */
function ngwcs_get_settings() {
    $defaults = array(
        'hero_slider_products'     => array(),
        'hero_slider_order'        => array(),
        'featured_categories'      => array(),
        'highlighted_category_map' => array(),
        'component_settings'       => array(
            // Default to sections array (supports multiple instances)
            'category_products_sections' => array(
                array(
                    'categoryId'           => 22,
                    'displayStyle'         => 'carousel',
                    'limit'                => 8,
                    'carouselAutoplay'     => false,
                    'carouselDelay'        => 3000,
                    'carouselLoop'         => true,
                    'carouselSlidesPerView'=> 4,
                    'carouselSpaceBetween' => 20,
                    'gridColumns'          => 4,
                    'sortBy'               => 'date',
                    'sortOrder'            => 'desc',
                    'showViewAll'          => true,
                    'showOnSaleOnly'       => false,
                    'showFeaturedOnly'     => false,
                ),
            ),
            'categories_display' => array(
                'displayStyle'    => 'flat-list',
                'size'            => 'md',
                'showTitle'       => true,
                'showViewAll'     => true,
                'showCount'       => false,
                'enableHover'     => true,
                'cardStyle'       => 'elevated',
                'gridColumns'     => array( 'mobile' => 3, 'tablet' => 4, 'desktop' => 7 ),
                'gridGap'         => 24,
                'carouselSlidesPerView' => 'auto',
                'carouselSpaceBetween'  => 20,
                'carouselLoop'          => false,
                'carouselAutoplay'      => false,
                'carouselNavigation'    => true,
                'carouselPagination'    => true,
            ),
        ),
        'updated_at'               => '',
        'version'                  => NGWCS_VERSION,
    );
    $stored = get_option( NGWCS_OPTION_KEY, array() );
    return wp_parse_args( $stored, $defaults );
}

/**
 * Helper: Update settings with sanitization.
 */
function ngwcs_update_settings( $data ) {
    $settings = ngwcs_get_settings();

    // Sanitize hero slider product IDs.
    if ( isset( $data['hero_slider_products'] ) && is_array( $data['hero_slider_products'] ) ) {
        $settings['hero_slider_products'] = array_values( array_unique( array_filter( array_map( 'absint', $data['hero_slider_products'] ) ) ) );
    }
    // Sanitize hero slider order separate from selection if provided.
    if ( isset( $data['hero_slider_order'] ) && is_array( $data['hero_slider_order'] ) ) {
        $order = array_values( array_filter( array_map( 'absint', $data['hero_slider_order'] ) ) );
        // Keep only IDs that are selected.
        $order = array_values( array_intersect( $order, $settings['hero_slider_products'] ) );
        // Append any selected IDs not in order list at the end.
        foreach ( $settings['hero_slider_products'] as $pid ) {
            if ( ! in_array( $pid, $order, true ) ) { $order[] = $pid; }
        }
        $settings['hero_slider_order'] = $order;
    } else {
        // Fallback: if no explicit order, mirror selection order.
        if ( empty( $settings['hero_slider_order'] ) ) {
            $settings['hero_slider_order'] = $settings['hero_slider_products'];
        }
    }
    // Sanitize featured categories.
    if ( isset( $data['featured_categories'] ) && is_array( $data['featured_categories'] ) ) {
        $settings['featured_categories'] = array_values( array_unique( array_filter( array_map( 'absint', $data['featured_categories'] ) ) ) );
    }
    // Sanitize highlighted category map.
    if ( isset( $data['highlighted_category_map'] ) && is_array( $data['highlighted_category_map'] ) ) {
        $clean_map = array();
        foreach ( $data['highlighted_category_map'] as $cat_id => $product_ids ) {
            $cat_id = absint( $cat_id );
            if ( ! $cat_id ) { continue; }
            if ( is_array( $product_ids ) ) {
                $clean_map[$cat_id] = array_values( array_unique( array_filter( array_map( 'absint', $product_ids ) ) ) );
            }
        }
        $settings['highlighted_category_map'] = $clean_map;
    }
    // Sanitize component settings.
    if ( isset( $data['component_settings'] ) && is_array( $data['component_settings'] ) ) {
        $clean_components = array();
        
        // Sanitize category_products_sections (array of sections)
        if ( isset( $data['component_settings']['category_products_sections'] ) && is_array( $data['component_settings']['category_products_sections'] ) ) {
            $sections = $data['component_settings']['category_products_sections'];
            $clean_sections = array();
            
            foreach ( $sections as $section ) {
                if ( ! is_array( $section ) ) continue;
                
                $clean_sections[] = array(
                    'categoryId'           => isset( $section['categoryId'] ) ? absint( $section['categoryId'] ) : 0,
                    'displayStyle'         => in_array( $section['displayStyle'] ?? '', array( 'carousel', 'grid', 'list' ) ) ? $section['displayStyle'] : 'carousel',
                    'limit'                => isset( $section['limit'] ) ? absint( $section['limit'] ) : 8,
                    'carouselAutoplay'     => isset( $section['carouselAutoplay'] ) ? (bool) $section['carouselAutoplay'] : false,
                    'carouselDelay'        => isset( $section['carouselDelay'] ) ? absint( $section['carouselDelay'] ) : 3000,
                    'carouselLoop'         => isset( $section['carouselLoop'] ) ? (bool) $section['carouselLoop'] : true,
                    'carouselSlidesPerView'=> isset( $section['carouselSlidesPerView'] ) ? absint( $section['carouselSlidesPerView'] ) : 4,
                    'carouselSpaceBetween' => isset( $section['carouselSpaceBetween'] ) ? absint( $section['carouselSpaceBetween'] ) : 20,
                    'gridColumns'          => isset( $section['gridColumns'] ) ? absint( $section['gridColumns'] ) : 4,
                    'sortBy'               => in_array( $section['sortBy'] ?? '', array( 'date', 'popularity', 'rating', 'price' ) ) ? $section['sortBy'] : 'date',
                    'sortOrder'            => in_array( $section['sortOrder'] ?? '', array( 'asc', 'desc' ) ) ? $section['sortOrder'] : 'desc',
                    'showViewAll'          => isset( $section['showViewAll'] ) ? (bool) $section['showViewAll'] : true,
                    'showOnSaleOnly'       => isset( $section['showOnSaleOnly'] ) ? (bool) $section['showOnSaleOnly'] : false,
                    'showFeaturedOnly'     => isset( $section['showFeaturedOnly'] ) ? (bool) $section['showFeaturedOnly'] : false,
                );
            }
            
            $clean_components['category_products_sections'] = $clean_sections;
        }
        
        // Sanitize categories_display settings
        if ( isset( $data['component_settings']['categories_display'] ) && is_array( $data['component_settings']['categories_display'] ) ) {
            $cd = $data['component_settings']['categories_display'];
            $grid_cols = array( 'mobile' => 3, 'tablet' => 4, 'desktop' => 7 );
            if ( isset( $cd['gridColumns'] ) && is_array( $cd['gridColumns'] ) ) {
                $grid_cols = array(
                    'mobile'  => isset( $cd['gridColumns']['mobile'] ) ? absint( $cd['gridColumns']['mobile'] ) : 3,
                    'tablet'  => isset( $cd['gridColumns']['tablet'] ) ? absint( $cd['gridColumns']['tablet'] ) : 4,
                    'desktop' => isset( $cd['gridColumns']['desktop'] ) ? absint( $cd['gridColumns']['desktop'] ) : 7,
                );
            }
            $clean_components['categories_display'] = array(
                'displayStyle'    => in_array( $cd['displayStyle'] ?? '', array( 'flat-list', 'masonry-grid', 'carousel' ) ) ? $cd['displayStyle'] : 'flat-list',
                'size'            => in_array( $cd['size'] ?? '', array( 'sm', 'md', 'lg', 'xl' ) ) ? $cd['size'] : 'md',
                'showTitle'       => isset( $cd['showTitle'] ) ? (bool) $cd['showTitle'] : true,
                'showViewAll'     => isset( $cd['showViewAll'] ) ? (bool) $cd['showViewAll'] : true,
                'showCount'       => isset( $cd['showCount'] ) ? (bool) $cd['showCount'] : false,
                'enableHover'     => isset( $cd['enableHover'] ) ? (bool) $cd['enableHover'] : true,
                'cardStyle'       => in_array( $cd['cardStyle'] ?? '', array( 'minimal', 'elevated', 'bordered' ) ) ? $cd['cardStyle'] : 'elevated',
                'gridColumns'     => $grid_cols,
                'gridGap'         => isset( $cd['gridGap'] ) ? absint( $cd['gridGap'] ) : 24,
                'carouselSlidesPerView' => isset( $cd['carouselSlidesPerView'] ) ? sanitize_text_field( $cd['carouselSlidesPerView'] ) : 'auto',
                'carouselSpaceBetween'  => isset( $cd['carouselSpaceBetween'] ) ? absint( $cd['carouselSpaceBetween'] ) : 20,
                'carouselLoop'          => isset( $cd['carouselLoop'] ) ? (bool) $cd['carouselLoop'] : false,
                'carouselAutoplay'      => isset( $cd['carouselAutoplay'] ) ? (bool) $cd['carouselAutoplay'] : false,
                'carouselNavigation'    => isset( $cd['carouselNavigation'] ) ? (bool) $cd['carouselNavigation'] : true,
                'carouselPagination'    => isset( $cd['carouselPagination'] ) ? (bool) $cd['carouselPagination'] : true,
            );
        }
        
        $settings['component_settings'] = $clean_components;
    }
    $settings['updated_at'] = current_time( 'mysql' );
    update_option( NGWCS_OPTION_KEY, $settings );
    ngwcs_bump_cache_version();
    return $settings;
}

/**
 * Increment cache version to invalidate derived keys (transients/object cache).
 */
function ngwcs_bump_cache_version() {
    $ver = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
    $ver++;
    update_option( NGWCS_CACHE_VERSION_OPTION, $ver );
    return $ver;
}

/**
 * Purge plugin caches explicitly (alias to bump version).
 */
function ngwcs_purge_cache() {
    return ngwcs_bump_cache_version();
}

// Invalidate caches when products change.
function ngwcs_invalidate_on_product_change( $post_id ) {
    $post = get_post( $post_id );
    if ( $post && $post->post_type === 'product' ) {
        ngwcs_purge_cache();
    }
}
add_action( 'save_post_product', 'ngwcs_invalidate_on_product_change', 10, 1 );
add_action( 'delete_post', function( $post_id ) { ngwcs_invalidate_on_product_change( $post_id ); }, 10, 1 );

// Invalidate caches when categories change.
function ngwcs_invalidate_on_category_change( $term_id, $tt_id = null, $taxonomy = null ) {
    if ( $taxonomy === 'product_cat' ) {
        ngwcs_purge_cache();
    }
}
add_action( 'created_product_cat', 'ngwcs_invalidate_on_category_change', 10, 3 );
add_action( 'edited_product_cat', 'ngwcs_invalidate_on_category_change', 10, 3 );
add_action( 'delete_product_cat', 'ngwcs_invalidate_on_category_change', 10, 3 );
