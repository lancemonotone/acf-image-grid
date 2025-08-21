<?php

/**
 * Plugin Name: ACF Image Grid
 * Description: Advanced Custom Fields Image Grid blocks for WordPress
 * Version: 1.0.0
 * Author: Rus Miller
 * Author URI: https://rusmiller.com
 * Text Domain: acf-image-grid
 */

if (!defined('ABSPATH')) {
    exit;
}

// Load plugin configuration and boot scaffold via class orchestrator
$config_file = plugin_dir_path(__FILE__) . 'config.php';
if (!file_exists($config_file)) {
    throw new \LogicException('ACF Image Grid config.php not found.');
}
$plugin_config = include $config_file;
if (!$plugin_config) {
    throw new \LogicException('ACF Image Grid configuration failed to load.');
}
// Provide base_file so the scaffold can derive paths/URLs.
$plugin_config['base_file'] = __FILE__;

// Boot the scaffold class
(new \MonotoneAcfBlockScaffold\Scaffold($plugin_config))->run();
