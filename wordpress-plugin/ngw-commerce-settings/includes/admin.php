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
        echo '<button type="button" class="ngwcs-tab" data-tab="components" role="tab" aria-selected="false">' . esc_html__( 'Component Settings', 'ngw-commerce-settings' ) . '</button>';
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

        // Component Settings panel
        echo '<section class="ngwcs-tab-panel" data-panel="components" role="tabpanel" hidden>';
        echo '<h2>' . esc_html__( 'Component Settings', 'ngw-commerce-settings' ) . '</h2>';
        echo '<p class="description">' . esc_html__( 'Configure default settings for category-products and categories-display components used in the Angular app.', 'ngw-commerce-settings' ) . '</p>';
        $this->render_component_settings( $settings );
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

    private function render_component_settings( $settings ) {
        $comp_settings = isset( $settings['component_settings'] ) ? $settings['component_settings'] : array();
        
        // Render up to 3 sections; show existing ones first
        $sections = isset( $comp_settings['category_products_sections'] ) && is_array( $comp_settings['category_products_sections'] ) ? $comp_settings['category_products_sections'] : array();
        $cd = isset( $comp_settings['categories_display'] ) ? $comp_settings['categories_display'] : array();
        $max_sections = 3;
        $count = max( 1, min( count( $sections ), $max_sections ) );

        echo '<div class="ngwcs-component-settings" style="max-width:900px;">';
        echo '<h3 style="margin-top:20px;">' . esc_html__( 'Category Products Sections', 'ngw-commerce-settings' ) . '</h3>';
        echo '<p class="description">' . esc_html__( 'Configure multiple category-products components for your homepage. Each section displays products from a specific category.', 'ngw-commerce-settings' ) . '</p>';
        echo '<div class="ngwcs-cp-sections ngwcs-accordion" style="margin-top:16px;">';

        for ( $i = 0; $i < $count; $i++ ) {
            $cp = isset( $sections[$i] ) ? $sections[$i] : array();
            $cat_name = isset( $cp['categoryId'] ) && $cp['categoryId'] ? get_term( absint( $cp['categoryId'] ), 'product_cat' ) : null;
            $cat_label = $cat_name && ! is_wp_error( $cat_name ) ? $cat_name->name : __( 'Category', 'ngw-commerce-settings' ) . ' #' . intval( $i + 1 );
            $is_first = ( $i === 0 );
            echo '<div class="ngwcs-cp-section ngwcs-accordion-item" data-index="' . intval( $i ) . '">';
            echo '<div class="ngwcs-accordion-header" data-state="' . ( $is_first ? 'open' : 'closed' ) . '">';
            echo '<button type="button" class="ngwcs-accordion-trigger" aria-expanded="' . ( $is_first ? 'true' : 'false' ) . '">';
            echo '<span class="dashicons dashicons-arrow-down-alt2 ngwcs-accordion-icon"></span>';
            echo '<span class="ngwcs-section-title">' . esc_html( $cat_label ) . '</span>';
            echo '<span class="ngwcs-section-meta">' . esc_html__( 'Section', 'ngw-commerce-settings' ) . ' #' . intval( $i + 1 ) . '</span>';
            echo '</button>';
            echo '<button type="button" class="button button-link-delete ngwcs-remove-cp-section" aria-label="' . esc_attr__( 'Remove this section', 'ngw-commerce-settings' ) . '">';
            echo '<span class="dashicons dashicons-trash"></span>';
            echo '</button>';
            echo '</div>';
            echo '<div class="ngwcs-accordion-content" style="' . ( $is_first ? '' : 'display:none;' ) . '">';
            echo '<div class="ngwcs-section-fields">';
            echo '<table class="form-table" role="presentation">';

            // Category ID
            echo '<tr><th scope="row"><label>' . esc_html__( 'Category ID', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][categoryId]" value="' . esc_attr( isset( $cp['categoryId'] ) ? $cp['categoryId'] : 22 ) . '" min="1" />';
            echo '<p class="description">' . esc_html__( 'WooCommerce category ID to display products from', 'ngw-commerce-settings' ) . '</p>';
            echo '</td></tr>';

            // Display Style
            echo '<tr><th scope="row"><label>' . esc_html__( 'Display Style', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][displayStyle]">';
            $display_styles = array( 'carousel' => 'Carousel', 'grid' => 'Grid', 'list' => 'List' );
            foreach ( $display_styles as $value => $label ) {
                $selected = ( isset( $cp['displayStyle'] ) && $cp['displayStyle'] === $value ) ? 'selected' : '';
                echo '<option value="' . esc_attr( $value ) . '" ' . $selected . '>' . esc_html( $label ) . '</option>';
            }
            echo '</select></td></tr>';

            // Limit
            echo '<tr><th scope="row"><label>' . esc_html__( 'Products Limit', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][limit]" value="' . esc_attr( isset( $cp['limit'] ) ? $cp['limit'] : 8 ) . '" min="1" max="50" /></td></tr>';

            // Carousel Autoplay
            echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Autoplay', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselAutoplay]" value="1" ' . checked( isset( $cp['carouselAutoplay'] ) && $cp['carouselAutoplay'], true, false ) . ' /></td></tr>';

            // Carousel Delay
            echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Delay (ms)', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselDelay]" value="' . esc_attr( isset( $cp['carouselDelay'] ) ? $cp['carouselDelay'] : 3000 ) . '" min="1000" max="10000" step="500" /></td></tr>';

            // Carousel Loop
            echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Loop', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselLoop]" value="1" ' . checked( isset( $cp['carouselLoop'] ) && $cp['carouselLoop'], true, false ) . ' /></td></tr>';

            // Carousel Slides Per View
            echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Slides Per View', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselSlidesPerView]" value="' . esc_attr( isset( $cp['carouselSlidesPerView'] ) ? $cp['carouselSlidesPerView'] : 4 ) . '" min="1" max="8" /></td></tr>';

            // Carousel Space Between
            echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Space Between (px)', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselSpaceBetween]" value="' . esc_attr( isset( $cp['carouselSpaceBetween'] ) ? $cp['carouselSpaceBetween'] : 20 ) . '" min="0" max="60" /></td></tr>';

            // Carousel Navigation (arrows)
            echo '<tr><th scope="row"><label>' . esc_html__( 'Show Carousel Navigation (Arrows)', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselNavigation]" value="1" ' . checked( ! isset( $cp['carouselNavigation'] ) || $cp['carouselNavigation'], true, false ) . ' /></td></tr>';

            // Carousel Pagination (bullets)
            echo '<tr><th scope="row"><label>' . esc_html__( 'Show Carousel Pagination (Bullets)', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][carouselPagination]" value="1" ' . checked( ! isset( $cp['carouselPagination'] ) || $cp['carouselPagination'], true, false ) . ' /></td></tr>';

            // Grid Columns
            echo '<tr><th scope="row"><label>' . esc_html__( 'Grid Columns', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][gridColumns]" value="' . esc_attr( isset( $cp['gridColumns'] ) ? $cp['gridColumns'] : 4 ) . '" min="1" max="6" /></td></tr>';

            // Sort By
            echo '<tr><th scope="row"><label>' . esc_html__( 'Sort By', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][sortBy]">';
            $sort_options = array( 'date' => 'Date', 'popularity' => 'Popularity', 'rating' => 'Rating', 'price' => 'Price' );
            foreach ( $sort_options as $value => $label ) {
                $selected = ( isset( $cp['sortBy'] ) && $cp['sortBy'] === $value ) ? 'selected' : '';
                echo '<option value="' . esc_attr( $value ) . '" ' . $selected . '>' . esc_html( $label ) . '</option>';
            }
            echo '</select></td></tr>';

            // Sort Order
            echo '<tr><th scope="row"><label>' . esc_html__( 'Sort Order', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][sortOrder]">';
            $order_options = array( 'asc' => 'Ascending', 'desc' => 'Descending' );
            foreach ( $order_options as $value => $label ) {
                $selected = ( isset( $cp['sortOrder'] ) && $cp['sortOrder'] === $value ) ? 'selected' : '';
                echo '<option value="' . esc_attr( $value ) . '" ' . $selected . '>' . esc_html( $label ) . '</option>';
            }
            echo '</select></td></tr>';

            // Show View All
            echo '<tr><th scope="row"><label>' . esc_html__( 'Show View All Button', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][showViewAll]" value="1" ' . checked( isset( $cp['showViewAll'] ) && $cp['showViewAll'], true, false ) . ' /></td></tr>';

            // Filter: On Sale Only
            echo '<tr><th scope="row"><label>' . esc_html__( 'Show On-Sale Products Only', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][showOnSaleOnly]" value="1" ' . checked( isset( $cp['showOnSaleOnly'] ) && $cp['showOnSaleOnly'], true, false ) . ' /></td></tr>';

            // Filter: Featured Only
            echo '<tr><th scope="row"><label>' . esc_html__( 'Show Featured Products Only', 'ngw-commerce-settings' ) . '</label></th><td>';
            echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][' . intval( $i ) . '][showFeaturedOnly]" value="1" ' . checked( isset( $cp['showFeaturedOnly'] ) && $cp['showFeaturedOnly'], true, false ) . ' /></td></tr>';

            echo '</table>';
            echo '</div>'; // .ngwcs-section-fields
            echo '</div>'; // .ngwcs-accordion-content
            echo '</div>'; // .ngwcs-cp-section
        }
        echo '</div>'; // .ngwcs-cp-sections

        // Add Section button
        echo '<p style="margin-top:16px;">';
        echo '<button type="button" class="button button-primary ngwcs-add-cp-section">';
        echo '<span class="dashicons dashicons-plus-alt" style="margin-top:3px;"></span> ';
        echo esc_html__( 'Add Category Products Section', 'ngw-commerce-settings' );
        echo '</button>';
        echo '</p>';

        // Template for new sections (hidden, non-submitting)
        echo '<script type="text/template" id="ngwcs-cp-template">';
        echo '<div class="ngwcs-cp-section ngwcs-accordion-item" data-index="__INDEX__">';
        echo '<div class="ngwcs-accordion-header" data-state="open">';
        echo '<button type="button" class="ngwcs-accordion-trigger" aria-expanded="true">';
        echo '<span class="dashicons dashicons-arrow-down-alt2 ngwcs-accordion-icon"></span>';
        echo '<span class="ngwcs-section-title">' . esc_html__( 'New Category Section', 'ngw-commerce-settings' ) . '</span>';
        echo '<span class="ngwcs-section-meta">' . esc_html__( 'Section', 'ngw-commerce-settings' ) . ' #__NUM__</span>';
        echo '</button>';
        echo '<button type="button" class="button button-link-delete ngwcs-remove-cp-section" aria-label="' . esc_attr__( 'Remove this section', 'ngw-commerce-settings' ) . '">';
        echo '<span class="dashicons dashicons-trash"></span>';
        echo '</button>';
        echo '</div>';
        echo '<div class="ngwcs-accordion-content">';
        echo '<div class="ngwcs-section-fields">';
        echo '<table class="form-table" role="presentation">';
        // Category ID
        echo '<tr><th scope="row"><label>' . esc_html__( 'Category ID', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][categoryId]" value="22" min="1" />';
        echo '<p class="description">' . esc_html__( 'WooCommerce category ID to display products from', 'ngw-commerce-settings' ) . '</p>';
        echo '</td></tr>';
        // Display Style
        echo '<tr><th scope="row"><label>' . esc_html__( 'Display Style', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][displayStyle]"><option value="carousel">Carousel</option><option value="grid">Grid</option><option value="list">List</option></select>';
        echo '</td></tr>';
        // Limit
        echo '<tr><th scope="row"><label>' . esc_html__( 'Products Limit', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][limit]" value="8" min="1" max="50" />';
        echo '</td></tr>';
        // Carousel Autoplay
        echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Autoplay', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselAutoplay]" value="1" />';
        echo '</td></tr>';
        // Carousel Delay
        echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Delay (ms)', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselDelay]" value="3000" min="1000" max="10000" step="500" />';
        echo '</td></tr>';
        // Carousel Loop
        echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Loop', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselLoop]" value="1" checked />';
        echo '</td></tr>';
        // Carousel Slides Per View
        echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Slides Per View', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselSlidesPerView]" value="4" min="1" max="8" />';
        echo '</td></tr>';
        // Carousel Space Between
        echo '<tr><th scope="row"><label>' . esc_html__( 'Carousel Space Between (px)', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselSpaceBetween]" value="20" min="0" max="60" />';
        echo '</td></tr>';
        // Carousel Navigation (arrows)
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Carousel Navigation (Arrows)', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselNavigation]" value="1" checked />';
        echo '</td></tr>';
        // Carousel Pagination (bullets)
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Carousel Pagination (Bullets)', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][carouselPagination]" value="1" checked />';
        echo '</td></tr>';
        // Grid Columns
        echo '<tr><th scope="row"><label>' . esc_html__( 'Grid Columns', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][gridColumns]" value="4" min="1" max="6" />';
        echo '</td></tr>';
        // Sort By
        echo '<tr><th scope="row"><label>' . esc_html__( 'Sort By', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][sortBy]"><option value="date">Date</option><option value="popularity">Popularity</option><option value="rating">Rating</option><option value="price">Price</option></select>';
        echo '</td></tr>';
        // Sort Order
        echo '<tr><th scope="row"><label>' . esc_html__( 'Sort Order', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][sortOrder]"><option value="desc">Descending</option><option value="asc">Ascending</option></select>';
        echo '</td></tr>';
        // Show View All
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show View All Button', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][showViewAll]" value="1" checked />';
        echo '</td></tr>';
        // Filter: On Sale Only
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show On-Sale Products Only', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][showOnSaleOnly]" value="1" />';
        echo '</td></tr>';
        // Filter: Featured Only
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Featured Products Only', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][category_products_sections][__INDEX__][showFeaturedOnly]" value="1" />';
        echo '</td></tr>';
        echo '</table>';
        echo '</script>';
        echo '</div>';
        
        // Categories Display Settings
        echo '<h3 style="margin-top:30px;">' . esc_html__( 'Categories Display Component', 'ngw-commerce-settings' ) . '</h3>';
        echo '<table class="form-table" role="presentation">';
        
        // Display Style
        echo '<tr><th scope="row"><label>' . esc_html__( 'Display Style', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][displayStyle]">';
        $cd_display_styles = array( 'flat-list' => 'Flat List', 'masonry-grid' => 'Masonry Grid', 'carousel' => 'Carousel' );
        foreach ( $cd_display_styles as $value => $label ) {
            $selected = ( isset( $cd['displayStyle'] ) && $cd['displayStyle'] === $value ) ? 'selected' : '';
            echo '<option value="' . esc_attr( $value ) . '" ' . $selected . '>' . esc_html( $label ) . '</option>';
        }
        echo '</select></td></tr>';
        
        // Size
        echo '<tr><th scope="row"><label>' . esc_html__( 'Category Icon Size', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][size]">';
        $size_options = array( 'sm' => 'Small', 'md' => 'Medium', 'lg' => 'Large', 'xl' => 'Extra Large' );
        foreach ( $size_options as $value => $label ) {
            $selected = ( isset( $cd['size'] ) && $cd['size'] === $value ) ? 'selected' : '';
            echo '<option value="' . esc_attr( $value ) . '" ' . $selected . '>' . esc_html( $label ) . '</option>';
        }
        echo '</select></td></tr>';
        
        // Show Title
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Title', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][showTitle]" value="1" ' . checked( isset( $cd['showTitle'] ) && $cd['showTitle'], true, false ) . ' /></td></tr>';
        
        // Show View All
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show View All Button', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][showViewAll]" value="1" ' . checked( isset( $cd['showViewAll'] ) && $cd['showViewAll'], true, false ) . ' /></td></tr>';
        
        // Show Count
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Product Count', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][showCount]" value="1" ' . checked( isset( $cd['showCount'] ) && $cd['showCount'], true, false ) . ' />';
        echo '<p class="description">' . esc_html__( 'Display product count badge on category items', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Enable Hover
        echo '<tr><th scope="row"><label>' . esc_html__( 'Enable Hover Effects', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][enableHover]" value="1" ' . checked( isset( $cd['enableHover'] ) && $cd['enableHover'], true, false ) . ' /></td></tr>';
        
        // Card Style
        echo '<tr><th scope="row"><label>' . esc_html__( 'Card Style', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<select name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][cardStyle]">';
        $card_styles = array( 'minimal' => 'Minimal', 'elevated' => 'Elevated', 'bordered' => 'Bordered' );
        foreach ( $card_styles as $value => $label ) {
            $selected = ( isset( $cd['cardStyle'] ) && $cd['cardStyle'] === $value ) ? 'selected' : '';
            echo '<option value="' . esc_attr( $value ) . '" ' . $selected . '>' . esc_html( $label ) . '</option>';
        }
        echo '</select>';
        echo '<p class="description">' . esc_html__( 'Visual style for masonry-grid display mode', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Items to Show
        echo '<tr><th colspan="2" style="padding-top:20px;"><h4 style="margin:0;">' . esc_html__( 'Display Settings', 'ngw-commerce-settings' ) . '</h4></th></tr>';
        echo '<tr><th scope="row"><label>' . esc_html__( 'Items to Show', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][limit]" value="' . esc_attr( isset( $cd['limit'] ) ? $cd['limit'] : 10 ) . '" min="1" max="100" style="width:80px;" />';
        echo '<p class="description">' . esc_html__( 'Maximum number of categories to display.', 'ngw-commerce-settings' ) . '</p></td></tr>';

        // Carousel Settings
        echo '<tr><th colspan="2" style="padding-top:20px;"><h4 style="margin:0;">' . esc_html__( 'Carousel Settings', 'ngw-commerce-settings' ) . '</h4></th></tr>';
        
        // Carousel Slides Per View
        echo '<tr><th scope="row"><label>' . esc_html__( 'Slides Per View', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="text" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][carouselSlidesPerView]" value="' . esc_attr( isset( $cd['carouselSlidesPerView'] ) ? $cd['carouselSlidesPerView'] : 'auto' ) . '" style="width:120px;" />';
        echo '<p class="description">' . esc_html__( 'Number of slides visible at once, or "auto" for automatic sizing', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Carousel Space Between
        echo '<tr><th scope="row"><label>' . esc_html__( 'Space Between Slides (px)', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="number" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][carouselSpaceBetween]" value="' . esc_attr( isset( $cd['carouselSpaceBetween'] ) ? $cd['carouselSpaceBetween'] : 20 ) . '" min="0" max="100" style="width:80px;" />';
        echo '<p class="description">' . esc_html__( 'Space between carousel slides in pixels', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Carousel Loop
        echo '<tr><th scope="row"><label>' . esc_html__( 'Enable Loop', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][carouselLoop]" value="1" ' . checked( isset( $cd['carouselLoop'] ) && $cd['carouselLoop'], true, false ) . ' />';
        echo '<p class="description">' . esc_html__( 'Loop carousel slides continuously', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Carousel Autoplay
        echo '<tr><th scope="row"><label>' . esc_html__( 'Enable Autoplay', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][carouselAutoplay]" value="1" ' . checked( isset( $cd['carouselAutoplay'] ) && $cd['carouselAutoplay'], true, false ) . ' />';
        echo '<p class="description">' . esc_html__( 'Automatically advance carousel slides', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Carousel Navigation
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Navigation Arrows', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][carouselNavigation]" value="1" ' . checked( isset( $cd['carouselNavigation'] ) && $cd['carouselNavigation'], true, false ) . ' />';
        echo '<p class="description">' . esc_html__( 'Display previous/next navigation arrows', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        // Carousel Pagination
        echo '<tr><th scope="row"><label>' . esc_html__( 'Show Pagination Dots', 'ngw-commerce-settings' ) . '</label></th><td>';
        echo '<input type="checkbox" name="' . esc_attr( NGWCS_OPTION_KEY ) . '[component_settings][categories_display][carouselPagination]" value="1" ' . checked( isset( $cd['carouselPagination'] ) && $cd['carouselPagination'], true, false ) . ' />';
        echo '<p class="description">' . esc_html__( 'Display pagination dots below carousel', 'ngw-commerce-settings' ) . '</p></td></tr>';
        
        echo '</table>';
        echo '</div>';
    }
}
