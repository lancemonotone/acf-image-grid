<?php

namespace MonotoneACFImageGrid\Blocks;

class ACF_Image_Grid {
    public function __construct() {
        add_action('init', [$this, 'register_block']);
    }

    public function register_block() {
        register_block_type(__DIR__);
    }

    /**
     * Validate and prepare slideshow images
     * 
     * @param array $images Gallery images from ACF
     * @return array Processed images array
     */
    public static function prepare_slideshow_images($images) {
        if (empty($images) || !is_array($images)) {
            return [];
        }

        $prepared_images = [];

        foreach ($images as $image) {
            if (is_array($image) && !empty($image['ID'])) {
                $prepared_images[] = [
                    'ID' => $image['ID'],
                    'url' => $image['url'] ?? '',
                    'alt' => $image['alt'] ?? $image['title'] ?? '',
                    'title' => $image['title'] ?? '',
                    'sizes' => $image['sizes'] ?? []
                ];
            }
        }

        return array_slice($prepared_images, 0, 10); // Max 10 images
    }

    /**
     * Prepare individual slot data
     * 
     * @param array $slot_data Raw slot data from ACF
     * @return array|null Processed slot data or null if empty
     */
    public static function prepare_slot_data($slot_data) {
        if (empty($slot_data) || !is_array($slot_data)) {
            return null;
        }

        // Check if we have an image
        if (empty($slot_data['image']) || !is_array($slot_data['image'])) {
            return null;
        }

        return [
            'image' => [
                'ID' => $slot_data['image']['ID'] ?? 0,
                'url' => $slot_data['image']['url'] ?? '',
                'alt' => $slot_data['image']['alt'] ?? $slot_data['image']['title'] ?? '',
                'title' => $slot_data['image']['title'] ?? '',
                'sizes' => $slot_data['image']['sizes'] ?? []
            ],
            'link' => self::prepare_link_data($slot_data['link'] ?? null)
        ];
    }

    /**
     * Prepare link data from ACF link field
     * 
     * @param array|null $link_data Raw link data from ACF
     * @return array|null Processed link data or null if empty
     */
    public static function prepare_link_data($link_data) {
        if (empty($link_data) || !is_array($link_data) || empty($link_data['url'])) {
            return null;
        }

        return [
            'url' => esc_url_raw($link_data['url']),
            'title' => !empty($link_data['title']) ? sanitize_text_field($link_data['title']) : '',
            'target' => !empty($link_data['target']) ? sanitize_text_field($link_data['target']) : '_self'
        ];
    }

    /**
     * Get slideshow settings with defaults
     * 
     * @param array $settings Raw settings from ACF
     * @return array Processed settings
     */
    public static function get_slideshow_settings($settings) {
        $defaults = [
            'transition' => 'fade',
            'autoplay_enabled' => true,
            'autoplay_duration' => 5,
            'show_dots' => true,
            'show_arrows' => true,
            'show_counter' => false
        ];

        if (empty($settings) || !is_array($settings)) {
            return $defaults;
        }

        return [
            'transition' => in_array($settings['transition'] ?? '', ['fade', 'slide', 'slide-vertical'])
                ? $settings['transition']
                : $defaults['transition'],
            'autoplay_enabled' => !empty($settings['autoplay_enabled']),
            'autoplay_duration' => max(2, min(10, intval($settings['autoplay_duration'] ?? $defaults['autoplay_duration']))),
            'show_dots' => !empty($settings['show_dots']),
            'show_arrows' => !empty($settings['show_arrows']),
            'show_counter' => !empty($settings['show_counter'])
        ];
    }

    /**
     * Get grid settings with defaults
     * 
     * @param array $settings Raw settings from ACF
     * @return array Processed settings
     */
    public static function get_grid_settings($settings) {
        $defaults = [
            'gap_size' => 'medium'
        ];

        if (empty($settings) || !is_array($settings)) {
            return $defaults;
        }

        return [
            'gap_size' => in_array($settings['gap_size'] ?? '', ['small', 'medium', 'large'])
                ? $settings['gap_size']
                : $defaults['gap_size']
        ];
    }

    /**
     * Generate responsive image markup
     * 
     * @param array $image Image data array
     * @param string $size WordPress image size
     * @param array $attributes Additional image attributes
     * @return string Image HTML markup
     */
    public static function get_responsive_image_markup($image, $size = 'large', $attributes = []) {
        if (empty($image['ID'])) {
            return '';
        }

        $default_attributes = [
            'loading' => 'lazy',
            'style' => 'aspect-ratio: 350/233.33;'
        ];

        $attributes = array_merge($default_attributes, $attributes);

        return wp_get_attachment_image(
            $image['ID'],
            $size,
            false,
            $attributes
        );
    }

    /**
     * Validate slot data integrity
     * 
     * @param array $all_slots Array of all slot data
     * @return array Validation results
     */
    public static function validate_slot_data($all_slots) {
        $validation = [
            'has_slideshow' => false,
            'populated_slots' => 0,
            'total_slots' => 6,
            'errors' => []
        ];

        // Check slideshow
        if (!empty($all_slots['slideshow_images']) && is_array($all_slots['slideshow_images'])) {
            $validation['has_slideshow'] = true;
            $validation['populated_slots']++;
        }

        // Check individual slots
        for ($i = 2; $i <= 6; $i++) {
            $slot_key = "slot_{$i}";
            if (!empty($all_slots[$slot_key]['image'])) {
                $validation['populated_slots']++;
            }
        }

        // Add warnings/recommendations
        if (!$validation['has_slideshow'] && $validation['populated_slots'] === 0) {
            $validation['errors'][] = 'No images have been added to any slots.';
        }

        if ($validation['has_slideshow'] && count($all_slots['slideshow_images']) === 1) {
            $validation['errors'][] = 'Slideshow has only one image. Consider adding more for better visual impact.';
        }

        return $validation;
    }
}

new ACF_Image_Grid();
