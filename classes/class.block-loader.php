<?php

namespace MonotoneAcfBlockScaffold;

class Block_Loader {
    public function __construct() {
        add_action('init', [$this, 'load_block_classes']);
        add_filter('block_categories_all', [$this, 'register_block_category'], 10, 2);
    }

    public function load_block_classes() {
        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);

        foreach ($block_dirs as $block_dir) {
            $class_file = $block_dir . '/class.block.php';
            if (file_exists($class_file)) {
                require_once $class_file;
            }
        }
    }

    public function register_block_category($categories, $post) {
        $config = defined('PLUGIN_CONFIG') ? PLUGIN_CONFIG : [];
        $block_category = $config['block_category'] ?? [
            'slug' => 'wp-block-scaffold',
            'title' => 'WP Block Scaffold',
            'icon' => 'admin-generic'
        ];

        return array_merge(
            $categories,
            [
                [
                    'slug' => $block_category['slug'],
                    'title' => __($block_category['title'], PLUGIN_TEXT_DOMAIN ?? 'wp-block-scaffold'),
                    'icon'  => $block_category['icon'],
                ],
            ]
        );
    }
}

new Block_Loader();
