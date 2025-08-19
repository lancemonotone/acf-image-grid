/**
 * ACF Image Grid Slideshow
 * Progressive loading implementation with spinner integration - no jQuery dependencies
 */

/**
 * Handles image loading errors with consistent styling and behavior
 */
class ImageErrorHandler {
  /**
   * Handle image loading error with visual feedback
   * @param {HTMLElement} img - The image element that failed to load
   * @param {HTMLElement} spinnerEl - The spinner element to remove
   * @param {Function} cleanupCallback - Callback to clean up event listeners
   */
  static handleImageError(img, spinnerEl, cleanupCallback) {
    // Remove loading state using LoadingStateManager
    LoadingStateManager.removeImageLoadingState(img);

    // Fade out spinner
    if (spinnerEl) {
      spinnerEl.classList.remove("visible");
      setTimeout(() => {
        spinnerEl.remove();
      }, 300);
    }

    // Add error indicator styling
    this.addErrorStyling(img);

    // Create and display error message
    this.createErrorMessage(img);

    // Clean up event listeners
    if (cleanupCallback) {
      cleanupCallback();
    }
  }

  /**
   * Add error styling to the failed image
   * @param {HTMLElement} img - The image element to style
   */
  static addErrorStyling(img) {
    img.style.border = "2px solid red";
    img.style.backgroundColor = "#ffebee";
  }

  /**
   * Create and append error message overlay
   * @param {HTMLElement} img - The image element that failed
   * @returns {HTMLElement} - The created error message element
   */
  static createErrorMessage(img) {
    const errorMsg = document.createElement("div");
    errorMsg.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.8);
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 100;
      text-align: center;
      max-width: 200px;
    `;
    errorMsg.textContent = "Image failed to load";
    img.parentElement.appendChild(errorMsg);
    return errorMsg;
  }

  /**
   * Clean up event listeners for image load/error events
   * @param {HTMLElement} img - The image element
   * @param {Function} onImageLoad - Load event handler
   * @param {Function} onImageError - Error event handler
   */
  static cleanupEventListeners(img, onImageLoad, onImageError) {
    img.removeEventListener("load", onImageLoad);
    img.removeEventListener("error", onImageError);
  }
}

/**
 * Manages spinner creation, visibility, and removal with consistent behavior
 */
class SpinnerManager {
  /**
   * Create an individual loading spinner for an image
   * @returns {HTMLElement} - The spinner element
   */
  static createSpinner() {
    const spinner = document.createElement("span");
    spinner.className = "acf-image-loading-spinner";

    const img = document.createElement("img");
    img.className = "acf-spinner-medium";
    img.src =
      "/wp-content/themes/destination-williamstown/assets/images/tribe-loading.gif";
    img.alt = "Loading Image";

    spinner.appendChild(img);
    return spinner;
  }

  /**
   * Check if an image already has a spinner
   * @param {HTMLElement} img - The image element to check
   * @returns {boolean} - True if spinner exists, false otherwise
   */
  static hasSpinner(img) {
    const prev = img.previousElementSibling;
    return (
      prev &&
      prev.classList &&
      prev.classList.contains("acf-image-loading-spinner")
    );
  }

  /**
   * Get the spinner element for an image
   * @param {HTMLElement} img - The image element
   * @returns {HTMLElement|null} - The spinner element or null if not found
   */
  static getSpinner(img) {
    const prev = img.previousElementSibling;
    if (
      prev &&
      prev.classList &&
      prev.classList.contains("acf-image-loading-spinner")
    ) {
      return prev;
    }
    return null;
  }

  /**
   * Add a spinner before an image if one doesn't exist
   * @param {HTMLElement} img - The image element
   * @returns {HTMLElement|null} - The spinner element that was added or null
   */
  static addSpinner(img) {
    if (this.hasSpinner(img)) {
      return this.getSpinner(img);
    }

    const spinner = this.createSpinner();
    if (spinner) {
      img.parentElement.insertBefore(spinner, img);
    }
    return spinner;
  }

  /**
   * Show the spinner (make it visible)
   * @param {HTMLElement} spinnerEl - The spinner element to show
   */
  static showSpinner(spinnerEl) {
    if (spinnerEl) {
      spinnerEl.classList.add("visible");
    }
  }

  /**
   * Hide the spinner (fade out and remove)
   * @param {HTMLElement} spinnerEl - The spinner element to hide
   * @param {number} delay - Delay before removing from DOM (default: 300ms)
   */
  static hideSpinner(spinnerEl, delay = 300) {
    if (spinnerEl) {
      spinnerEl.classList.remove("visible");
      setTimeout(() => {
        spinnerEl.remove();
      }, delay);
    }
  }

  /**
   * Remove spinner immediately without fade animation
   * @param {HTMLElement} spinnerEl - The spinner element to remove
   */
  static removeSpinner(spinnerEl) {
    if (spinnerEl) {
      spinnerEl.remove();
    }
  }
}

/**
 * Manages debug functionality with consistent behavior and output formatting
 */
class DebugManager {
  /**
   * Extract filename from a URL
   * @param {string} url - The URL to extract filename from
   * @returns {string} - The extracted filename
   */
  static extractFilename(url) {
    if (!url) return "unknown";
    const parts = url.split("/");
    return parts[parts.length - 1] || "unknown";
  }

  /**
   * Create debug overlay for an image
   * @param {HTMLElement} img - The image element
   * @param {string} imageUrl - The image URL
   * @returns {HTMLElement} - The created debug overlay element
   */
  static createDebugOverlay(img, imageUrl) {
    const overlay = document.createElement("div");
    const filename = this.extractFilename(imageUrl);
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      background: rgba(0, 255, 0, 0.3);
      color: white;
      padding: 4px 8px;
      font-size: 10px;
      z-index: 50;
      pointer-events: none;
      border-radius: 0 0 4px 0;
    `;
    overlay.textContent = filename;
    img.parentElement.appendChild(overlay);
    return overlay;
  }

  /**
   * Add debug overlay if debug mode is enabled
   * @param {HTMLElement} img - The image element
   * @param {string} imageUrl - The image URL
   * @param {boolean} debugShowOverlay - Whether debug overlay mode is enabled
   */
  static addDebugOverlayIfEnabled(img, imageUrl, debugShowOverlay) {
    if (debugShowOverlay) {
      this.createDebugOverlay(img, imageUrl);
    }
  }

  /**
   * Check if loading should be prevented due to debug mode
   * @param {boolean} debugPreventLoading - Whether debug prevent loading mode is enabled
   * @returns {boolean} - True if loading should be prevented
   */
  static shouldPreventLoading(debugPreventLoading) {
    return debugPreventLoading;
  }

  /**
   * Log debug message with timestamp and context
   * @param {string} message - The message to log
   * @param {string} context - Optional context for the log message
   */
  static log(message, context = null) {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0];
    const prefix = context ? `[${context}]` : "[DEBUG]";
    console.log(`${timestamp} ${prefix}: ${message}`);
  }
}

/**
 * Manages loading state operations with consistent behavior and centralized logic
 */
class LoadingStateManager {
  /**
   * Add loading state to an image
   * @param {HTMLElement} img - The image element
   */
  static addImageLoadingState(img) {
    img.classList.add("loading");
  }

  /**
   * Remove loading state from an image
   * @param {HTMLElement} img - The image element
   */
  static removeImageLoadingState(img) {
    img.classList.remove("loading");
  }

  /**
   * Remove loading state and add loaded state to an image
   * @param {HTMLElement} img - The image element
   */
  static setImageLoadedState(img) {
    img.classList.remove("loading");
    img.classList.add("loaded");
  }

  /**
   * Remove lazy loading class from an image
   * @param {HTMLElement} img - The image element
   */
  static removeLazyClass(img) {
    img.classList.remove("lazy-load-image");
  }

  /**
   * Add image-loaded class to slot container for caption visibility
   * @param {HTMLElement} img - The image element
   */
  static addContainerLoadedState(img) {
    const slotContainer = img.closest(".slot");
    if (slotContainer) {
      slotContainer.classList.add("image-loaded");
    }
  }

  /**
   * Track image as loaded in the loadedImages Set
   * @param {Set} loadedImages - The Set to track loaded images
   * @param {string} imgId - The unique image identifier
   */
  static trackImageAsLoaded(loadedImages, imgId) {
    loadedImages.add(imgId);
  }

  /**
   * Check if image is already loaded
   * @param {Set} loadedImages - The Set of loaded images
   * @param {string} imgId - The unique image identifier
   * @returns {boolean} - True if image is already loaded
   */
  static isImageLoaded(loadedImages, imgId) {
    return loadedImages.has(imgId);
  }

  /**
   * Track slide as loaded in the loadedSlides Set
   * @param {Set} loadedSlides - The Set to track loaded slides
   * @param {number} slideIndex - The slide index
   */
  static trackSlideAsLoaded(loadedSlides, slideIndex) {
    loadedSlides.add(slideIndex);
  }

  /**
   * Check if slide is already loaded
   * @param {Set} loadedSlides - The Set of loaded slides
   * @param {number} slideIndex - The slide index
   * @returns {boolean} - True if slide is already loaded
   */
  static isSlideLoaded(loadedSlides, slideIndex) {
    return loadedSlides.has(slideIndex);
  }

  /**
   * Update slide visibility by managing active and prev classes
   * @param {HTMLElement[]} slides - Array of slide elements
   * @param {number} previousSlide - Index of the previous slide
   * @param {number} currentSlide - Index of the current slide
   * @param {string} transition - The transition type
   */
  static updateSlideVisibility(
    slides,
    previousSlide,
    currentSlide,
    transition
  ) {
    // Remove active classes from previous slide
    if (slides[previousSlide]) {
      slides[previousSlide].classList.remove("active");
      slides[previousSlide].setAttribute("aria-hidden", "true");
    }

    // Add active class to current slide
    slides[currentSlide].classList.add("active");
    slides[currentSlide].setAttribute("aria-hidden", "false");

    // Handle slide transition specific classes
    if (transition === "slide" || transition === "slide-vertical") {
      if (slides[previousSlide]) {
        slides[previousSlide].classList.add("prev");
        setTimeout(() => {
          slides[previousSlide].classList.remove("prev");
        }, 500);
      }
    }
  }

  /**
   * Update dot navigation state
   * @param {HTMLElement[]} dots - Array of dot elements
   * @param {number} currentSlide - Index of the current slide
   */
  static updateDotState(dots, currentSlide) {
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.classList.add("active");
        dot.setAttribute("aria-selected", "true");
      } else {
        dot.classList.remove("active");
        dot.setAttribute("aria-selected", "false");
      }
    });
  }

  /**
   * Create unique image identifier for tracking
   * @param {HTMLElement} img - The image element
   * @param {string} imgSrc - The image source URL
   * @returns {string} - The unique image identifier
   */
  static createImageId(img, imgSrc) {
    const container = img.closest(".slide, .slot.secondary");
    const containerId = container
      ? container.dataset.slideIndex || container.dataset.slotNumber
      : "unknown";

    const containerType = container
      ? container.classList.contains("slide")
        ? "slide"
        : "slot"
      : "unknown";

    return `${imgSrc}-${containerType}-${containerId}`;
  }
}

/**
 * ACF Image Grid Slideshow - Main class for managing slideshow functionality
 * Handles progressive image loading, navigation, autoplay, and accessibility features
 */
class ACFImageGridSlideshow {
  /**
   * Initialize the ACF Image Grid Slideshow
   * @param {HTMLElement} element - The root element containing the slideshow
   * @throws {Error} If element is not provided or invalid
   * @throws {Error} If required slideshow structure is missing
   */
  constructor(element) {
    // Input validation
    if (!element || !(element instanceof HTMLElement)) {
      throw new Error("ACFImageGridSlideshow: Valid HTMLElement is required");
    }

    this.element = element;

    // Cache DOM elements for performance
    this.slideshow = element.querySelector(".slideshow");
    this.slides = element.querySelectorAll(".slide");
    this.dots = element.querySelectorAll(".dot");
    this.prevButton = element.querySelector(".acf-slideshow-prev");
    this.nextButton = element.querySelector(".acf-slideshow-next");
    this.counter = element.querySelector(".counter .current");

    // Validate required structure
    if (!this.slideshow) {
      throw new Error(
        "ACFImageGridSlideshow: Required '.slideshow' element not found"
      );
    }

    // Parse and validate settings from data attributes
    this.settings = this.parseSettings(element);

    // Initialize state
    this.currentSlide = 0;
    this.isPlaying = false;
    this.autoplayTimer = null;
    this.touchStartX = null;
    this.touchEndX = null;
    this.loadedSlides = new Set();

    // Image tracking and debug state
    this.loadedImages = new Set();
    this.DEBUG_PREVENT_LOADING = false;
    this.DEBUG_SHOW_OVERLAY = false;

    // Cache DOM elements for performance
    this.cacheDOMElements();

    this.init();
  }

  /**
   * Parse and validate settings from data attributes
   * @param {HTMLElement} element - The root element
   * @returns {Object} Parsed settings object
   * @private
   */
  parseSettings(element) {
    const settings = {
      transition: element.dataset.transition || "fade",
      autoplay: { enabled: false },
      controls: [],
    };

    // Parse autoplay settings with error handling
    try {
      const autoplayData = element.dataset.autoplay;
      if (autoplayData) {
        settings.autoplay = JSON.parse(autoplayData);
      }
    } catch (error) {
      console.warn(
        "ACFImageGridSlideshow: Invalid autoplay data attribute, using defaults"
      );
    }

    // Parse controls settings with error handling
    try {
      const controlsData = element.dataset.controls;
      if (controlsData) {
        settings.controls = JSON.parse(controlsData);
      }
    } catch (error) {
      console.warn(
        "ACFImageGridSlideshow: Invalid controls data attribute, using defaults"
      );
    }

    return settings;
  }

  /**
   * Cache frequently accessed DOM elements for performance
   * @private
   */
  cacheDOMElements() {
    // Cache slide images to reduce DOM queries
    this.slideImages = Array.from(this.slides).map((slide) =>
      slide.querySelector("img")
    );

    // Cache secondary slots for lazy loading
    this.secondarySlots = document.querySelectorAll(
      ".acf-image-grid .slot.secondary"
    );
  }

  /**
   * Unified method to load an image with spinner and error handling
   * @param {HTMLElement} img - The image element to load
   * @param {Object} [options={}] - Loading options
   * @param {boolean} [options.useDataSrc=true] - Whether to use data-src attribute
   * @param {boolean} [options.trackLoading=true] - Whether to track loading in loadedImages Set
   * @param {boolean} [options.removeLazyClass=true] - Whether to remove lazy-load-image class
   * @throws {Error} If img parameter is not a valid HTMLElement
   * @throws {Error} If img is not an image element
   */
  loadImageWithSpinner(img, options = {}) {
    // Input validation
    if (!img || !(img instanceof HTMLElement)) {
      throw new Error("loadImageWithSpinner: Valid HTMLElement is required");
    }
    if (img.tagName !== "IMG") {
      throw new Error("loadImageWithSpinner: Element must be an IMG tag");
    }

    const {
      useDataSrc = true,
      trackLoading = true,
      removeLazyClass = true,
    } = options;

    const imgSrc = useDataSrc ? img.getAttribute("data-src") : img.src;

    // Create unique image identifier using LoadingStateManager
    const imgId = LoadingStateManager.createImageId(img, imgSrc);

    // Skip if already loaded in this specific container and tracking is enabled
    if (
      trackLoading &&
      LoadingStateManager.isImageLoaded(this.loadedImages, imgId)
    ) {
      return;
    }

    // Add spinner using SpinnerManager
    SpinnerManager.addSpinner(img);

    // Get spinner element for visibility management
    const spinnerEl = SpinnerManager.getSpinner(img);

    // Add loading state using LoadingStateManager
    LoadingStateManager.addImageLoadingState(img);
    SpinnerManager.showSpinner(spinnerEl);

    const onImageLoad = () => {
      // Fade in the image
      requestAnimationFrame(() => {
        // Set loaded state using LoadingStateManager
        LoadingStateManager.setImageLoadedState(img);
        LoadingStateManager.addContainerLoadedState(img);

        // Add debug overlay if debug overlay mode is enabled
        const imageUrl = useDataSrc ? img.getAttribute("data-src") : img.src;
        DebugManager.addDebugOverlayIfEnabled(
          img,
          imageUrl,
          this.DEBUG_SHOW_OVERLAY
        );
      });
      // Hide spinner
      SpinnerManager.hideSpinner(spinnerEl);
      ImageErrorHandler.cleanupEventListeners(img, onImageLoad, onImageError);
    };

    const onImageError = (error) => {
      ImageErrorHandler.handleImageError(img, spinnerEl, () => {
        ImageErrorHandler.cleanupEventListeners(img, onImageLoad, onImageError);
      });
    };

    // Attach load and error listeners before setting src/srcset to catch fast loads
    img.addEventListener("load", onImageLoad, { once: true });
    img.addEventListener("error", onImageError, { once: true });

    // DEBUG: Prevent image loading if debug flag is true
    if (DebugManager.shouldPreventLoading(this.DEBUG_PREVENT_LOADING)) {
      return;
    }

    // Set the actual src
    if (useDataSrc && img.getAttribute("data-src")) {
      img.src = img.getAttribute("data-src");
    }

    // Force spinner to show even for cached images
    // Add a small delay to ensure spinner is visible
    setTimeout(() => {
      if (img.complete) {
        onImageLoad();
      }
    }, 100);

    // Track as loaded using LoadingStateManager
    if (trackLoading) {
      LoadingStateManager.trackImageAsLoaded(this.loadedImages, imgId);
    }

    // Remove lazy class using LoadingStateManager
    if (removeLazyClass) {
      LoadingStateManager.removeLazyClass(img);
    }
  }

  /**
   * Load image when container becomes visible
   * @param {HTMLElement} img - The image element to load
   * @throws {Error} If img parameter is not a valid HTMLElement
   */
  loadImage(img) {
    // Input validation
    if (!img || !(img instanceof HTMLElement)) {
      throw new Error("loadImage: Valid HTMLElement is required");
    }

    this.loadImageWithSpinner(img, {
      useDataSrc: true,
      trackLoading: true,
      removeLazyClass: true,
    });
  }

  /**
   * Load all images in a container (assumes container is already visible)
   * @param {HTMLElement} container - Container to check for images
   * @throws {Error} If container parameter is not a valid HTMLElement
   */
  loadVisibleImages(container) {
    // Input validation
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error(
        "loadVisibleImages: Valid HTMLElement container is required"
      );
    }

    const images = container.querySelectorAll(".lazy-load-image");
    images.forEach((img) => {
      // Skip spinner images
      if (img.classList.contains("acf-spinner-medium")) {
        return;
      }
      this.loadImage(img);
    });
  }

  /**
   * Initialize the slideshow
   * Sets up initial slide loading, event listeners, accessibility, and autoplay
   */
  init() {
    if (this.slides.length === 0) return;

    // Always load the first slide immediately (it's visible)
    this.loadSlideImage(0, "eager");

    // Preload the next slide for smooth transition
    if (this.slides.length > 1) {
      this.loadSlideImage(1, "lazy");
    }

    this.setupEventListeners();
    this.setupAccessibility();

    if (this.settings.autoplay.enabled) {
      this.startAutoplay();
    }

    // Intersection Observer for performance
    this.setupIntersectionObserver();

    // Initialize lazy loading for secondary slots
    this.initSecondarySlotLazyLoading();
  }

  /**
   * Initialize lazy loading for secondary slot images
   */
  initSecondarySlotLazyLoading() {
    this.secondarySlots.forEach((slot) => {
      // Load images for currently visible slots
      this.loadVisibleImages(slot);

      // Set up intersection observer for secondary slots
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadVisibleImages(entry.target);
              observer.unobserve(entry.target); // Only load once
            }
          });
        },
        { threshold: 0.1 }
      );

      observer.observe(slot);
    });
  }

  /**
   * Load a specific slide's image
   * @param {number} slideIndex - Index of the slide to load
   * @param {string} [priority="lazy"] - Loading priority ("eager" or "lazy")
   * @throws {Error} If slideIndex is not a valid number
   * @throws {Error} If slideIndex is out of bounds
   */
  loadSlideImage(slideIndex, priority = "lazy") {
    // Input validation
    if (typeof slideIndex !== "number" || !Number.isInteger(slideIndex)) {
      throw new Error("loadSlideImage: slideIndex must be a valid integer");
    }
    if (slideIndex < 0 || slideIndex >= this.slides.length) {
      throw new Error(
        `loadSlideImage: slideIndex ${slideIndex} is out of bounds (0-${
          this.slides.length - 1
        })`
      );
    }

    if (
      LoadingStateManager.isSlideLoaded(this.loadedSlides, slideIndex) ||
      slideIndex >= this.slides.length
    ) {
      return;
    }

    const img = this.slideImages[slideIndex];

    if (img) {
      if (img.hasAttribute("data-src")) {
        // Use the unified loading method for slides with data-src
        this.loadImageWithSpinner(img, {
          useDataSrc: true,
          trackLoading: true,
          removeLazyClass: true,
        });
      } else {
        // For first slide without data-src, use unified method with different options
        this.loadImageWithSpinner(img, {
          useDataSrc: false,
          trackLoading: false,
          removeLazyClass: false,
        });
      }
      LoadingStateManager.trackSlideAsLoaded(this.loadedSlides, slideIndex);
    }
  }

  /**
   * Preload adjacent slides for smooth navigation
   * @param {number} currentIndex - Current slide index
   * @throws {Error} If currentIndex is not a valid number
   * @throws {Error} If currentIndex is out of bounds
   */
  preloadAdjacentSlides(currentIndex) {
    // Input validation
    if (typeof currentIndex !== "number" || !Number.isInteger(currentIndex)) {
      throw new Error(
        "preloadAdjacentSlides: currentIndex must be a valid integer"
      );
    }
    if (currentIndex < 0 || currentIndex >= this.slides.length) {
      throw new Error(
        `preloadAdjacentSlides: currentIndex ${currentIndex} is out of bounds (0-${
          this.slides.length - 1
        })`
      );
    }

    // Load next slide
    const nextIndex =
      currentIndex === this.slides.length - 1 ? 0 : currentIndex + 1;
    this.loadSlideImage(nextIndex, "lazy");

    // Load previous slide
    const prevIndex =
      currentIndex === 0 ? this.slides.length - 1 : currentIndex - 1;
    this.loadSlideImage(prevIndex, "lazy");
  }

  /**
   * Set up all event listeners for navigation and interaction
   * Includes arrow navigation, dot navigation, keyboard, touch, and autoplay controls
   */
  setupEventListeners() {
    // Arrow navigation
    if (this.prevButton) {
      this.prevButton.addEventListener("click", () => this.previousSlide());
    }
    if (this.nextButton) {
      this.nextButton.addEventListener("click", () => this.nextSlide());
    }

    // Dot navigation
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.goToSlide(index);
      });
    });

    // Keyboard navigation
    this.slideshow.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Touch/swipe support
    this.slideshow.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: true }
    );
    this.slideshow.addEventListener("touchend", (e) => this.handleTouchEnd(e), {
      passive: true,
    });

    // Pause autoplay on hover/focus
    this.slideshow.addEventListener("mouseenter", () => this.pauseAutoplay());
    this.slideshow.addEventListener("mouseleave", () => this.resumeAutoplay());
    this.slideshow.addEventListener("focusin", () => this.pauseAutoplay());
    this.slideshow.addEventListener("focusout", () => this.resumeAutoplay());

    // Handle visibility change
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pauseAutoplay();
      } else if (this.settings.autoplay.enabled) {
        this.resumeAutoplay();
      }
    });
  }

  /**
   * Set up accessibility attributes for screen readers
   * Makes the slideshow keyboard navigable and announces changes
   */
  setupAccessibility() {
    // Make slideshow focusable
    this.slideshow.setAttribute("tabindex", "0");
    this.slideshow.setAttribute("role", "region");
    this.slideshow.setAttribute("aria-label", "Image slideshow");
    this.slideshow.setAttribute("aria-live", "polite");
  }

  /**
   * Set up Intersection Observer for performance optimization
   * Pauses autoplay when slideshow is not visible and resumes when visible
   */
  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (this.settings.autoplay.enabled && !this.isPlaying) {
              this.resumeAutoplay();
            }
          } else {
            this.pauseAutoplay();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(this.slideshow);
  }

  /**
   * Navigate to a specific slide
   * @param {number} index - Index of the slide to navigate to
   * @throws {Error} If index is not a valid number
   * @throws {Error} If index is out of bounds
   */
  goToSlide(index) {
    // Input validation
    if (typeof index !== "number" || !Number.isInteger(index)) {
      throw new Error("goToSlide: index must be a valid integer");
    }
    if (index < 0 || index >= this.slides.length) {
      throw new Error(
        `goToSlide: index ${index} is out of bounds (0-${
          this.slides.length - 1
        })`
      );
    }

    if (index === this.currentSlide) {
      return; // Already on this slide
    }

    const previousSlide = this.currentSlide;
    this.currentSlide = index;

    // Load current slide if not already loaded
    this.loadSlideImage(index, "eager");

    // Preload adjacent slides for smooth navigation
    this.preloadAdjacentSlides(index);

    this.updateSlideVisibility(previousSlide);
    this.updateDots();
    this.updateCounter();
    this.announceSlideChange();
  }

  /**
   * Navigate to the next slide (wraps to first slide if at the end)
   */
  nextSlide() {
    const nextIndex =
      this.currentSlide === this.slides.length - 1 ? 0 : this.currentSlide + 1;
    this.goToSlide(nextIndex);
  }

  /**
   * Navigate to the previous slide (wraps to last slide if at the beginning)
   */
  previousSlide() {
    const prevIndex =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  /**
   * Update slide visibility and transition states
   * @param {number} previousSlide - Index of the previous slide
   */
  updateSlideVisibility(previousSlide) {
    LoadingStateManager.updateSlideVisibility(
      this.slides,
      previousSlide,
      this.currentSlide,
      this.settings.transition
    );
  }

  /**
   * Update dot navigation state to reflect current slide
   */
  updateDots() {
    LoadingStateManager.updateDotState(this.dots, this.currentSlide);
  }

  /**
   * Update slide counter display
   */
  updateCounter() {
    if (this.counter) {
      this.counter.textContent = this.currentSlide + 1;
    }
  }

  /**
   * Announce slide change for screen readers
   * Creates a temporary ARIA live region to announce the current slide
   */
  announceSlideChange() {
    const currentImage = this.slideImages[this.currentSlide];
    const altText = currentImage?.getAttribute("alt") || "";
    const announcement = `Slide ${this.currentSlide + 1} of ${
      this.slides.length
    }${altText ? ": " + altText : ""}`;

    // Create temporary announcement element
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    announcer.style.cssText =
      "position:absolute;left:-10000px;width:1px;height:1px;overflow:hidden;";
    announcer.textContent = announcement;

    this.slideshow.appendChild(announcer);
    setTimeout(() => announcer.remove(), 1000);
  }

  /**
   * Start autoplay functionality
   * Automatically advances slides at the configured interval
   */
  startAutoplay() {
    if (this.slides.length <= 1 || this.isPlaying) return;

    this.isPlaying = true;
    this.autoplayTimer = setInterval(() => {
      const nextIndex =
        this.currentSlide === this.slides.length - 1
          ? 0
          : this.currentSlide + 1;

      // Preload the slide we're about to show
      this.loadSlideImage(nextIndex, "eager");

      // Small delay to ensure image starts loading before transition
      setTimeout(() => {
        this.goToSlide(nextIndex);
      }, 50);
    }, (this.settings.autoplay.duration || 5) * 1000);
  }

  /**
   * Pause autoplay functionality
   * Stops the autoplay timer and marks autoplay as inactive
   */
  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    this.isPlaying = false;
  }

  /**
   * Resume autoplay functionality
   * Restarts autoplay if it was previously enabled and is currently paused
   */
  resumeAutoplay() {
    if (this.settings.autoplay.enabled && !this.isPlaying) {
      this.startAutoplay();
    }
  }

  /**
   * Handle keyboard navigation events
   * @param {KeyboardEvent} e - The keyboard event
   */
  handleKeydown(e) {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        this.previousSlide();
        break;
      case "ArrowRight":
        e.preventDefault();
        this.nextSlide();
        break;
      case " ":
        e.preventDefault();
        this.isPlaying ? this.pauseAutoplay() : this.startAutoplay();
        break;
      case "Home":
        e.preventDefault();
        this.goToSlide(0);
        break;
      case "End":
        e.preventDefault();
        this.goToSlide(this.slides.length - 1);
        break;
    }
  }

  /**
   * Handle touch start event for swipe navigation
   * @param {TouchEvent} e - The touch event
   */
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
  }

  /**
   * Handle touch end event for swipe navigation
   * @param {TouchEvent} e - The touch event
   */
  handleTouchEnd(e) {
    // DEBUG: Prevent touch navigation if debug flag is true
    if (DebugManager.shouldPreventLoading(this.DEBUG_PREVENT_LOADING)) {
      this.touchStartX = null;
      this.touchEndX = null;
      return;
    }

    if (!this.touchStartX) return;

    this.touchEndX = e.changedTouches[0].clientX;
    const diff = this.touchStartX - this.touchEndX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.previousSlide();
      }
    }

    this.touchStartX = null;
    this.touchEndX = null;
  }
}

/**
 * Initialize all ACF Image Grid Slideshows when DOM is ready
 * Finds all slideshow elements and creates instances for each
 */
document.addEventListener("DOMContentLoaded", () => {
  const slideshowElements = document.querySelectorAll(
    ".slot.primary[data-slideshow-id]"
  );

  slideshowElements.forEach((element) => {
    try {
      new ACFImageGridSlideshow(element);
    } catch (error) {
      console.error("Failed to initialize ACF Image Grid Slideshow:", error);
    }
  });
});
