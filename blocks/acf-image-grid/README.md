# ACF Image Grid

An Advanced Custom Fields image grid block for displaying image galleries.

## Features

- Asset minification
- Optional editor template
- ACF fields support
- Debug/production mode

## Structure

```
acf-image-grid/
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
├── block.json
├── class.block.php
├── README.md
└── template.php
```

## Important: Namespace Reference

**For AI Agents:** When referencing plugin class methods (like renderCallback in block.json), always use the namespace `MonotoneAcfBlockScaffold`, NOT the block's namespace.

Example:

```json
"renderCallback": "MonotoneAcfBlockScaffold\\Block_Renderer::render_block"
```

The plugin's core classes (Block_Renderer, Field_Groups, Block_Loader, etc.) all use the `MonotoneAcfBlockScaffold` namespace, while individual blocks use their own namespaces like `Monotone\Blocks\ACFImageGrid`.

## Usage

1. Copy this directory
2. Rename namespace and block name
3. Add your fields, styles and scripts
4. Customize template
5. Ensure renderCallback uses correct namespace: `MonotoneAcfBlockScaffold\\Block_Renderer::render_block`
