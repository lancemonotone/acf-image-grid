<?php

namespace MonotoneAcfBlockScaffold;

class Field_Groups {
    public function __construct() {
        add_action('acf/init', [$this, 'register_field_groups']);
    }

    public function register_field_groups() {
        $blocks_dir = plugin_dir_path(dirname(__FILE__)) . 'blocks';
        $block_dirs = glob($blocks_dir . '/*', GLOB_ONLYDIR);

        foreach ($block_dirs as $block_dir) {
            $fields_file = $block_dir . '/fields.json';
            if (file_exists($fields_file)) {
                $json = file_get_contents($fields_file);
                $field_group = json_decode($json, true);
                if ($field_group) {
                    acf_add_local_field_group($field_group);
                }
            }
        }
    }
}

new Field_Groups();
