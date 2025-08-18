<?php

/**
 * ACF Image Grid Template
 * 
 * @var array $block The block settings and attributes.
 * @var string $content The block inner HTML (empty).
 * @var bool $is_preview True during backend preview render.
 * @var int $post_id The post ID the block is rendering content against.
 */

// Get block fields
$slideshow_images = get_field('slideshow_images');
$slideshow_settings = get_field('slideshow_settings');
$grid_settings = get_field('grid_settings');

$slot_2 = get_field('slot_2');
$slot_3 = get_field('slot_3');
$slot_4 = get_field('slot_4');
$slot_5 = get_field('slot_5');
$slot_6 = get_field('slot_6');

// Create class attribute with gap size
$classes = ['acf-image-grid'];
if (!empty($block['className'])) {
    $classes[] = $block['className'];
}

$gap_size = $grid_settings['gap_size'] ?? 'medium';
$classes[] = 'gap-' . $gap_size;

$wrapper_attributes = get_block_wrapper_attributes(['class' => implode(' ', $classes)]);

// Generate unique slideshow ID
$slideshow_id = 'slideshow-' . uniqid();

// Prepare slideshow settings
$autoplay_enabled = $slideshow_settings['autoplay_enabled'] ?? true;
$autoplay_duration = $slideshow_settings['autoplay_duration'] ?? 5;
$transition = $slideshow_settings['transition'] ?? 'fade';
$show_dots = $slideshow_settings['show_dots'] ?? true;
$show_arrows = $slideshow_settings['show_arrows'] ?? true;
$show_counter = $slideshow_settings['show_counter'] ?? false;

$controls = [];
if ($show_dots) $controls[] = 'dots';
if ($show_arrows) $controls[] = 'arrows';
if ($show_counter) $controls[] = 'counter';

$autoplay_data = [
    'enabled' => $autoplay_enabled,
    'duration' => $autoplay_duration
];
?>

<div <?php echo $wrapper_attributes; ?>>

    <!-- Slot 1: Slideshow -->
    <div class="slot primary"
        data-slot-number="1"
        data-slideshow-id="<?php echo esc_attr($slideshow_id); ?>"
        data-transition="<?php echo esc_attr($transition); ?>"
        data-autoplay="<?php echo esc_attr(wp_json_encode($autoplay_data)); ?>"
        data-controls="<?php echo esc_attr(wp_json_encode($controls)); ?>">

        <?php if (!empty($slideshow_images) && is_array($slideshow_images)): ?>
            <div class="slideshow" id="<?php echo esc_attr($slideshow_id); ?>">
                <div class="container">
                    <div class="track">
                        <?php foreach ($slideshow_images as $index => $image): ?>
                            <div class="slide<?php echo $index === 0 ? ' active' : ''; ?>"
                                data-slide-index="<?php echo esc_attr($index); ?>"
                                aria-hidden="<?php echo $index === 0 ? 'false' : 'true'; ?>">
                                <img <?php if ($index === 0): ?>
                                    src="<?php echo esc_url($image['sizes']['large'] ?? $image['url']); ?>"
                                    loading="eager"
                                    <?php else: ?>
                                    data-src="<?php echo esc_url($image['sizes']['large'] ?? $image['url']); ?>"
                                    src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 350 233'%3E%3C/svg%3E"
                                    loading="lazy"
                                    <?php endif; ?>
                                    alt="<?php echo esc_attr($image['alt'] ?: $image['title'] ?: ''); ?>">
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <?php if (count($slideshow_images) > 1): ?>

                    <?php if ($show_arrows): ?>
                        <button class="acf-slideshow-nav acf-slideshow-prev" tabindex="0" aria-label="Previous slide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <circle class="bg" cx="12" cy="12" r="11"></circle>
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path class="arrow" d="M10.828 12l4.95 4.95-1.414 1.414L8 12l6.364-6.364 1.414 1.414z"></path>
                            </svg>
                        </button>
                        <button class="acf-slideshow-nav acf-slideshow-next" tabindex="0" aria-label="Next slide">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                <circle class="bg" cx="12" cy="12" r="11"></circle>
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path class="arrow" d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z"></path>
                            </svg>
                        </button>
                    <?php endif; ?>

                    <?php if ($show_dots): ?>
                        <div class="dots">
                            <?php foreach ($slideshow_images as $index => $image): ?>
                                <button class="dot<?php echo $index === 0 ? ' active' : ''; ?>"
                                    data-slide-index="<?php echo esc_attr($index); ?>"
                                    aria-label="Go to slide <?php echo esc_attr($index + 1); ?>">
                                </button>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($show_counter): ?>
                        <div class="counter">
                            <span class="current">1</span>/<span class="total"><?php echo count($slideshow_images); ?></span>
                        </div>
                    <?php endif; ?>

                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="placeholder">
                Add images to create slideshow
            </div>
        <?php endif; ?>
    </div>

    <!-- Slots 2-6: Individual Images -->
    <?php
    $slots = [2 => $slot_2, 3 => $slot_3, 4 => $slot_4, 5 => $slot_5, 6 => $slot_6];
    foreach ($slots as $slot_number => $slot_data):
    ?>
        <div class="slot secondary" data-slot-number="<?php echo $slot_number; ?>">
            <?php if (!empty($slot_data['image'])): ?>
                <img src="<?php echo esc_url($slot_data['image']['sizes']['large'] ?? $slot_data['image']['url']); ?>"
                    alt="<?php echo esc_attr($slot_data['image']['alt'] ?: $slot_data['image']['title'] ?: ''); ?>"
                    loading="lazy">

                <?php if (!empty($slot_data['link']) && !empty($slot_data['link']['title'])): ?>
                    <div class="caption">
                        <div class="text"><?php echo esc_html($slot_data['link']['title']); ?></div>
                    </div>
                <?php endif; ?>

                <?php if (!empty($slot_data['link']) && !empty($slot_data['link']['url'])): ?>
                    <a href="<?php echo esc_url($slot_data['link']['url']); ?>"
                        class="link"
                        <?php if (!empty($slot_data['link']['target'])): ?>
                        target="<?php echo esc_attr($slot_data['link']['target']); ?>"
                        <?php endif; ?>
                        <?php if (!empty($slot_data['link']['title'])): ?>
                        title="<?php echo esc_attr($slot_data['link']['title']); ?>"
                        <?php endif; ?>
                        aria-label="<?php echo esc_attr($slot_data['link']['title'] ?: 'View image'); ?>"></a>
                <?php endif; ?>
            <?php else: ?>
                <div class="placeholder">
                    Add image for slot <?php echo $slot_number; ?>
                </div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>

</div>