# WP Block Scaffold – Developer Guide

This document describes how the `wp-block-scaffold` plugin is structured and how it integrates with the shared MU scaffold. It uses the actual files in this repository and clearly marks optional items that are not present.

What you CAN change in this plugin:

- Block namespaces and classes in `blocks/*/class.block.php`
- Config values in `config.php`
- Block templates and assets under `blocks/*`

## Table of Contents

1. MU Scaffold
2. Plugin Structure
3. Core Files
4. Block System
5. Asset Management
6. Field Management
7. Optional Files Not Present
8. Best Practices
9. Troubleshooting

## MU Scaffold

Core classes under the `MonotoneAcfBlockScaffold` namespace are provided by a shared MU plugin in `wp-content/mu-plugins`. This plugin does not copy those classes. The main plugin file loads `config.php`, sets a `base_file` hint, and boots the scaffold class which builds the context and loads all components.

Boot snippet used by this plugin:

```php
$config_file = plugin_dir_path(__FILE__) . 'config.php';
if (!file_exists($config_file)) {
    throw new \LogicException('WP Block Scaffold config.php not found.');
}
$plugin_config = include $config_file;
if (!$plugin_config) {
    throw new \LogicException('WP Block Scaffold configuration failed to load.');
}
$plugin_config['base_file'] = __FILE__;
(new \MonotoneAcfBlockScaffold\Scaffold($plugin_config))->run();
```

## Plugin Structure

```
wp-block-scaffold/
├── blocks/
│   └── example-block/
│       ├── assets/
│       │   ├── css/
│       │   │   ├── editor.css
│       │   │   ├── editor.min.css (generated)
│       │   │   ├── style.css
│       │   │   └── style.min.css (generated)
│       │   ├── images/
│       │   │   └── tribe-loading.gif
│       │   └── js/
│       │       ├── script.js
│       │       └── script.min.js (generated)
│       ├── block.json
│       ├── class.block.php
│       ├── fields.json
│       ├── README.md
│       ├── DEVELOPMENT_PLAN.md (optional/project-specific)
│       └── template.php
├── ACF_Block_Plugin_Developer_Guide.md (this file)
├── README.md (plugin description and usage)
├── .gitignore
├── wp-block-scaffold.php
└── config.php
```

Notes:

- Example block folder is `blocks/example-block`.
- `template-editor.php` is not present in the example and is not required. The scaffold falls back to `template.php` in the editor if an editor template is missing.

## Core Files

### Main Plugin File (`wp-block-scaffold.php`)

- Loads `config.php`, adds `$plugin_config['base_file'] = __FILE__`, and boots the scaffold via `new MonotoneAcfBlockScaffold\Scaffold($plugin_config))->run()`.

### Configuration File (`config.php`)

Key values used by this plugin:

```php
return [
    'name' => 'WP Block Scaffold',
    'slug' => 'wp-block-scaffold',
    'namespace' => 'WPBlockScaffold',
    'text_domain' => 'wp-block-scaffold',
    'version' => '1.0.0',
    'author' => 'Your Name',
    'description' => 'A scaffold for WordPress block development',
    'block_category' => [
        'slug' => 'wp-block-scaffold',
        'title' => 'WP Block Scaffold',
        'icon' => 'admin-generic'
    ],
    'post_types' => [ /* optional; example included in file */ ],
    'debug' => false,
    'assets' => [ 'minify' => true ]
];
```

## Block System

### Block Directory (Actual)

```
blocks/example-block/
├── assets/ (css, js, images)
├── block.json
├── class.block.php
├── fields.json
└── template.php
```

### `block.json`

Uses the scaffold renderer. No separate editor template is required; the renderer falls back to `template.php` in the editor if `template-editor.php` is absent.

```json
{
  "name": "acf/example",
  "title": "Example Block",
  "description": "A scaffold for block development",
  "category": "wp-block-scaffold",
  "icon": "block-default",
  "keywords": ["scaffold", "example"],
  "acf": {
    "mode": "auto",
    "renderCallback": "MonotoneAcfBlockScaffold\\Block_Renderer::render_block",
    "useEditorTemplate": false
  },
  "supports": { "align": false, "mode": false, "jsx": false },
  "textdomain": "wp-block-scaffold"
}
```

### `class.block.php`

Registers the block using the block folder path so WordPress reads its `block.json`:

```php
<?php

namespace WPBlockScaffold\Blocks;

class Example_Block {
    public function __construct() {
        add_action('init', [$this, 'register_block']);
    }

    public function register_block() {
        register_block_type(__DIR__);
    }
}

new Example_Block();
```

### `template.php`

Rendered by the scaffold via `Block_Renderer::render_block`. If you add a `template-editor.php` later and set `acf.useEditorTemplate` to `true`, the renderer will prefer it; otherwise it will automatically fall back to `template.php` in the editor.

### `fields.json`

ACF field group for this block is bundled as JSON in the block folder.

## Asset Management

- Source assets live in `assets/css` and `assets/js`.
- Minified files (`*.min.css`, `*.min.js`) are present and/or generated by the scaffold’s asset handler.
- Behavior is controlled by `config.php`:
  - Set `'debug' => true` to prefer source files.
  - Set `'assets' => ['minify' => true]` to force minified output even in debug scenarios.

## Field Management

- Requires ACF Pro.
- The bundled `fields.json` is loaded/used by the scaffold’s field group loader.

## Optional Files Not Present

Supported by the scaffold but not included in this example block:

- `template-editor.php` (set `acf.useEditorTemplate` to `true` in `block.json` if you add it)
- `assets/js/editor.js` (editor‑only behavior)
- `assets/css/admin.css`, `assets/css/global.css` (add as needed)
- `template-parts/` (not used here)

## Best Practices

- Escape output (`esc_attr`, `esc_html`) and sanitize input.
- Keep namespaces consistent; only change block‑specific code in the block folder.
- Load assets conditionally (handled by scaffold) and ship only what the block needs.
- Maintain concise `README.md` files per block.

## Troubleshooting

Common checks:

- Block not visible: verify `block.json` and that `class.block.php` runs on `init`.
- Assets not loading: confirm file paths and debug/minify flags in `config.php`.
- ACF fields missing: ensure ACF Pro is active and `fields.json` is present.

Debug/minify controls (this plugin):

- Use `config.php` flags (`'debug'`, `'assets.minify'`) instead of editing scaffold classes.

Testing checklist:

- [ ] Plugin activates without errors
- [ ] Block appears in editor
- [ ] Fields load and save
- [ ] Frontend renders as expected
- [ ] No console/PHP errors
