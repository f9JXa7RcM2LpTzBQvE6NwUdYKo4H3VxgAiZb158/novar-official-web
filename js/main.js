/**
 * Main Application Entry Point
 * Initializes all modules and sets up the application
 */

import MobileMenu from './modules/MobileMenu.js?v=nav22';
import Navigation from './modules/Navigation.js?v=nav22';
import ScrollAnimations from './modules/ScrollAnimations.js?v=nav22';
import BackToTop from './modules/BackToTop.js?v=nav22';
import ComingSoonModal from './modules/ComingSoonModal.js?v=nav22';
import ContactForm from './modules/ContactForm.js?v=nav22';
import Donation from './modules/Donation.js?v=nav22';
import HeroTypewriter from './modules/HeroTypewriter.js?v=nav22';
import HeroPhoneTour from './modules/HeroPhoneTour.js?v=nav22';
import Router from './modules/Router.js?v=nav22';
import { initSmoothScroll } from './utils/smoothScroll.js?v=nav22';

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
      // Initialize routes
      this.initRoutes();

      // Initialize all modules
      this.modules = [
        new MobileMenu(),
        new Navigation(),
        new HeroTypewriter(),
        new HeroPhoneTour(),
        new ScrollAnimations(),
        new BackToTop(),
        new ComingSoonModal(),
        new ContactForm(),
        new Donation()
      ];

      // Initialize utilities
      initSmoothScroll();

      // Signals the <head> guard that the modules are alive, so the
      // scroll-reveal styles may stay armed.
      window.__novarAppReady = true;

      console.log('NOVAR Web application initialized successfully');
    } catch (error) {
      console.error('Error initializing application:', error);
    }
  }

  /**
   * Initialize routing logic
   */
  initRoutes() {
    // Define routes that require specific actions
    // Most sections use smooth scroll, but we can add specific logic here
    const sections = ['download', 'purpose', 'features', 'donate', 'contact'];
    
    sections.forEach(route => {
      Router.addRoute(route, (r) => {
        console.log(`Navigated to section: ${r}`);
        // Navigation and SmoothScroll will handle the visual movement
      });
    });
  }
}

// Initialize application
const app = new App();
app.init();

