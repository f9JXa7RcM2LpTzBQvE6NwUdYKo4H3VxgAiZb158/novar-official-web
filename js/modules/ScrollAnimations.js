/**
 * Scroll Animations Module
 * Handles scroll-triggered animations using Intersection Observer
 */

import { querySelectorAll } from '../utils/dom.js';

class ScrollAnimations {
  constructor() {
    this.observer = null;
    this.init();
  }

  /**
   * Initialize scroll animations
   */
  init() {
    const elements = querySelectorAll('.animate-on-scroll');
    
    if (elements.length === 0) {
      return;
    }

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback: show all elements immediately
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    // Create observer
    const config = window.AppConfig || {};
    const animation = config.animation || {};
    const options = {
      threshold: animation.scrollThreshold || 0.1,
      rootMargin: animation.scrollMargin || '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: unobserve after animation to improve performance
          // this.observer.unobserve(entry.target);
        }
      });
    }, options);

    // Observe all elements
    elements.forEach(el => {
      this.observer.observe(el);
    });
  }
}

export default ScrollAnimations;
