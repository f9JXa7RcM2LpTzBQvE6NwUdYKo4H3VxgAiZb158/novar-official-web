/**
 * Mobile Menu Module
 * Handles mobile menu toggle and animations
 */

import { getElementById, toggleClass, addClass, removeClass, setStyle, hasClass } from '../utils/dom.js';

class MobileMenu {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    
    // Helper to strip # from selector if present
    const getId = (selector) => {
      if (!selector) return null;
      return selector.startsWith('#') ? selector.substring(1) : selector;
    };
    
    this.menuButton = getElementById(getId(selectors.mobileMenuButton) || 'mobile-menu-button');
    this.menu = getElementById(getId(selectors.mobileMenu) || 'mobile-menu');
    this.overlay = getElementById(getId(selectors.mobileMenuOverlay) || 'mobile-menu-overlay');
    this.body = document.body;
    this.isOpen = false;
    
    console.log('MobileMenu initialized', {
      menuButton: !!this.menuButton,
      menu: !!this.menu,
      overlay: !!this.overlay
    });
    
    this.init();
  }

  /**
   * Initialize mobile menu
   */
  init() {
    if (!this.menuButton || !this.menu || !this.overlay) {
      console.warn('Mobile menu elements not found');
      return;
    }

    // Add event listeners
    this.menuButton.addEventListener('click', () => this.toggle());
    this.overlay.addEventListener('click', () => this.close());
    
    // Close menu when clicking navigation links
    this.setupNavigationLinks();
  }

  /**
   * Toggle mobile menu
   */
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  /**
   * Open mobile menu
   */
  open() {
    addClass(this.menu, 'active');
    addClass(this.overlay, 'active');
    addClass(this.menuButton, 'active');
    setStyle(this.body, 'overflow', 'hidden');
    this.isOpen = true;
  }

  /**
   * Close mobile menu
   */
  close() {
    removeClass(this.menu, 'active');
    removeClass(this.overlay, 'active');
    removeClass(this.menuButton, 'active');
    setStyle(this.body, 'overflow', '');
    this.isOpen = false;
  }

  /**
   * Setup navigation links to close menu on click
   */
  setupNavigationLinks() {
    const config = window.AppConfig || {};
    const navigation = config.navigation || {};
    const mobileBreakpoint = navigation.mobileBreakpoint || 768;
    const navLinks = this.menu.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < mobileBreakpoint && this.isOpen) {
          this.close();
        }
      });
    });
  }
}

export default MobileMenu;
