<?php

/**
 * Plugin Configuration
 * 
 * This file contains all configurable values for the plugin.
 * Update these values when creating a new plugin from this scaffold.
 */

return [
    'name' => 'ACF Image Grid',
    'slug' => 'acf-image-grid',
    'namespace' => 'ACFImageGrid',
    'text_domain' => 'acf-image-grid',
    'version' => '1.0.0',
    'author' => 'Rus Miller',
    'description' => 'Advanced Custom Fields Image Grid blocks for WordPress',

    'block_category' => [
        'slug' => 'acf-image-grid',
        'title' => 'ACF Image Grid',
        'icon' => 'format-gallery'
    ],

    'post_types' => [
        // No custom post types needed for this image grid plugin
    ]
];
