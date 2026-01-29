import { scrollToElement } from '../utils/smoothScroll.js';

class Router {
  constructor() {
    this.routes = {};
    this.defaultRoute = 'download';
    this.currentRoute = null;

    // Bind event listeners
    window.addEventListener('hashchange', () => this.handleRouteChange());
    window.addEventListener('load', () => this.handleRouteChange());
  }

  /**
   * Register a route with a callback
   * @param {string} hash - The hash path (e.g., 'download')
   * @param {Function} callback - Function to execute when route is active
   */
  addRoute(hash, callback) {
    this.routes[hash] = callback;
    return this;
  }

  /**
   * Set the default route
   * @param {string} hash 
   */
  setDefault(hash) {
    this.defaultRoute = hash;
    return this;
  }

  /**
   * Handle route change
   */
  handleRouteChange() {
    const hash = window.location.hash.replace('#', '') || this.defaultRoute;
    
    // Smooth scroll to the section
    if (hash) {
      scrollToElement(`#${hash}`);
    }

    if (this.currentRoute === hash) return;
    
    this.currentRoute = hash;
    
    if (this.routes[hash]) {
      this.routes[hash](hash);
    }

    // Dispatch custom event for other modules
    window.dispatchEvent(new CustomEvent('routeChanged', { detail: { route: hash } }));
  }

  /**
   * Navigate to a route programmatically
   * @param {string} hash 
   */
  navigate(hash) {
    window.location.hash = hash;
  }

  /**
   * Get current route
   */
  getCurrentRoute() {
    return this.currentRoute || window.location.hash.replace('#', '') || this.defaultRoute;
  }
}

export default new Router();
