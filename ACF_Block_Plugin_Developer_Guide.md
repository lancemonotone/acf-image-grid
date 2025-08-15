# ACF Block Plugin Developer Guide

A comprehensive guide for creating WordPress plugins that use Advanced Custom Fields (ACF) blocks, following the established patterns from the Lux Capsules and Lux for Life Newsletters plugins.

**This is a scaffold plugin designed to be copied as the foundation for new ACF block plugins.**

## Table of Contents

1. [Plugin Structure](#plugin-structure)
2. [Core Files](#core-files)
3. [Class Architecture](#class-architecture)
4. [Block System](#block-system)
5. [Asset Management](#asset-management)
6. [Field Management](#field-management)
7. [Step-by-Step Implementation](#step-by-step-implementation)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Plugin Structure

```
plugin-name/
├── assets/
│   ├── css/
│   │   ├── admin.css
│   │   └── global.css
│   └── js/
├── blocks/
│   ├── block-name/
│   │   ├── assets/
│   │   │   ├── css/
│   │   │   │   ├── style.css
│   │   │   │   ├── style.min.css (auto-generated)
│   │   │   │   ├── editor.css
│   │   │   │   └── editor.min.css (auto-generated)
│   │   │   ├── js/
│   │   │   │   ├── script.js
│   │   │   │   ├── script.min.js (auto-generated)
│   │   │   │   ├── editor.js
│   │   │   │   └── editor.min.js (auto-generated)
│   │   │   └── img/
│   │   ├── template-parts/
│   │   ├── block.json
│   │   ├── class.block.php
│   │   ├── fields.json
│   │   ├── template.php
│   │   ├── template-editor.php (optional)
│   │   └── README.md
│   └── another-block/
├── classes/
│   ├── class.autoloader.php
│   ├── class.assets.php
│   ├── class.block-loader.php
│   ├── class.block-registry.php
│   ├── class.block-renderer.php
│   ├── class.field-groups.php
│   └── class.post-types.php
├── config.php
├── templates/
├── plugin-name.php
├── .gitignore
└── README.md
```

## Core Files

### 1. Main Plugin File (`plugin-name.php`)

```php
<?php

/**
 * Plugin Name: Plugin Name
 * Description: Description of your plugin
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: plugin-name
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Load plugin configuration
$config_file = plugin_dir_path(__FILE__) . 'config.php';
if (file_exists($config_file)) {
    $plugin_config = include $config_file;
    if ($plugin_config) {
        define('PLUGIN_CONFIG', $plugin_config);
        define('PLUGIN_SLUG', $plugin_config['slug']);
        define('PLUGIN_TEXT_DOMAIN', $plugin_config['text_domain']);
    }
}

require_once plugin_dir_path(__FILE__) . 'classes/class.autoloader.php';
```

### 2. Configuration File (`config.php`)

```php
<?php

/**
 * Plugin Configuration
 *
 * This file contains all configurable values for the plugin.
 * Update these values when creating a new plugin from this scaffold.
 */

return [
    'name' => 'Your Plugin Name',
    'slug' => 'your-plugin-slug',
    'namespace' => 'YourPluginName',
    'text_domain' => 'your-plugin-slug',
    'version' => '1.0.0',
    'author' => 'Your Name',
    'description' => 'Description of your plugin',

    'block_category' => [
        'slug' => 'your-plugin-slug',
        'title' => 'Your Plugin Name',
        'icon' => 'admin-generic'
    ],

    'post_types' => [
        'example' => [
            'name' => 'Examples',
            'singular_name' => 'Example',
            'rewrite_slug' => 'examples',
            'taxonomy' => [
                'name' => 'example_category',
                'label' => 'Categories',
                'singular_label' => 'Category',
                'rewrite_slug' => 'example-categories'
            ]
        ]
    ]
];
```

### 3. Autoloader (`classes/class.autoloader.php`)

```php
<?php

namespace MonotoneAcfBlockScaffold;

class Autoloader {
    public function __construct() {
        $class_files = glob(dirname(__FILE__) . '/class.*.php');
        foreach ($class_files as $file) {
            if ($file !== __FILE__) {
                require_once $file;
            }
        }
    }
}

new Autoloader();
```

## Class Architecture

### 1. Block Registry (`classes/class.block-registry.php`)

```php
<?php

namespace MonotoneAcfBlockScaffold;

class Block_Registry {
    public function __construct() {
        add_action('init', [$this, 'register_blocks'], 5);
    }

    public function register_blocks() {
        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);

        foreach ($block_dirs as $block_dir) {
            $block_json = $block_dir . '/block.json';

            if (file_exists($block_json)) {
                register_block_type($block_dir);
            }
        }
    }
}

new Block_Registry();
```

### 2. Block Loader (`classes/class.block-loader.php`)

```php
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
```

### 3. Block Renderer (`classes/class.block-renderer.php`)

```php
<?php

namespace MonotoneAcfBlockScaffold;

class Block_Renderer {
    private static $debug = false;

    public static function render_block($block, $content = '', $is_preview = false, $post_id = 0) {
        // Get the block name from the path
        $block_name = basename($block['path']);

        // Only use editor template if we're actually in the editor
        $is_editor = $is_preview && is_admin();
        $template = $is_editor ? 'template-editor.php' : 'template.php';

        // Get the absolute path to the template
        $template_path = plugin_dir_path(dirname(__FILE__)) . 'blocks/' . $block_name . '/' . $template;

        if (!file_exists($template_path)) {
            // Fall back to default template
            $template = 'template.php';
            $template_path = plugin_dir_path(dirname(__FILE__)) . 'blocks/' . $block_name . '/' . $template;

            if (!file_exists($template_path)) {
                error_log('Template not found at path: ' . $template_path);
                return;
            }
        }

        include $template_path;
    }
}
```

### 4. Assets Manager (`classes/class.assets.php`)

```php
<?php

namespace MonotoneAcfBlockScaffold;

class Assets {
    private $debug = false;

    public function __construct() {
        add_action('init', [$this, 'maybe_build_assets'], 5);
        add_action('wp_enqueue_scripts', [$this, 'register_assets']);
        add_action('enqueue_block_editor_assets', [$this, 'register_editor_assets']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
    }

    public function maybe_build_assets() {
        if ($this->debug) {
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
            $style_url = plugins_url("blocks/{$block_name}/assets/css/" . ($this->debug ? 'style.css' : 'style.min.css'), dirname(__FILE__));
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
            $script_url = plugins_url("blocks/{$block_name}/assets/js/" . ($this->debug ? 'script.js' : 'script.min.js'), dirname(__FILE__));
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
        $main_style_registered = false;
        if (file_exists($style_path)) {
            $style_url = plugins_url("blocks/{$block_name}/assets/css/" . ($this->debug ? 'style.css' : 'style.min.css'), dirname(__FILE__));
            wp_register_style(
                $handle . '-main',
                $style_url,
                [],
                filemtime($style_path)
            );
            wp_enqueue_style($handle . '-main');
            $main_style_registered = true;
        }

        // Register editor-specific style if it exists
        $editor_style_path = $block_dir . '/assets/css/editor.css';
        if (file_exists($editor_style_path)) {
            $editor_style_url = plugins_url("blocks/{$block_name}/assets/css/" . ($this->debug ? 'editor.css' : 'editor.min.css'), dirname(__FILE__));

            // Only depend on main styles if they were registered
            $dependencies = $main_style_registered ? [$handle . '-main'] : [];

            wp_register_style(
                $handle,
                $editor_style_url,
                $dependencies,
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

    public function enqueue_admin_assets() {
        // Only load on post edit screens
        $screen = get_current_screen();
        if ($screen && $screen->base === 'post' && $screen->post_type === strtolower(__NAMESPACE__)) {
            wp_enqueue_style(
                strtolower(__NAMESPACE__) . '-admin',
                plugin_dir_url(dirname(__FILE__)) . 'assets/css/admin.css',
                [],
                filemtime(plugin_dir_path(dirname(__FILE__)) . 'assets/css/admin.css')
            );
        }
    }
}

new Assets();
```

### 5. Field Groups (`classes/class.field-groups.php`)

```php
<?php

namespace MonotoneAcfBlockScaffold;

class Field_Groups {
    private $registered_groups = [];

    public function __construct() {
        add_action('acf/init', [$this, 'register_field_groups'], 20);
        add_action('acf/init', [$this, 'register_options_pages'], 20);
    }

    public function register_options_pages() {
        if (function_exists('acf_add_options_sub_page')) {
            acf_add_options_sub_page([
                'page_title'    => 'Plugin Name Settings',
                'menu_title'    => 'Plugin Name',
                'parent_slug'   => 'theme-general-settings',
            ]);
        }
    }

    public function register_field_groups() {
        if (!function_exists('acf_add_local_field_group')) {
            return;
        }

        $this->register_block_fields();
        $this->register_options_fields();
        $this->register_post_type_fields();
    }

    private function register_block_fields() {
        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);

        foreach ($block_dirs as $block_dir) {
            $block_name = basename($block_dir);
            $this->register_block_field_group($block_name);
        }
    }

    private function register_block_field_group($block_name) {
        $fields_file = plugin_dir_path(dirname(__FILE__)) . "blocks/{$block_name}/fields.json";

        if (!file_exists($fields_file)) {
            return;
        }

        $fields_config = json_decode(file_get_contents($fields_file), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return;
        }

        $key = 'group_' . sanitize_title($block_name);
        $fields_config['key'] = $key;

        if (isset($this->registered_groups[$key])) {
            return;
        }

        acf_add_local_field_group($fields_config);
        $this->registered_groups[$key] = true;
    }

    private function register_options_fields() {
        // Add your options fields here
        acf_add_local_field_group([
            'key' => 'group_plugin_name_settings',
            'title' => 'Plugin Name Settings',
            'fields' => [
                // Define your options fields
            ],
            'location' => [
                [
                    [
                        'param' => 'options_page',
                        'operator' => '==',
                        'value' => 'acf-options-plugin-name'
                    ]
                ]
            ],
            'menu_order' => 0,
            'position' => 'normal',
            'style' => 'default',
            'label_placement' => 'top',
            'instruction_placement' => 'label',
            'hide_on_screen' => '',
            'active' => true
        ]);
    }

    private function register_post_type_fields() {
        // Add your post type fields here if needed
    }
}

new Field_Groups();
```

### 6. Post Types (`classes/class.post-types.php`)

```php
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
```

## Block System

### Block Structure

Each block follows this structure:

```
blocks/block-name/
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── style.min.css
│   │   ├── editor.css
│   │   └── editor.min.css
│   ├── js/
│   │   ├── script.js
│   │   ├── script.min.js
│   │   ├── editor.js
│   │   └── editor.min.js
│   └── img/
├── template-parts/
├── block.json
├── class.block.php
├── fields.json
├── template.php
├── template-editor.php
└── README.md
```

### Block JSON (`block.json`)

```json
{
  "name": "acf/block-name",
  "title": "Block Title",
  "description": "Block description",
  "category": "plugin-name",
  "icon": "admin-generic",
  "keywords": ["keyword1", "keyword2"],
  "acf": {
    "mode": "preview",
    "renderCallback": "PluginName\\Block_Renderer::render_block",
    "renderTemplate": "template.php",
    "renderTemplateEditor": "template-editor.php",
    "classPrefix": "pn-"
  },
  "supports": {
    "align": false,
    "mode": false,
    "jsx": false
  },
  "textdomain": "plugin-name",
  "version": "1.0.0"
}
```

### Block Class (`class.block.php`)

```php
<?php

namespace PluginName\Blocks;

class Block_Name_Block {
    public function __construct() {
        add_action('init', [$this, 'register_block']);
    }

    public function register_block() {
        register_block_type(__DIR__);
    }
}

new Block_Name_Block();
```

### Block Template (`template.php`)

```php
<?php

/**
 * Block Template
 *
 * @package PluginName
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Create id attribute allowing for custom "anchor" value
$id = 'block-name-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className"
$className = 'block-name';
if (!empty($block['className'])) {
    $className .= ' ' . $block['className'];
}

// Get block fields
$field_value = get_field('field_name');
?>

<div id="<?php echo esc_attr($id); ?>" class="<?php echo esc_attr($className); ?>">
    <!-- Your block content here -->
</div>
```

### Block Editor Template (`template-editor.php`)

**Note:** Editor templates are optional. If you don't create a `template-editor.php` file, the block will use the main `template.php` file for both frontend and editor display.

To use a separate editor template:

1. Create `template-editor.php` in your block directory
2. Set `"useEditorTemplate": true` in your `block.json` file

```php
<?php

/**
 * Block Editor Template
 *
 * @package PluginName
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Create id attribute allowing for custom "anchor" value
$id = 'block-name-' . $block['id'];
if (!empty($block['anchor'])) {
    $id = $block['anchor'];
}

// Create class attribute allowing for custom "className"
$className = 'block-name wp-block-plugin-name-block-name';
if (!empty($block['className'])) {
    $className .= ' ' . $block['className'];
}
?>

<div id="<?php echo esc_attr($id); ?>" class="<?php echo esc_attr($className); ?>">
    <!-- Editor preview content -->
    <div class="block-preview">
        <h3>Block Preview</h3>
        <p>This is how the block will appear on the frontend.</p>
    </div>
</div>
```

**When to use editor templates:**

- When you want different content/styling in the editor vs frontend
- For complex blocks that need simplified previews
- When you want to show placeholder content in the editor

### Block Fields (`fields.json`)

```json
{
  "key": "group_block_name",
  "title": "Block Name Settings",
  "fields": [
    {
      "key": "field_block_name_text",
      "label": "Text Field",
      "name": "text_field",
      "type": "text",
      "instructions": "Enter some text",
      "required": 0,
      "wrapper": {
        "width": "",
        "class": "",
        "id": ""
      }
    }
  ],
  "location": [
    [
      [
        "param": "block",
        "operator": "==",
        "value": "acf/block-name"
      ]
    ]
  ],
  "menu_order": 0,
  "position": "normal",
  "style": "default",
  "label_placement": "top",
  "instruction_placement": "label",
  "hide_on_screen": "",
  "active": true,
  "description": "Settings for the block name block"
}
```

## Configuration System

### Overview

The scaffold uses a PHP configuration file (`config.php`) to make all classes completely agnostic and reusable. This means:

- **Classes never need to be edited** when creating new plugins
- **All customization is done through the config file**
- **Classes use a generic namespace** (`MonotoneAcfBlockScaffold`)
- **Easy to copy and reuse** across multiple plugins

### Configuration Structure

The config file contains:

- **Basic plugin information** (name, slug, version, etc.)
- **Block category settings** (slug, title, icon)
- **Post type definitions** (names, labels, taxonomies)
- **Any other plugin-specific settings**

### Using the Configuration

Classes access the config through WordPress constants:

```php
$config = defined('PLUGIN_CONFIG') ? PLUGIN_CONFIG : [];
$plugin_slug = PLUGIN_SLUG ?? 'default-slug';
$text_domain = PLUGIN_TEXT_DOMAIN ?? 'default-text-domain';
```

### Benefits

1. **Zero class editing** - Classes are completely reusable
2. **Consistent architecture** - All plugins follow the same patterns
3. **Easy customization** - Just edit the config file
4. **Version control friendly** - Clear separation of scaffold vs. custom code

## Asset Management

### CSS Structure

- `style.css` - Frontend styles
- `editor.css` - Editor-specific styles
- `admin.css` - Admin area styles
- `global.css` - Global plugin styles

### JavaScript Structure

- `script.js` - Frontend functionality
- `editor.js` - Editor functionality

### Asset Building

The plugin automatically:

- **Minifies CSS and JS files** when the plugin loads (in production mode)
- **Creates `.min.css` and `.min.js` versions** from source files
- **Only loads assets when blocks are used** on the current page
- **Handles dependencies correctly** between main and editor assets
- **Uses source files in debug mode** and minified files in production

**Important:** Minified files are generated automatically when the plugin loads. You only need to create the source files (`style.css`, `script.js`, etc.). The `.min.css` and `.min.js` files will be created automatically.

## Step-by-Step Implementation

### 1. Copy the Scaffold Plugin

**The easiest way to create a new ACF block plugin is to copy this entire scaffold plugin as your starting point:**

```bash
# Copy the entire scaffold plugin to create your new plugin
cp -r wp-content/plugins/wp-block-scaffold wp-content/plugins/your-plugin-name
cd wp-content/plugins/your-plugin-name
```

### 2. Update Plugin Information

**Update the main plugin file (`your-plugin-name.php`):**

```php
/**
 * Plugin Name: Your Plugin Name
 * Description: Description of your plugin
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: your-plugin-name
 */
```

**Update the configuration file (`config.php`):**

```php
return [
    'name' => 'Your Plugin Name',
    'slug' => 'your-plugin-slug',
    'namespace' => 'YourPluginName',
    'text_domain' => 'your-plugin-slug',
    'version' => '1.0.0',
    'author' => 'Your Name',
    'description' => 'Description of your plugin',

    'block_category' => [
        'slug' => 'your-plugin-slug',
        'title' => 'Your Plugin Name',
        'icon' => 'admin-generic'
    ],

    'post_types' => [
        // Define your post types here
    ]
];
```

**Note:** The classes use a generic namespace (`MonotoneAcfBlockScaffold`) and don't need to be updated. All customization is done through the config file.

### 3. Customize the Example Block

**Replace the example block with your first block:**

```bash
# Remove the example block
rm -rf blocks/example-block

# Create your new block
mkdir -p blocks/your-first-block/assets/css blocks/your-first-block/assets/js
```

**Copy the example block files as a starting point:**

```bash
cp -r blocks/example-block blocks/your-first-block
```

### 4. Update Block Files

**Update `blocks/your-first-block/block.json`:**

- Change `"name": "acf/example"` to `"name": "acf/your-first-block"`
- Update title, description, and keywords
- Update the `renderCallback` namespace

**Update `blocks/your-first-block/class.block.php`:**

- Change class name from `Example_Block` to `Your_First_Block`
- Update namespace

**Update `blocks/your-first-block/template.php`:**

- Update class names and references
- Customize the template for your block's needs

**Update `blocks/your-first-block/fields.json`:**

- Define your ACF fields
- Update field keys and names

### 5. Add Your Assets

**Create your block's CSS and JS files:**

- `blocks/your-first-block/assets/css/style.css`
- `blocks/your-first-block/assets/js/script.js`
- `blocks/your-first-block/assets/css/editor.css` (optional)
- `blocks/your-first-block/assets/js/editor.js` (optional)

### 6. Test and Iterate

1. Activate your new plugin
2. Check block registration in the editor
3. Test block functionality
4. Debug any issues
5. Add more blocks by copying the example block structure

### 7. Add More Blocks

**To add additional blocks, copy the example block structure:**

```bash
cp -r blocks/example-block blocks/another-block
```

**Then update the new block's files following the same process as step 4.**

## Best Practices

### 1. Naming Conventions

- Use kebab-case for file names and directories
- Use PascalCase for class names
- Use snake_case for function names
- Use camelCase for JavaScript variables

### 2. Namespace Usage

- Always use the plugin namespace
- Keep namespaces consistent across files
- Use proper autoloading

### 3. Security

- Always escape output with `esc_attr()`, `esc_html()`, etc.
- Use nonces for AJAX requests
- Validate and sanitize input
- Check user capabilities

### 4. Performance

- Only load assets when needed
- Use conditional loading
- Minify assets in production
- Cache when appropriate

### 5. Accessibility

- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation
- Test with screen readers

### 6. Documentation

- Document all classes and methods
- Include usage examples
- Maintain README files
- Comment complex logic

## Troubleshooting

### Common Issues

1. **Blocks not appearing in editor**

   - Check block registration in `block.json`
   - Verify class loading in `class.block.php`
   - Check for PHP errors

2. **Assets not loading**

   - Verify file paths
   - Check asset registration
   - Ensure blocks are used on page

3. **ACF fields not showing**

   - Verify ACF Pro is active
   - Check field registration
   - Clear ACF cache

4. **Template not found**
   - Check file paths
   - Verify template file exists
   - Check file permissions

### Debug Mode

Enable debug mode by setting `$debug = true` in the Assets class:

```php
private $debug = true;
```

This will load unminified files and provide more detailed error information.

### Testing Checklist

- [ ] Plugin activates without errors
- [ ] Blocks appear in editor
- [ ] Block fields are accessible
- [ ] Frontend rendering works
- [ ] Assets load correctly
- [ ] Editor preview works
- [ ] No console errors
- [ ] Responsive design works
- [ ] Accessibility requirements met

## Conclusion

This guide provides a complete template for creating ACF block plugins following the established patterns. The structure is modular, maintainable, and follows WordPress best practices. Use this as a starting point and customize as needed for your specific requirements.

Remember to:

- Test thoroughly
- Document your code
- Follow WordPress coding standards
- Consider accessibility
- Optimize for performance
- Plan for future maintenance

For additional help, refer to the WordPress Developer Handbook and ACF documentation.
