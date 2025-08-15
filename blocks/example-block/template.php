<?php

/**
 * Example Block Template
 * 
 * @var array $block The block settings and attributes.
 * @var string $content The block inner HTML (empty).
 * @var bool $is_preview True during backend preview render.
 * @var int $post_id The post ID the block is rendering content against.
 */

// Create class attribute with alignment
$classes = ['example-block'];
if (!empty($block['className'])) {
    $classes[] = $block['className'];
}

$wrapper_attributes = get_block_wrapper_attributes(['class' => implode(' ', $classes)]);

// Get block fields
$title = get_field('title');
$content = get_field('content');

// Example: Use block class methods
$processed_content = WPBlockScaffold\Blocks\Example_Block::generate_content($title, $content);
$sample_posts = WPBlockScaffold\Blocks\Example_Block::get_sample_data('posts');
$current_time = WPBlockScaffold\Blocks\Example_Block::get_sample_data('current_time');
?>

<div <?php echo $wrapper_attributes; ?>>
    <div class="example-block__inner">
        <!-- Example: Using processed content from block class -->
        <?php echo $processed_content; ?>

        <!-- Example: Displaying sample data -->
        <?php if (!empty($sample_posts)) : ?>
            <div class="example-block__sample-posts">
                <h3>Sample Posts</h3>
                <ul>
                    <?php foreach ($sample_posts as $post) : ?>
                        <li>
                            <a href="<?php echo esc_url(get_permalink($post->ID)); ?>">
                                <?php echo esc_html($post->post_title); ?>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <!-- Example: Displaying current time -->
        <div class="example-block__timestamp">
            <small>Generated at: <?php echo esc_html($current_time); ?></small>
        </div>
    </div>
</div>