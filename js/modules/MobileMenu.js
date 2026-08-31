/**
 * Mobile Menu Module
 * Expands the floating pill nav downward to reveal tabs
 */

import { getElementById, addClass, removeClass, setStyle } from '../utils/dom.js?v=nav15';

class MobileMenu {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};

    const getId = (selector) => {
      if (!selector) return null;
      return selector.startsWith('#') ? selector.substring(1) : selector;
    };

    this.menuButton = getElementById(getId(selectors.mobileMenuButton) || 'mobile-menu-button');
    this.pill = getElementById('nav-pill');
    this.overlay = getElementById(getId(selectors.mobileMenuOverlay) || 'mobile-menu-overlay');
    this.body = document.body;
    this.isOpen = false;
    this.breakpoint = (config.navigation && config.navigation.mobileBreakpoint) || 768;

    this.init();
  }

  init() {
    if (!this.menuButton || !this.pill || !this.overlay) {
      console.warn('Expandable nav elements not found', {
        button: !!this.menuButton,
        pill: !!this.pill,
        overlay: !!this.overlay
      });
      return;
    }

    this.menuButton.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });

    this.overlay.addEventListener('click', () => this.close());

    this.pill.querySelectorAll('.nav-pill-panel a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < this.breakpoint && this.isOpen) {
          this.close();
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= this.breakpoint && this.isOpen) {
        this.close();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  }

  toggle() {
    if (this.isOpen) this.close();
    else this.open();
  }

  open() {
    addClass(this.pill, 'nav-pill--open');
    addClass(this.overlay, 'active');
    addClass(this.menuButton, 'active');
    this.menuButton.setAttribute('aria-expanded', 'true');
    this.menuButton.setAttribute('aria-label', 'Close menu');
    setStyle(this.body, 'overflow', 'hidden');
    this.isOpen = true;
  }

  close() {
    removeClass(this.pill, 'nav-pill--open');
    removeClass(this.overlay, 'active');
    removeClass(this.menuButton, 'active');
    this.menuButton.setAttribute('aria-expanded', 'false');
    this.menuButton.setAttribute('aria-label', 'Open menu');
    setStyle(this.body, 'overflow', '');
    this.isOpen = false;
  }
}

export default MobileMenu;
