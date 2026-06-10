<?php
/**
 * Register IQAC post type and taxonomy.
 * Add this to your WordPress theme's functions.php or use as a standalone plugin.
 */

function mu_register_iqac_post_type() {
    $labels = array(
        'name'                  => _x('IQAC', 'Post Type General Name', 'mu'),
        'singular_name'         => _x('IQAC', 'Post Type Singular Name', 'mu'),
        'menu_name'             => __('IQAC', 'mu'),
        'all_items'             => __('All IQAC Posts', 'mu'),
        'add_new_item'          => __('Add New IQAC Post', 'mu'),
        'edit_item'             => __('Edit IQAC Post', 'mu'),
        'view_item'             => __('View IQAC Post', 'mu'),
        'search_items'          => __('Search IQAC Posts', 'mu'),
        'not_found'             => __('No IQAC posts found', 'mu'),
        'not_found_in_trash'    => __('No IQAC posts found in Trash', 'mu'),
    );
    $args = array(
        'label'                 => __('IQAC', 'mu'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 20,
        'menu_icon'             => 'dashicons-awards',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'show_in_rest'          => true,
        'rest_base'             => 'iqac',
    );
    register_post_type('iqac', $args);
}
add_action('init', 'mu_register_iqac_post_type');

function mu_register_iqac_taxonomy() {
    $labels = array(
        'name'              => _x('IQAC Categories', 'Taxonomy General Name', 'mu'),
        'singular_name'     => _x('IQAC Category', 'Taxonomy Singular Name', 'mu'),
        'search_items'      => __('Search IQAC Categories', 'mu'),
        'all_items'         => __('All IQAC Categories', 'mu'),
        'parent_item'       => __('Parent IQAC Category', 'mu'),
        'parent_item_colon' => __('Parent IQAC Category:', 'mu'),
        'edit_item'         => __('Edit IQAC Category', 'mu'),
        'update_item'       => __('Update IQAC Category', 'mu'),
        'add_new_item'      => __('Add New IQAC Category', 'mu'),
        'new_item_name'     => __('New IQAC Category Name', 'mu'),
        'menu_name'         => __('IQAC Categories', 'mu'),
    );
    $args = array(
        'labels'            => $labels,
        'hierarchical'      => true,
        'public'            => true,
        'show_ui'           => true,
        'show_admin_column' => true,
        'show_in_nav_menus' => true,
        'show_tagcloud'     => false,
        'show_in_rest'      => true,
        'rest_base'         => 'iqac_category',
    );
    register_taxonomy('iqac_category', array('iqac'), $args);
}
add_action('init', 'mu_register_iqac_taxonomy');

function mu_iqac_flush_rewrite() {
    mu_register_iqac_post_type();
    mu_register_iqac_taxonomy();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'mu_iqac_flush_rewrite');