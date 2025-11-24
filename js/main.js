/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */

import MobileMenu from './modules/MobileMenu.js';
import Navigation from './modules/Navigation.js';
import ScrollAnimations from './modules/ScrollAnimations.js';
import BackToTop from './modules/BackToTop.js';
import ComingSoonModal from './modules/ComingSoonModal.js';
import ContactForm from './modules/ContactForm.js';
import Donation from './modules/Donation.js';
import { initSmoothScroll } from './utils/smoothScroll.js';

/**
 * Application class
 */
class App {
  constructor() {
    this.modules = [];
  }

  /**
   * Initialize application
   */
  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  /**
   * Start application
   */
  start() {
    try {
      // Initialize all modules
      this.modules = [
        new MobileMenu(),
        new Navigation(),
        new ScrollAnimations(),
        new BackToTop(),
        new ComingSoonModal(),
        new ContactForm(),
        new Donation()
      ];

      // Initialize utilities
      initSmoothScroll();

      console.log('NOVAR Web application initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }
}

// Initialize application
const app = new App();
app.init();

