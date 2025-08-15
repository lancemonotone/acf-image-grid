# WP Block Scaffold

A WordPress plugin scaffold for ACF block development with asset handling and template management.

## Structure

```
wp-block-scaffold/
├── blocks/                  # Block directory
│   └── example-block/      # Example block
│       ├── assets/         # Block assets
│       │   ├── css/       # CSS files
│       │   │   └── style.css
│       │   └── js/        # JS files
│       │       └── script.js
│       ├── block.json     # Block configuration
│       ├── class.block.php # Block registration
│       ├── README.md      # Block documentation
│       └── template.php   # Block template
└── classes/               # Core classes
    ├── class.assets.php   # Asset handling
    ├── class.autoloader.php # Class autoloading
    ├── class.block-loader.php # Block initialization
    ├── class.block-registry.php # Block registration
    ├── class.block-renderer.php # Template rendering
    └── class.field-groups.php # ACF field groups
```

## Features

- Automatic asset minification
- Debug/production mode switching
- PSR-4 autoloading
- Block-agnostic asset handling
- Optional editor templates
- ACF field group support

## Usage

1. Clone this repository to your plugins directory
2. Rename namespace and text domain
3. Add your blocks to the blocks directory
4. Activate plugin

## Block Development

Each block requires:

- block.json for configuration
- class.block.php for registration
- template.php for frontend display
- assets/css/style.css and assets/js/script.js for styling/scripts

Optional:

- template-editor.php for custom editor display
- fields.json for ACF fields

## Asset Handling

Assets are automatically:

- Minified in production
- Versioned using filemtime
- Only loaded when block is used
- Debug mode uses source files

## Templates

By default, blocks use template.php for both frontend and editor display.
Set "useEditorTemplate": true in block.json to use template-editor.php for editor display.
