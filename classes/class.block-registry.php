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
