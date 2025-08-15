<?php

namespace WPBlockScaffold\Blocks;

class Example_Block {
    public function __construct() {
        add_action('init', [$this, 'register_block']);
    }

    public function register_block() {
        register_block_type(__DIR__);
    }

    /**
     * Example: Generate dynamic content based on block fields
     * 
     * @param string $title The block title
     * @param string $content The block content
     * @return string The processed content
     */
    public static function generate_content($title, $content) {
        if (empty($title) && empty($content)) {
            return '<p>Please add some content to this block.</p>';
        }

        $output = '';

        if (!empty($title)) {
            $output .= sprintf('<h2>%s</h2>', esc_html($title));
        }

        if (!empty($content)) {
            $output .= sprintf('<div class="content">%s</div>', wp_kses_post($content));
        }

        return $output;
    }

    /**
     * Example: Get sample data for the block
     * 
     * @param string $type The type of data to retrieve
     * @return mixed The requested data
     */
    public static function get_sample_data($type = 'posts') {
        switch ($type) {
            case 'posts':
                return get_posts([
                    'post_type' => 'post',
                    'posts_per_page' => 3,
                    'post_status' => 'publish'
                ]);
            case 'categories':
                return get_categories(['number' => 5]);
            case 'current_time':
                return current_time('Y-m-d H:i:s');
            default:
                return null;
        }
    }

    /**
     * Example: Process block options before rendering
     * 
     * @param array $options The block options
     * @return array The processed options
     */
    public static function process_options($options) {
        // Set defaults
        $defaults = [
            'show_title' => true,
            'show_content' => true,
            'max_items' => 5,
            'sort_order' => 'date_desc'
        ];

        return wp_parse_args($options, $defaults);
    }
}

new Example_Block();
