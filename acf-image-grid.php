<?php

/**
 * Plugin Name: ACF Image Grid
 * Description: Advanced Custom Fields Image Grid blocks for WordPress
 * Version: 1.0.0
 * Author: Your Name
 * Text Domain: acf-image-grid
 */

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
