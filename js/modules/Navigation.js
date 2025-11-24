/**
 * Navigation Module
 * Handles navigation bar behavior on scroll
 */

import { getElementById, addClass, removeClass } from '../utils/dom.js';

class Navigation {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    this.nav = getElementById(selectors.nav || 'main-nav');
    this.init();
  }

  /**
   * Initialize navigation
   */
  init() {
    if (!this.nav) {
      console.warn('Navigation element not found');
      return;
    }

    // Set initial state - glass effect at top
    addClass(this.nav, 'nav-glass');
    
    // Handle scroll events
    window.addEventListener('scroll', () => this.handleScroll());
  }

  /**
   * Handle scroll event
   */
  handleScroll() {
    // Always keep the glass effect, never make it transparent
    removeClass(this.nav, 'nav-transparent');
    addClass(this.nav, 'nav-glass');
  }
}

export default Navigation;
