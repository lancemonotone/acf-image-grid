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
