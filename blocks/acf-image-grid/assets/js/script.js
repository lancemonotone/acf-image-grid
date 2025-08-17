/**
 * ACF Image Grid Slideshow
 * Progressive loading implementation - no jQuery dependencies
 */

class ACFImageGridSlideshow {
  constructor(element) {
    this.element = element;
    this.slideshow = element.querySelector(".slideshow");
    this.slides = element.querySelectorAll(".slide");
    this.dots = element.querySelectorAll(".dot");
    this.prevButton = element.querySelector(".arrow.prev");
    this.nextButton = element.querySelector(".arrow.next");
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

    this.init();
  }

  init() {
    if (this.slides.length <= 1) return;

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
  }

  loadSlideImage(slideIndex, priority = "lazy") {
    if (this.loadedSlides.has(slideIndex) || slideIndex >= this.slides.length) {
      return;
    }

    const slide = this.slides[slideIndex];
    const img = slide.querySelector("img[data-src]");

    if (img) {
      const src = img.getAttribute("data-src");
      img.src = src;
      img.loading = priority;
      img.removeAttribute("data-src");
      img.classList.add("loaded");

      this.loadedSlides.add(slideIndex);

      // Add load event listener for smooth transitions
      img.addEventListener("load", () => {
        img.style.opacity = "1";
      });
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

  destroy() {
    this.pauseAutoplay();
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
