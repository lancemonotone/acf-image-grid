<?php

namespace MonotoneAcfBlockScaffold;

class Assets {
    private $debug = false;
    private $config = null;

    public function __construct() {
        $this->config = defined('PLUGIN_CONFIG') ? PLUGIN_CONFIG : [];
        $this->debug = $this->config['debug'] ?? false;
        add_action('init', [$this, 'maybe_build_assets'], 5);
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_action('enqueue_block_editor_assets', [$this, 'register_editor_assets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function maybe_build_assets() {
        // Check if minification is disabled via config
        $minify_enabled = $this->config['assets']['minify'] ?? true;
        if ($this->debug && !$minify_enabled) {
            return;
        }

        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        if (!is_dir($blocks_dir)) {
            return;
        }

        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);
        if (!$block_dirs) {
            return;
        }

        foreach ($block_dirs as $block_dir) {
            $this->build_block_styles($block_dir);
            $this->build_block_scripts($block_dir);
        }
    }

    public function register_assets() {
        // Register global styles first
        $this->register_global_styles();

        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        if (!is_dir($blocks_dir)) {
            return;
        }

        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);
        if (!$block_dirs) {
            return;
        }

        foreach ($block_dirs as $block_dir) {
            $block_name = basename($block_dir);
            $this->register_block_assets($block_name);
        }
    }

    public function register_editor_assets() {
        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        if (!is_dir($blocks_dir)) {
            return;
        }

        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);
        if (!$block_dirs) {
            return;
        }

        foreach ($block_dirs as $block_dir) {
            $block_name = basename($block_dir);
            $this->register_block_editor_assets($block_name);
        }
    }

    public function enqueue_admin_assets() {
        // Only load on post edit screens
        $screen = get_current_screen();
        if ($screen && $screen->base === 'post' && $screen->post_type === strtolower(__NAMESPACE__)) {
            wp_enqueue_style(
                strtolower(__NAMESPACE__) . '-admin',
                plugin_dir_url(dirname(__FILE__)) . 'assets/admin.css',
                [],
                filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/admin.css')
            );
        }
    }

    private function register_block_assets($block_name) {
        $block_dir = plugin_dir_path(dirname(__FILE__)) . "blocks/{$block_name}";
        if (!is_dir($block_dir)) {
            return;
        }

        // Get block info from block.json
        $block_json = $block_dir . '/block.json';
        if (!file_exists($block_json)) {
            return;
        }

        $block_data = json_decode(file_get_contents($block_json), true);
        if (!isset($block_data['name'])) {
            return;
        }

        // Only register if block is used
        if (!has_block($block_data['name'])) {
            return;
        }

        // Use standardized handle format: acf-blockname
        $handle = sprintf('acf-%s', $block_name);

        // Register style
        $style_path = $block_dir . '/assets/css/style.css';
        if (file_exists($style_path)) {
            $minify_enabled = $this->config['assets']['minify'] ?? true;
            $style_url = plugins_url("blocks/{$block_name}/assets/css/" . ($this->debug && !$minify_enabled ? 'style.css' : 'style.min.css'), dirname(__FILE__));
            wp_register_style(
                $handle,
                $style_url,
                [],
                filemtime($style_path)
            );
            wp_enqueue_style($handle);
        }

        // Register script
        $script_path = $block_dir . '/assets/js/script.js';
        if (file_exists($script_path)) {
            $minify_enabled = $this->config['assets']['minify'] ?? true;
            $script_url = plugins_url("blocks/{$block_name}/assets/js/" . ($this->debug && !$minify_enabled ? 'script.js' : 'script.min.js'), dirname(__FILE__));
            wp_register_script(
                $handle,
                $script_url,
                ['wp-util'],
                filemtime($script_path),
                true
            );
            wp_enqueue_script($handle);
        }
    }

    private function register_block_editor_assets($block_name) {
        $block_dir = plugin_dir_path(dirname(__FILE__)) . "blocks/{$block_name}";
        if (!is_dir($block_dir)) {
            return;
        }

        // Get block info from block.json
        $block_json = $block_dir . '/block.json';
        if (!file_exists($block_json)) {
            return;
        }

        $block_data = json_decode(file_get_contents($block_json), true);
        if (!isset($block_data['name'])) {
            return;
        }

        // Use standardized handle format: acf-blockname-editor
        $handle = sprintf('acf-%s-editor', $block_name);

        // Register main style first
        $style_path = $block_dir . '/assets/css/style.css';
        if (file_exists($style_path)) {
            $minify_enabled = $this->config['assets']['minify'] ?? true;
            $style_url = plugins_url("blocks/{$block_name}/assets/css/" . ($this->debug && !$minify_enabled ? 'style.css' : 'style.min.css'), dirname(__FILE__));
            wp_register_style(
                $handle . '-main',
                $style_url,
                [],
                filemtime($style_path)
            );
            wp_enqueue_style($handle . '-main');
        }

        // Register editor-specific style if it exists
        $editor_style_path = $block_dir . '/assets/css/editor.css';
        if (file_exists($editor_style_path)) {
            $editor_style_url = plugins_url("blocks/{$block_name}/assets/css/" . ($this->debug ? 'editor.css' : 'editor.min.css'), dirname(__FILE__));
            wp_register_style(
                $handle,
                $editor_style_url,
                [$handle . '-main'], // Make editor styles dependent on main styles
                filemtime($editor_style_path)
            );
            wp_enqueue_style($handle);
        }

        // Register editor script if it exists
        $script_path = $block_dir . '/assets/js/editor.js';
        if (file_exists($script_path)) {
            $script_url = plugins_url("blocks/{$block_name}/assets/js/" . ($this->debug ? 'editor.js' : 'editor.min.js'), dirname(__FILE__));
            wp_register_script(
                $handle,
                $script_url,
                ['wp-blocks', 'wp-element', 'wp-editor'],
                filemtime($script_path),
                true
            );
            wp_enqueue_script($handle);
        }
    }

    private function build_block_styles($block_dir) {
        // Build main styles
        $this->build_style($block_dir, 'style');
        // Build editor styles
        $this->build_style($block_dir, 'editor');
    }

    private function build_style($block_dir, $style_name) {
        $source_path = $block_dir . "/assets/css/{$style_name}.css";
        $build_path = $block_dir . "/assets/css/{$style_name}.min.css";

        if (!file_exists($source_path)) {
            return;
        }

        if ($this->needs_rebuild($build_path, $source_path)) {
            $css_content = file_get_contents($source_path);
            if (!$css_content) {
                return;
            }

            $warning = "/*\n * WARNING: This is an automatically generated file.\n * Do not edit this file directly.\n */\n\n";
            $minified_css = $this->minify_css($css_content);
            file_put_contents($build_path, $warning . $minified_css);
        }
    }

    private function build_block_scripts($block_dir) {
        // Build main script
        $this->build_script($block_dir, 'script');
        // Build editor script
        $this->build_script($block_dir, 'editor');
    }

    private function build_script($block_dir, $script_name) {
        $source_path = $block_dir . "/assets/js/{$script_name}.js";
        $build_path = $block_dir . "/assets/js/{$script_name}.min.js";

        if (!file_exists($source_path)) {
            return;
        }

        if ($this->needs_rebuild($build_path, $source_path)) {
            $js_content = file_get_contents($source_path);
            if (!$js_content) {
                return;
            }

            $warning = "/*\n * WARNING: This is an automatically generated file.\n * Do not edit this file directly.\n */\n\n";
            $minified_js = $this->minify_js($js_content);
            file_put_contents($build_path, $warning . $minified_js);
        }
    }

    private function needs_rebuild($build_path, $source_path) {
        if (!file_exists($build_path)) {
            return true;
        }
        return filemtime($source_path) > filemtime($build_path);
    }

    private function minify_css($css) {
        // Remove comments
        $css = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $css);
        $css = str_replace(': ', ':', $css);
        $css = str_replace(["\r\n", "\r", "\n", "\t", '  ', '    ', '    '], '', $css);
        $css = str_replace(', ', ',', $css);
        $css = str_replace(' {', '{', $css);
        $css = str_replace('{ ', '{', $css);
        $css = str_replace(' }', '}', $css);
        $css = str_replace('} ', '}', $css);
        $css = str_replace(';}', '}', $css);
        return trim($css);
    }

    private function minify_js($js) {
        // Remove comments
        $js = preg_replace('!/\*[^*]*\*+([^/][^*]*\*+)*/!', '', $js);
        $js = preg_replace('/\/\/.*\r?\n/', '', $js);

        // Remove whitespace
        $js = preg_replace('/\s+/', ' ', $js);
        $js = str_replace(': ', ':', $js);
        $js = str_replace(', ', ',', $js);
        $js = str_replace('{ ', '{', $js);
        $js = str_replace(' {', '{', $js);
        $js = str_replace('} ', '}', $js);
        $js = str_replace(' }', '}', $js);
        $js = str_replace('; ', ';', $js);
        $js = str_replace(' ;', ';', $js);

        return trim($js);
    }

    /**
     * Register global styles for the plugin
     */
    private function register_global_styles() {
        $style_path = plugin_dir_path(dirname(__FILE__)) . 'assets/css/global.css';
        if (file_exists($style_path)) {
            wp_enqueue_style(
                strtolower(__NAMESPACE__) . '-global',
                plugin_dir_url(dirname(__FILE__)) . 'assets/css/global.css',
                [],
                filemtime($style_path)
            );
        }
    }
}

new Assets();
