/**
 * Back to Top Button Module
 * Handles back to top button visibility and functionality
 */

import { getElementById, removeClass, addClass, addEventListener } from '../utils/dom.js';

class BackToTop {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    this.button = getElementById(selectors.backToTop || 'back-to-top');
    this.init();
  }

  /**
   * Initialize back to top button
   */
  init() {
    if (!this.button) {
      console.warn('Back to top button not found');
      return;
    }

    // Handle scroll events
    window.addEventListener('scroll', () => this.handleScroll());
    
    // Handle button click
    addEventListener(this.button, 'click', () => this.scrollToTop());
  }

  /**
   * Handle scroll event
   */
  handleScroll() {
    const config = window.AppConfig || {};
    const animation = config.animation || {};
    const threshold = animation.backToTopThreshold || 300;
    
    if (window.pageYOffset > threshold) {
      removeClass(this.button, 'hidden');
    } else {
      addClass(this.button, 'hidden');
    }
  }

  /**
   * Scroll to top
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

export default BackToTop;
