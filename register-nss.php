<?php
/**
 * Register NSS post type and taxonomy.
 * Add this to your WordPress theme's functions.php or use as a standalone plugin.
 */

function mu_register_nss_post_type() {
    $labels = array(
        'name'                  => _x('NSS', 'Post Type General Name', 'mu'),
        'singular_name'         => _x('NSS', 'Post Type Singular Name', 'mu'),
        'menu_name'             => __('NSS', 'mu'),
        'all_items'             => __('All NSS Posts', 'mu'),
        'add_new_item'          => __('Add New NSS Post', 'mu'),
        'edit_item'             => __('Edit NSS Post', 'mu'),
        'view_item'             => __('View NSS Post', 'mu'),
        'search_items'          => __('Search NSS Posts', 'mu'),
        'not_found'             => __('No NSS posts found', 'mu'),
        'not_found_in_trash'    => __('No NSS posts found in Trash', 'mu'),
    );
    $args = array(
        'label'                 => __('NSS', 'mu'),
        'labels'                => $labels,
        'supports'              => array('title', 'editor', 'thumbnail', 'excerpt', 'custom-fields'),
        'public'                => true,
        'show_ui'               => true,
        'show_in_menu'          => true,
        'menu_position'         => 20,
        'menu_icon'             => 'dashicons-groups',
        'show_in_admin_bar'     => true,
        'show_in_nav_menus'     => true,
        'can_export'            => true,
        'has_archive'           => false,
        'exclude_from_search'   => false,
        'publicly_queryable'    => true,
        'show_in_rest'          => true,
        'rest_base'             => 'nss',
    );
    register_post_type('nss', $args);
}
add_action('init', 'mu_register_nss_post_type');

function mu_register_nss_taxonomy() {
    $labels = array(
        'name'              => _x('NSS Categories', 'Taxonomy General Name', 'mu'),
        'singular_name'     => _x('NSS Category', 'Taxonomy Singular Name', 'mu'),
        'search_items'      => __('Search NSS Categories', 'mu'),
        'all_items'         => __('All NSS Categories', 'mu'),
        'parent_item'       => __('Parent NSS Category', 'mu'),
        'parent_item_colon' => __('Parent NSS Category:', 'mu'),
        'edit_item'         => __('Edit NSS Category', 'mu'),
        'update_item'       => __('Update NSS Category', 'mu'),
        'add_new_item'      => __('Add New NSS Category', 'mu'),
        'new_item_name'     => __('New NSS Category Name', 'mu'),
        'menu_name'         => __('NSS Categories', 'mu'),
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
        'rest_base'         => 'nss_category',
    );
    register_taxonomy('nss_category', array('nss'), $args);
}
add_action('init', 'mu_register_nss_taxonomy');

function mu_nss_flush_rewrite() {
    mu_register_nss_post_type();
    mu_register_nss_taxonomy();
    flush_rewrite_rules();
}
register_activation_hook(__FILE__, 'mu_nss_flush_rewrite');