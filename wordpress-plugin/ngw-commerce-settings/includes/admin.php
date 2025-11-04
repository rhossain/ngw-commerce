<?php
class NGWCS_Admin {

    public function __construct() {
        add_action( 'admin_menu', array( $this, 'register_menu' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
    }

    public function register_menu() {
        add_menu_page(
            __( 'Commerce Settings', 'ngw-commerce-settings' ),
            __( 'Commerce Settings', 'ngw-commerce-settings' ),
            'manage_options',
            'ngwcs-settings',
            array( $this, 'render_page' ),
            'dashicons-admin-generic',
            56
        );
    }

    public function enqueue_assets( $hook ) {
        if ( $hook !== 'toplevel_page_ngwcs-settings' ) {
            return;
        }
        wp_enqueue_style( 'ngwcs-admin', NGWCS_PLUGIN_URL . 'assets/admin.css', array(), NGWCS_VERSION );
        wp_enqueue_script( 'ngwcs-admin', NGWCS_PLUGIN_URL . 'assets/admin.js', array( 'jquery', 'wp-api' ), NGWCS_VERSION, true );
        wp_localize_script( 'ngwcs-admin', 'NGWCS_DATA', array(
            'restNamespace' => 'ngw/v1',
            'nonce'         => wp_create_nonce( 'wp_rest' ),
            'settings'      => ngwcs_get_settings(),
            'optionKey'     => NGWCS_OPTION_KEY,
        ) );
    }

    public function register_settings() {
        register_setting( 'ngwcs_settings_group', NGWCS_OPTION_KEY );

        add_settings_section(
            'ngwcs_section_hero',
            __( 'Hero Slider Products', 'ngw-commerce-settings' ),
            function() {
                echo '<p>' . esc_html__( 'Select products to feature in the hero slider.', 'ngw-commerce-settings' ) . '</p>';
            },
            'ngwcs-settings'
        );

        add_settings_field(
            'hero_slider_products',
            __( 'Products', 'ngw-commerce-settings' ),
            array( $this, 'field_hero_slider_products' ),
            'ngwcs-settings',
            'ngwcs_section_hero'
        );

        add_settings_section(
            'ngwcs_section_featured_categories',
            __( 'Featured Categories', 'ngw-commerce-settings' ),
            function() {
                echo '<p>' . esc_html__( 'Choose categories to show as featured.', 'ngw-commerce-settings' ) . '</p>';
            },
            'ngwcs-settings'
        );

        add_settings_field(
            'featured_categories',
            __( 'Categories', 'ngw-commerce-settings' ),
            array( $this, 'field_featured_categories' ),
            'ngwcs-settings',
            'ngwcs_section_featured_categories'
        );

        add_settings_section(
            'ngwcs_section_highlighted_products',
            __( 'Highlighted Products by Category', 'ngw-commerce-settings' ),
            function() {
                echo '<p>' . esc_html__( 'Map categories to highlighted products.', 'ngw-commerce-settings' ) . '</p>';
            },
            'ngwcs-settings'
        );

        add_settings_field(
            'highlighted_category_map',
            __( 'Category/Product Map', 'ngw-commerce-settings' ),
            array( $this, 'field_highlighted_category_map' ),
            'ngwcs-settings',
            'ngwcs_section_highlighted_products'
        );
    }

    public function render_page() {
        $settings = ngwcs_get_settings();
        $cache_version = intval( get_option( NGWCS_CACHE_VERSION_OPTION, 1 ) );
        echo '<div class="wrap ngwcs-wrapper">';
        echo '<h1>' . esc_html__( 'NGW Commerce Settings', 'ngw-commerce-settings' ) . '</h1>';
        echo '<div class="ngwcs-meta-bar" style="margin:10px 0 20px;display:flex;align-items:center;gap:12px;">';
        echo '<span class="ngwcs-cache-version" data-cache-version="' . esc_attr( $cache_version ) . '">' . esc_html__( 'Cache Version:', 'ngw-commerce-settings' ) . ' <strong>' . intval( $cache_version ) . '</strong></span>';
        echo '<button type="button" class="button button-secondary ngwcs-flush-cache" data-rest="' . esc_attr( 'ngw/v1' ) . '" aria-label="' . esc_attr__( 'Flush cached data and increment version', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Flush Cache', 'ngw-commerce-settings' ) . '</button>';
        echo '<span class="ngwcs-flush-status" aria-live="polite"></span>';
        echo '</div>';
        echo '<form method="post" action="options.php" class="ngwcs-form">';
        settings_fields( 'ngwcs_settings_group' );
        // Build tabs
        echo '<div class="ngwcs-tabs">';
        echo '<nav class="ngwcs-tab-nav" role="tablist">';
        echo '<button type="button" class="ngwcs-tab is-active" data-tab="hero" role="tab" aria-selected="true">' . esc_html__( 'Hero Products', 'ngw-commerce-settings' ) . '</button>';
        echo '<button type="button" class="ngwcs-tab" data-tab="featured" role="tab" aria-selected="false">' . esc_html__( 'Featured Categories', 'ngw-commerce-settings' ) . '</button>';
        echo '<button type="button" class="ngwcs-tab" data-tab="highlighted" role="tab" aria-selected="false">' . esc_html__( 'Highlighted Products', 'ngw-commerce-settings' ) . '</button>';
        echo '</nav>';
        echo '<div class="ngwcs-tab-panels">';

        // Hero products panel
        echo '<section class="ngwcs-tab-panel is-active" data-panel="hero" role="tabpanel">';
        echo '<h2>' . esc_html__( 'Hero Slider Products', 'ngw-commerce-settings' ) . '</h2>';
        echo '<p class="description">' . esc_html__( 'Select products to appear in the hero slider (order preserved as checked order).', 'ngw-commerce-settings' ) . '</p>';
        $this->render_hero_products_list( $settings );
        echo '</section>';

        // Featured categories panel
        echo '<section class="ngwcs-tab-panel" data-panel="featured" role="tabpanel" hidden>';
        echo '<h2>' . esc_html__( 'Featured Categories', 'ngw-commerce-settings' ) . '</h2>';
        echo '<p class="description">' . esc_html__( 'Select categories to feature on the homepage.', 'ngw-commerce-settings' ) . '</p>';
        $this->render_featured_categories_list( $settings );
        echo '</section>';

        // Highlighted products panel
        echo '<section class="ngwcs-tab-panel" data-panel="highlighted" role="tabpanel" hidden>';
        echo '<h2>' . esc_html__( 'Highlighted Products by Category', 'ngw-commerce-settings' ) . '</h2>';
        echo '<p class="description">' . esc_html__( 'Expand a category and choose products to highlight within it.', 'ngw-commerce-settings' ) . '</p>';
        $this->render_highlighted_products_lists( $settings );
        echo '</section>';

        echo '</div>'; // panels
        echo '</div>'; // tabs
        submit_button();
        echo '</form>';
        echo '</div>';
    }

    private function get_products() {
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => 100,
            'post_status'    => 'publish',
            'fields'         => 'ids'
        );
        return get_posts( $args );
    }

    private function get_categories() {
        $terms = get_terms( array(
            'taxonomy'   => 'product_cat',
            'hide_empty' => false,
            'fields'     => 'id=>name'
        ) );
        if ( is_wp_error( $terms ) ) {
            return array();
        }
        return $terms; // associative array id => name
    }

    // Deprecated field method (kept for compatibility if settings API calls it); now delegates
    public function field_hero_slider_products() { $this->render_hero_products_list( ngwcs_get_settings() ); }

    public function field_featured_categories() { $this->render_featured_categories_list( ngwcs_get_settings() ); }

    public function field_highlighted_category_map() { $this->render_highlighted_products_lists( ngwcs_get_settings() ); }

    private function render_hero_products_list( $settings ) {
        $selected = isset( $settings['hero_slider_products'] ) ? $settings['hero_slider_products'] : array();
        $order    = isset( $settings['hero_slider_order'] ) ? $settings['hero_slider_order'] : $selected;
        // Only render already selected hero products initially (performance). Defer broader pool to on-demand loads.
        $selected_details = array();
        foreach ( $order as $pid ) {
            $thumb = get_the_post_thumbnail( $pid, array(40,40), array( 'style' => 'width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;' ) );
            if ( ! $thumb ) {
                $thumb = '<span class="ngwcs-thumb ngwcs-thumb--placeholder" style="width:40px;height:40px;display:inline-block;background:#eee;border-radius:4px;margin-right:8px;"></span>';
            }
            $selected_details[] = array(
                'id'    => $pid,
                'title' => get_the_title( $pid ),
                'thumb' => $thumb,
            );
        }
        echo '<div class="ngwcs-hero-list-wrapper" data-total="0" data-loaded="' . count( $selected_details ) . '" data-page="0" data-sort="" data-search="">';
        echo '<div class="ngwcs-hero-controls" style="display:flex;flex-wrap:wrap;gap:10px;margin:0 0 12px;align-items:flex-end;">';
        echo '<div style="display:flex;flex-direction:column;gap:4px;">';
        echo '<label style="display:flex;align-items:center;gap:4px;font-weight:600;">' . esc_html__( 'Per Page', 'ngw-commerce-settings' ) . ': <select class="ngwcs-hero-per-page"><option value="10">10</option><option value="12" selected>12</option><option value="20">20</option></select></label>';
        echo '</div>';
        echo '<div style="display:flex;flex-direction:column;gap:4px;min-width:230px;">';
        echo '<label style="font-weight:600;">' . esc_html__( 'Server Search', 'ngw-commerce-settings' ) . '</label>';
        echo '<div class="ngwcs-filter-bar" style="margin:0;">';
        echo '<input type="text" class="ngwcs-category-search ngwcs-hero-search" placeholder="' . esc_attr__( 'Search products…', 'ngw-commerce-settings' ) . '" aria-label="' . esc_attr__( 'Hero server search', 'ngw-commerce-settings' ) . '">';
        echo '<button type="button" class="button ngwcs-reset-search ngwcs-hero-reset-search" aria-label="' . esc_attr__( 'Reset hero search', 'ngw-commerce-settings' ) . '">×</button>';
        echo '</div>';
        echo '</div>';
        echo '<div style="display:flex;flex-direction:column;gap:4px;">';
        echo '<label style="font-weight:600;">' . esc_html__( 'Sort', 'ngw-commerce-settings' ) . '</label>';
        echo '<select class="ngwcs-sort ngwcs-hero-sort" aria-label="' . esc_attr__( 'Hero products sort order', 'ngw-commerce-settings' ) . '">';
        echo '<option value="">' . esc_html__( 'Default', 'ngw-commerce-settings' ) . '</option>';
        echo '<option value="newest">' . esc_html__( 'Newest', 'ngw-commerce-settings' ) . '</option>';
        echo '<option value="price_asc">' . esc_html__( 'Price ↑', 'ngw-commerce-settings' ) . '</option>';
        echo '<option value="price_desc">' . esc_html__( 'Price ↓', 'ngw-commerce-settings' ) . '</option>';
        echo '<option value="newest_price_asc">' . esc_html__( 'Newest + Price ↑', 'ngw-commerce-settings' ) . '</option>';
        echo '<option value="newest_price_desc">' . esc_html__( 'Newest + Price ↓', 'ngw-commerce-settings' ) . '</option>';
        echo '</select>';
        echo '</div>';
        echo '<div style="display:flex;flex-direction:column;gap:4px;">';
        echo '<label style="font-weight:600;visibility:hidden;">' . esc_html__( 'Actions', 'ngw-commerce-settings' ) . '</label>';
        echo '<div style="display:flex;gap:8px;flex-wrap:wrap;">';
        echo '<button type="button" class="button ngwcs-load-hero-products ngwcs-load-initial" data-context="hero" aria-label="' . esc_attr__( 'Load first page of products for hero slider', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Load First Page', 'ngw-commerce-settings' ) . '</button>';
        echo '<button type="button" class="button ngwcs-clear-hero-products" aria-label="' . esc_attr__( 'Clear loaded non-selected hero products', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Clear Loaded', 'ngw-commerce-settings' ) . '</button>';
        echo '</div>';
        echo '</div>';
        echo '<span class="ngwcs-hero-status" aria-live="polite" style="min-width:160px;font-size:12px;color:#555;"></span>';
        echo '</div>'; // controls
        echo '<div class="ngwcs-order-hidden" aria-hidden="true" style="display:none;">';
        foreach ( $order as $pid ) {
            echo '<input type="hidden" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[hero_slider_order][]" value="' . intval( $pid ) . '">';
        }
        echo '</div>';
        echo '<ul class="ngwcs-list ngwcs-products" data-draggable="hero">';
        foreach ( $selected_details as $p ) {
            $checked = in_array( $p['id'], $selected );
            echo '<li class="ngwcs-row" draggable="true" data-id="' . intval( $p['id'] ) . '">';
            echo '<label>' . $p['thumb'] . '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[hero_slider_products][]" value="' . intval( $p['id'] ) . '" ' . checked( $checked, true, false ) . '> ' . esc_html( $p['title'] ) . ' <span class="ngwcs-id">#' . intval( $p['id'] ) . '</span></label>';
            echo '</li>';
        }
        echo '</ul>';
        echo '</div>';
    }

    private function render_featured_categories_list( $settings ) {
        $selected = isset( $settings['featured_categories'] ) ? $settings['featured_categories'] : array();
        $categories = $this->get_categories_full();
        echo '<ul class="ngwcs-list ngwcs-categories">';
        foreach ( $categories as $c ) {
            $checked = in_array( $c['id'], $selected );
            echo '<li class="ngwcs-row">';
            echo '<label><input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[featured_categories][]" value="' . intval( $c['id'] ) . '" ' . checked( $checked, true, false ) . '> ' . esc_html( $c['name'] ) . ' <span class="ngwcs-id">#' . intval( $c['id'] ) . '</span></label>';
            echo '</li>';
        }
        echo '</ul>';
    }

    private function render_highlighted_products_lists( $settings ) {
        $map = isset( $settings['highlighted_category_map'] ) ? $settings['highlighted_category_map'] : array();
        $categories = $this->get_categories_full();
    echo '<div class="ngwcs-highlighted-groups">';
        foreach ( $categories as $c ) {
            $cid = $c['id'];
            $selected_products = isset( $map[$cid] ) ? $map[$cid] : array();
            echo '<div class="ngwcs-category-group">';
            echo '<details class="ngwcs-details"><summary>' . esc_html( $c['name'] ) . ' <span class="ngwcs-id">#' . intval( $cid ) . '</span></summary>';
            echo '<div class="ngwcs-category-products-wrapper" data-category-id="' . intval( $cid ) . '" data-loaded="' . count( $selected_products ) . '" data-selected-count="' . count( $selected_products ) . '" data-page="0">';
            echo '<ul class="ngwcs-list ngwcs-products" data-category-list="' . intval( $cid ) . '">';
            // Render only selected products initially.
            foreach ( $selected_products as $pid ) {
                $thumb = get_the_post_thumbnail( $pid, array(40,40), array( 'style' => 'width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;' ) );
                if ( ! $thumb ) {
                    $thumb = '<span class="ngwcs-thumb ngwcs-thumb--placeholder" style="width:40px;height:40px;display:inline-block;background:#eee;border-radius:4px;margin-right:8px;"></span>';
                }
                echo '<li class="ngwcs-row" data-id="' . intval( $pid ) . '">';
                echo '<label>' . $thumb . '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[highlighted_category_map][' . intval( $cid ) . '][]" value="' . intval( $pid ) . '" checked> ' . esc_html( get_the_title( $pid ) ) . ' <span class="ngwcs-id">#' . intval( $pid ) . '</span></label>';
                echo '</li>';
            }
            echo '</ul>';
            echo '<div class="ngwcs-category-bulk" style="margin:6px 0 8px; display:flex; gap:6px; flex-wrap:wrap;">';
            echo '<button type="button" class="button ngwcs-select-all-cat" data-category="' . intval( $cid ) . '">' . esc_html__( 'Select All Loaded', 'ngw-commerce-settings' ) . '</button>';
            echo '<button type="button" class="button ngwcs-unselect-all-cat" data-category="' . intval( $cid ) . '">' . esc_html__( 'Unselect All', 'ngw-commerce-settings' ) . '</button>';
            echo '</div>';
            // Per-page size selector + status line
            echo '<div class="ngwcs-category-controls" style="display:flex;align-items:center;gap:14px;margin:4px 0 8px;flex-wrap:wrap;">';
            echo '<label style="display:flex;align-items:center;gap:6px;font-size:12px;">' . esc_html__( 'Per Page', 'ngw-commerce-settings' ) . ' <select class="ngwcs-per-page" aria-label="' . esc_attr__( 'Products per page', 'ngw-commerce-settings' ) . '">' .
                '<option value="4" selected>4</option>' .
                '<option value="8">8</option>' .
                '<option value="12">12</option>' .
            '</select></label>';
            echo '<label style="display:flex;align-items:center;gap:6px;font-size:12px;">' . esc_html__( 'Sort', 'ngw-commerce-settings' ) . ' <select class="ngwcs-sort" aria-label="' . esc_attr__( 'Sort products', 'ngw-commerce-settings' ) . '">' .
                '<option value="">' . esc_html__( 'Default', 'ngw-commerce-settings' ) . '</option>' .
                '<option value="newest">' . esc_html__( 'Newest', 'ngw-commerce-settings' ) . '</option>' .
                '<option value="price_asc">' . esc_html__( 'Price ↑', 'ngw-commerce-settings' ) . '</option>' .
                '<option value="price_desc">' . esc_html__( 'Price ↓', 'ngw-commerce-settings' ) . '</option>' .
                '<option value="newest_price_asc">' . esc_html__( 'Newest + Price ↑', 'ngw-commerce-settings' ) . '</option>' .
                '<option value="newest_price_desc">' . esc_html__( 'Newest + Price ↓', 'ngw-commerce-settings' ) . '</option>' .
            '</select></label>';
            echo '<div class="ngwcs-cat-status" style="font-size:12px;color:#555;" aria-live="polite"></div>';
            echo '</div>';
            echo '<div class="ngwcs-filter-bar"><input type="text" class="ngwcs-category-filter" placeholder="' . esc_attr__( 'Filter loaded products (client-side)', 'ngw-commerce-settings' ) . '" aria-label="' . esc_attr__( 'Filter already loaded products for category', 'ngw-commerce-settings' ) . '">';
            echo '<span style="display:flex;align-items:center;gap:4px;">';
            echo '<input type="text" class="ngwcs-category-search" placeholder="' . esc_attr__( 'Server search', 'ngw-commerce-settings' ) . '" aria-label="' . esc_attr__( 'Enter search term for server-side product query', 'ngw-commerce-settings' ) . '" style="max-width:170px;">';
            echo '<button type="button" class="button ngwcs-reset-search" aria-label="' . esc_attr__( 'Reset server search', 'ngw-commerce-settings' ) . '" title="' . esc_attr__( 'Reset search', 'ngw-commerce-settings' ) . '" style="padding:4px 8px;line-height:1;">&times;</button>';
            echo '</span>';
            echo '</div>';
            echo '<div class="ngwcs-category-actions" style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;">';
            echo '<button type="button" class="button ngwcs-load-category-products ngwcs-load-initial" data-category="' . intval( $cid ) . '" data-initial="true" aria-label="' . esc_attr__( 'Load first page of products for category', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Load First Page', 'ngw-commerce-settings' ) . '</button>';
            echo '<button type="button" class="button ngwcs-clear-category-products" data-category="' . intval( $cid ) . '" aria-label="' . esc_attr__( 'Clear loaded non-selected products', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Clear Loaded', 'ngw-commerce-settings' ) . '</button>';
            echo '<button type="button" class="button ngwcs-select-newly-loaded" data-category="' . intval( $cid ) . '" aria-label="' . esc_attr__( 'Select most recently loaded products', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Select Newly Loaded', 'ngw-commerce-settings' ) . '</button>';
            echo '<button type="button" class="button ngwcs-unselect-newly-loaded" data-category="' . intval( $cid ) . '" aria-label="' . esc_attr__( 'Unselect most recently loaded products', 'ngw-commerce-settings' ) . '">' . esc_html__( 'Unselect Newly Loaded', 'ngw-commerce-settings' ) . '</button>';
            echo '</div>';
            echo '</div>';
            echo '</details>';
            echo '</div>';
        }
        echo '</div>';
    }

    private function get_products_with_thumbs() {
        $ids = $this->get_products();
        $out = array();
        foreach ( $ids as $id ) {
            $thumb = get_the_post_thumbnail( $id, array(40,40), array( 'style' => 'width:40px;height:40px;object-fit:cover;border-radius:4px;margin-right:8px;' ) );
            if ( ! $thumb ) {
                $thumb = '<span class="ngwcs-thumb ngwcs-thumb--placeholder" style="width:40px;height:40px;display:inline-block;background:#eee;border-radius:4px;margin-right:8px;"></span>';
            }
            $out[] = array(
                'id'    => $id,
                'title' => get_the_title( $id ),
                'thumb' => $thumb,
            );
        }
        return $out;
    }

    private function get_categories_full() {
        $raw = $this->get_categories();
        $out = array();
        foreach ( $raw as $id => $name ) {
            $out[] = array( 'id' => $id, 'name' => $name );
        }
        return $out;
    }
}
