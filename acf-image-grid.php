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
        if (!defined('PLUGIN_CONFIG')) {
            define('PLUGIN_CONFIG', $plugin_config);
        }
        if (!defined('PLUGIN_SLUG')) {
            define('PLUGIN_SLUG', $plugin_config['slug']);
        }
        if (!defined('PLUGIN_TEXT_DOMAIN')) {
            define('PLUGIN_TEXT_DOMAIN', $plugin_config['text_domain']);
        }
    }
}

if (!defined('PLUGIN_BASE_PATH')) {
    define('PLUGIN_BASE_PATH', plugin_dir_path(__FILE__));
}
if (!defined('PLUGIN_BASE_URL')) {
    define('PLUGIN_BASE_URL', plugin_dir_url(__FILE__));
}

// Use the MU scaffold
if (function_exists('monotone_acf_scaffold_boot')) {
    monotone_acf_scaffold_boot();
} else {
    error_log('MU scaffold not found: Please ensure wp-content/mu-plugins/monotone-acf-scaffold.php is installed.');
}
