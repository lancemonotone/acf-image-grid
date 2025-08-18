/**
 * ACF Image Grid Slideshow
 * Progressive loading implementation with spinner integration - no jQuery dependencies
 */

class ACFImageGridSlideshow {
  constructor(element) {
    this.element = element;
    this.slideshow = element.querySelector(".slideshow");
    this.slides = element.querySelectorAll(".slide");
    this.dots = element.querySelectorAll(".dot");
    this.prevButton = element.querySelector(".acf-slideshow-prev");
    this.nextButton = element.querySelector(".acf-slideshow-next");
    this.counter = element.querySelector(".counter .current");

    // Settings from data attributes
    this.settings = {
      transition: element.dataset.transition || "fade",
      autoplay: JSON.parse(element.dataset.autoplay || '{"enabled":false}'),
      controls: JSON.parse(element.dataset.controls || "[]"),
    };

    this.currentSlide = 0;
    this.isPlaying = false;
    this.autoplayTimer = null;
    this.touchStartX = null;
    this.touchEndX = null;
    this.loadedSlides = new Set();

    // Spinner functionality
    this.loadedImages = new Set();
    this.DEBUG_PREVENT_LOADING = false;
    this.DEBUG_SHOW_OVERLAY = true;

    this.init();
  }

  /**
   * Create an individual loading spinner for an image
   * @returns {HTMLElement} - The spinner element
   */
  createImageSpinner() {
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
   * Create a debug overlay showing the image filename
   * @param {string} imageUrl - The full image URL
   * @returns {HTMLElement} - The debug overlay element
   */
  createDebugOverlay(imageUrl) {
    const overlay = document.createElement("div");
    overlay.className = "debug-overlay";

    // Extract filename from URL
    const filename = imageUrl.split("/").pop().split("?")[0];

    overlay.textContent = filename;
    return overlay;
  }

  /**
   * Load image when container becomes visible
   * @param {HTMLElement} img - The image element to load
   */
  loadImage(img) {
    const imgSrc = img.getAttribute("data-src");

    // Create a unique identifier that includes the container context
    const container = img.closest(".slide, .slot.secondary");
    const containerId = container
      ? container.dataset.slideIndex || container.dataset.slotNumber
      : "unknown";
    const imgId = `${imgSrc}-${containerId}`;

    // Skip if already loaded in this specific container
    if (this.loadedImages.has(imgId)) {
      return;
    }

    // Ensure a spinner exists immediately BEFORE this image (avoid duplicates)
    const prev = img.previousElementSibling;
    const hasSpinner =
      prev &&
      prev.classList &&
      prev.classList.contains("acf-image-loading-spinner");
    if (!hasSpinner) {
      const spinner = this.createImageSpinner();
      if (spinner) {
        img.parentElement.insertBefore(spinner, img);
      }
    }

    // Prepare fade-in for image and fade-out for spinner
    const spinnerEl =
      img.previousElementSibling &&
      img.previousElementSibling.classList &&
      img.previousElementSibling.classList.contains("acf-image-loading-spinner")
        ? img.previousElementSibling
        : null;

    // Add loading state classes
    img.classList.add("loading");
    if (spinnerEl) {
      spinnerEl.classList.add("visible");
    }

    const onImageLoad = () => {
      // Fade in the image
      requestAnimationFrame(() => {
        img.classList.remove("loading");
        img.classList.add("loaded");

        // Add loaded class to slot container for caption visibility
        const slotContainer = img.closest(".slot");
        if (slotContainer) {
          slotContainer.classList.add("image-loaded");
        }

        // Add debug overlay if debug overlay mode is enabled
        if (this.DEBUG_SHOW_OVERLAY) {
          const imageUrl = img.getAttribute("data-src") || img.src;
          const debugOverlay = this.createDebugOverlay(imageUrl);
          img.parentElement.appendChild(debugOverlay);
        }
      });
      // Fade out spinner
      if (spinnerEl) {
        spinnerEl.classList.remove("visible");
        // Remove from DOM after fade
        setTimeout(() => {
          spinnerEl.remove();
        }, 300);
      }
      img.removeEventListener("load", onImageLoad);
    };

    // Attach load listener before setting src/srcset to catch fast loads
    img.addEventListener("load", onImageLoad, { once: true });

    // DEBUG: Prevent image loading if debug flag is true
    if (this.DEBUG_PREVENT_LOADING) {
      // Keep spinner visible for testing
      return;
    }

    // Set the actual src
    if (img.getAttribute("data-src")) {
      img.src = img.getAttribute("data-src");
    }

    // Force spinner to show even for cached images
    // Add a small delay to ensure spinner is visible
    setTimeout(() => {
      if (img.complete) {
        onImageLoad();
      }
    }, 100);

    // Mark as loaded in this specific container
    this.loadedImages.add(imgId);

    // Remove lazy-load-image class
    img.classList.remove("lazy-load-image");
  }

  /**
   * Load all images in a container (assumes container is already visible)
   * @param {HTMLElement} container - Container to check for images
   */
  loadVisibleImages(container) {
    const images = container.querySelectorAll(".lazy-load-image");
    images.forEach((img) => {
      // Skip spinner images
      if (img.classList.contains("acf-spinner-medium")) {
        return;
      }
      this.loadImage(img);
    });
  }

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
    const secondarySlots = document.querySelectorAll(
      ".acf-image-grid .slot.secondary"
    );
    secondarySlots.forEach((slot) => {
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

  loadSlideImage(slideIndex, priority = "lazy") {
    if (this.loadedSlides.has(slideIndex) || slideIndex >= this.slides.length) {
      return;
    }

    const slide = this.slides[slideIndex];
    const img = slide.querySelector("img");

    if (img) {
      if (img.hasAttribute("data-src")) {
        // Use the spinner-enhanced loading for slides with data-src
        this.loadImage(img);
      } else {
        // For first slide, also use spinner for consistent UX
        // Add loading state class
        img.classList.add("loading");

        // Create and add spinner
        const spinner = this.createImageSpinner();
        if (spinner) {
          img.parentElement.insertBefore(spinner, img);
          spinner.classList.add("visible");
        }

        const onFirstSlideLoad = () => {
          // Fade in the image
          requestAnimationFrame(() => {
            img.classList.remove("loading");
            img.classList.add("loaded");

            // Add loaded class to slot container for caption visibility
            const slotContainer = img.closest(".slot");
            if (slotContainer) {
              slotContainer.classList.add("image-loaded");
            }

            // Add debug overlay if debug overlay mode is enabled
            if (this.DEBUG_SHOW_OVERLAY) {
              const imageUrl = img.src;
              const debugOverlay = this.createDebugOverlay(imageUrl);
              img.parentElement.appendChild(debugOverlay);
            }
          });

          // Fade out spinner
          if (spinner) {
            spinner.classList.remove("visible");
            setTimeout(() => {
              spinner.remove();
            }, 300);
          }

          img.removeEventListener("load", onFirstSlideLoad);
        };

        // DEBUG: Prevent first slide loading if debug flag is true
        if (this.DEBUG_PREVENT_LOADING) {
          return;
        }

        // Add load event listener
        img.addEventListener("load", onFirstSlideLoad, { once: true });

        // Handle cached images with delay for spinner visibility
        setTimeout(() => {
          if (img.complete) {
            onFirstSlideLoad();
          }
        }, 100);
      }
      this.loadedSlides.add(slideIndex);
    }
  }

  preloadAdjacentSlides(currentIndex) {
    // Load next slide
    const nextIndex =
      currentIndex === this.slides.length - 1 ? 0 : currentIndex + 1;
    this.loadSlideImage(nextIndex, "lazy");

    // Load previous slide
    const prevIndex =
      currentIndex === 0 ? this.slides.length - 1 : currentIndex - 1;
    this.loadSlideImage(prevIndex, "lazy");
  }

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
      dot.addEventListener("click", () => this.goToSlide(index));
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

  setupAccessibility() {
    // Make slideshow focusable
    this.slideshow.setAttribute("tabindex", "0");
    this.slideshow.setAttribute("role", "region");
    this.slideshow.setAttribute("aria-label", "Image slideshow");
    this.slideshow.setAttribute("aria-live", "polite");
  }

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

  goToSlide(index) {
    // DEBUG: Prevent slide navigation if debug flag is true
    if (this.DEBUG_PREVENT_LOADING) {
      return;
    }

    if (
      index === this.currentSlide ||
      index < 0 ||
      index >= this.slides.length
    ) {
      return;
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

  nextSlide() {
    const nextIndex =
      this.currentSlide === this.slides.length - 1 ? 0 : this.currentSlide + 1;
    this.goToSlide(nextIndex);
  }

  previousSlide() {
    const prevIndex =
      this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
    this.goToSlide(prevIndex);
  }

  updateSlideVisibility(previousSlide) {
    // Remove active classes
    this.slides[previousSlide]?.classList.remove("active");
    this.slides[previousSlide]?.setAttribute("aria-hidden", "true");

    // Add active class to current slide
    this.slides[this.currentSlide].classList.add("active");
    this.slides[this.currentSlide].setAttribute("aria-hidden", "false");

    // Handle slide transition specific classes
    if (
      this.settings.transition === "slide" ||
      this.settings.transition === "slide-vertical"
    ) {
      this.slides[previousSlide]?.classList.add("prev");
      setTimeout(() => {
        this.slides[previousSlide]?.classList.remove("prev");
      }, 500);
    }
  }

  updateDots() {
    this.dots.forEach((dot, index) => {
      if (index === this.currentSlide) {
        dot.classList.add("active");
        dot.setAttribute("aria-selected", "true");
      } else {
        dot.classList.remove("active");
        dot.setAttribute("aria-selected", "false");
      }
    });
  }

  updateCounter() {
    if (this.counter) {
      this.counter.textContent = this.currentSlide + 1;
    }
  }

  announceSlideChange() {
    const currentImage = this.slides[this.currentSlide].querySelector("img");
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

  startAutoplay() {
    // DEBUG: Prevent autoplay if debug flag is true
    if (this.DEBUG_PREVENT_LOADING) {
      return;
    }

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

  pauseAutoplay() {
    if (this.autoplayTimer) {
      clearInterval(this.autoplayTimer);
      this.autoplayTimer = null;
    }
    this.isPlaying = false;
  }

  resumeAutoplay() {
    if (this.settings.autoplay.enabled && !this.isPlaying) {
      this.startAutoplay();
    }
  }

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

  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX;
  }

  handleTouchEnd(e) {
    // DEBUG: Prevent touch navigation if debug flag is true
    if (this.DEBUG_PREVENT_LOADING) {
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

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const slideshowElements = document.querySelectorAll(
    ".slot.primary[data-slideshow-id]"
  );

  slideshowElements.forEach((element) => {
    new ACFImageGridSlideshow(element);
  });
});
