<?php

namespace MonotoneAcfBlockScaffold;

class Post_Types {
    private $config;

    public function __construct() {
        $this->config = defined('PLUGIN_CONFIG') ? PLUGIN_CONFIG : [];
        add_action('init', [$this, 'register_post_types']);
    }

    public function register_post_types() {
        if (!isset($this->config['post_types'])) {
            return;
        }

        foreach ($this->config['post_types'] as $post_type_key => $post_type_config) {
            $this->register_post_type($post_type_key, $post_type_config);
            if (isset($post_type_config['taxonomy'])) {
                $this->register_taxonomy($post_type_key, $post_type_config['taxonomy']);
            }
        }
    }

    private function register_post_type($post_type_key, $config) {
        register_post_type($post_type_key, [
            'labels' => [
                'name' => __($config['name'], PLUGIN_TEXT_DOMAIN ?? 'wp-block-scaffold'),
                'singular_name' => __($config['singular_name'], PLUGIN_TEXT_DOMAIN ?? 'wp-block-scaffold'),
            ],
            'public' => true,
            'has_archive' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'editor', 'thumbnail'],
            'menu_icon' => 'dashicons-admin-post',
            'rewrite' => ['slug' => $config['rewrite_slug']],
        ]);
    }

    private function register_taxonomy($post_type_key, $taxonomy_config) {
        register_taxonomy($taxonomy_config['name'], $post_type_key, [
            'labels' => [
                'name' => __($taxonomy_config['label'], PLUGIN_TEXT_DOMAIN ?? 'wp-block-scaffold'),
                'singular_name' => __($taxonomy_config['singular_label'], PLUGIN_TEXT_DOMAIN ?? 'wp-block-scaffold'),
            ],
            'public' => true,
            'show_in_rest' => true,
            'hierarchical' => true,
            'rewrite' => ['slug' => $taxonomy_config['rewrite_slug']],
        ]);
    }
}

new Post_Types();
