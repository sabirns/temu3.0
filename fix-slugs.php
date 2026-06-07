<?php
/**
 * Fix URL-encoded slugs in WordPress - Run ONCE, then remove.
 * Paste into theme's functions.php or run via WP CLI.
 */
add_action('init', function () {
  // Run only once - disable after execution
  $done = get_option('mu_slug_fix_done');
  if ($done) return;

  $pages = get_posts([
    'post_type' => 'page',
    'posts_per_page' => -1,
    'post_status' => 'any',
  ]);

  foreach ($pages as $page) {
    $old_slug = $page->post_name;
    $decoded = urldecode($old_slug);
    if ($decoded !== $old_slug) {
      wp_update_post([
        'ID' => $page->ID,
        'post_name' => $decoded,
      ]);
    }
  }

  update_option('mu_slug_fix_done', true);
});
