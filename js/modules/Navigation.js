/**
 * Navigation Module
 * Handles navigation bar behavior on scroll and active link highlighting
 */

import { getElementById, addClass, removeClass } from '../utils/dom.js';

class Navigation {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    const navSelector = selectors.nav || '#main-nav';
    this.nav = document.querySelector(navSelector);
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

    // Handle scroll events with throttling
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.handleScroll();
          this.updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Set initial active link
    setTimeout(() => this.updateActiveLink(), 100);
  }

  /**
   * Handle scroll event
   */
  handleScroll() {
    removeClass(this.nav, 'nav-transparent');
    addClass(this.nav, 'nav-glass');
  }

  /**
   * Update active navigation link based on scroll position
   */
  updateActiveLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const scrollPosition = window.scrollY + 200;

    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = sectionId;
      }
    });

    // Default to download if at top
    if (window.scrollY < 100) {
      currentSection = 'download';
    }

    navLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      const underline = link.querySelector('.nav-underline');
      
      if (linkSection === currentSection) {
        link.classList.add('active');
        if (underline) {
          underline.style.width = '100%';
        }
      } else {
        link.classList.remove('active');
        if (underline) {
          underline.style.width = '0';
        }
      }
    });
  }
}

export default Navigation;
