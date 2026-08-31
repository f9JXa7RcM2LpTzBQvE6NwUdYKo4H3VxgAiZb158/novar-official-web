/**
 * Hero Phone Tour
 * Loops Splash → Feed → Learning Video inside the hero handset
 */

class HeroPhoneTour {
  constructor() {
    this.root = document.getElementById('hero-phone-tour');
    if (!this.root) return;

    this.slides = Array.from(this.root.querySelectorAll('.hero-tour-slide'));
    this.phone = this.root.closest('.hero-phone-frame') || this.root;
    this.index = 0;
    this.intervalMs = 2800;
    this.timer = null;
    this.paused = false;

    if (!this.slides.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.goTo(1);
      return;
    }

    this.goTo(1);
    this.start();
    this.bindHover();
  }

  bindHover() {
    this.phone.addEventListener('mouseenter', () => {
      this.paused = true;
      this.stop();
    });

    this.phone.addEventListener('mouseleave', () => {
      this.paused = false;
      this.start();
    });
  }

  start() {
    this.stop();
    this.timer = window.setInterval(() => {
      if (this.paused) return;
      this.goTo((this.index + 1) % this.slides.length);
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }

  goTo(index) {
    this.index = index;
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === index);
    });
  }
}

export default HeroPhoneTour;
