/**
 * Navigation Module
 * Handles navigation bar behavior on scroll and active link highlighting
 */

import { getElementById, addClass, removeClass } from '../utils/dom.js';
import Router from './Router.js';

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

    // Floating pill nav — no glass/transparent toggle needed
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          this.updateActiveLinkFromScroll();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Listen for route changes
    window.addEventListener('routeChanged', (e) => {
      this.setActiveLink(e.detail.route);
    });

    // Set initial active link
    setTimeout(() => {
      const currentRoute = Router.getCurrentRoute();
      this.setActiveLink(currentRoute);
    }, 100);
  }

  /**
   * Update active navigation link based on scroll position
   */
  updateActiveLinkFromScroll() {
    const sections = document.querySelectorAll('section[id]');
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

    if (currentSection) {
      this.setActiveLink(currentSection);
      // Optionally update hash without triggering route logic (replaceState)
      if (window.location.hash !== `#${currentSection}`) {
        history.replaceState(null, null, `#${currentSection}`);
      }
    }
  }

  /**
   * Set active link visually
   * @param {string} route 
   */
  setActiveLink(route) {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    navLinks.forEach(link => {
      const linkSection = link.getAttribute('data-section');
      if (linkSection === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

export default Navigation;
