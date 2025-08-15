<?php

namespace MonotoneAcfBlockScaffold;

class Block_Renderer {
    private static $debug = false;

    /**
     * Render a block
     *
     * @param array $block The block settings and attributes.
     * @param string $content The block content (empty string).
     * @param bool $is_preview True during AJAX preview.
     * @param int $post_id The post ID this block is saved to.
     */
    public static function render_block($block, $content = '', $is_preview = false, $post_id = 0) {
        if (self::$debug && defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Block Renderer Debug:');
            error_log('Is Preview: ' . ($is_preview ? 'true' : 'false'));
            error_log('Block Mode: ' . ($block['mode'] ?? 'not set'));
            error_log('Block Path: ' . ($block['path'] ?? 'not set'));
            error_log('Is Admin: ' . (is_admin() ? 'true' : 'false'));
            error_log('Block: ' . print_r($block, true));
        }

        // Get the block name from the path
        $block_name = basename($block['path']);

        // Only use editor template if we're actually in the editor
        $is_editor = $is_preview && is_admin();
        $template = $is_editor ? 'template-editor.php' : 'template.php';

        if (self::$debug && defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Is Editor: ' . ($is_editor ? 'true' : 'false'));
            error_log('Selected Template: ' . $template);
        }

        // Get the absolute path to the template
        $template_path = plugin_dir_path(dirname(__FILE__)) . 'blocks/' . $block_name . '/' . $template;

        if (self::$debug && defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Template Path: ' . $template_path);
            error_log('Template Exists: ' . (file_exists($template_path) ? 'true' : 'false'));
        }

        if (!file_exists($template_path)) {
            if (self::$debug && defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Template not found at path: ' . $template_path);
                error_log('Falling back to default template');
            }
            // Fall back to default template
            $template = 'template.php';
            $template_path = plugin_dir_path(dirname(__FILE__)) . 'blocks/' . $block_name . '/' . $template;

            if (!file_exists($template_path)) {
                error_log('Default template not found at path: ' . $template_path);
                return;
            }
        }

        include $template_path;
    }
}
