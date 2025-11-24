/**
 * Coming Soon Modal Module
 * Handles the "Coming Soon" modal for iOS app download
 */

import { getElementById, addClass, removeClass, setStyle, addEventListener } from '../utils/dom.js';

class ComingSoonModal {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    this.modal = getElementById(selectors.comingSoonModal || 'coming-soon-modal');
    this.closeButton = getElementById(selectors.closeComingSoon || 'close-coming-soon');
    this.iosButton = getElementById(selectors.iosDownloadBtn || 'ios-download-btn');
    this.body = document.body;
    this.init();
  }

  /**
   * Initialize coming soon modal
   */
  init() {
    if (!this.modal || !this.closeButton || !this.iosButton) {
      console.warn('Coming soon modal elements not found');
      return;
    }

    // Open modal when iOS button is clicked
    addEventListener(this.iosButton, 'click', () => this.open());
    
    // Close modal when close button is clicked
    addEventListener(this.closeButton, 'click', () => this.close());
    
    // Close modal when clicking outside
    addEventListener(this.modal, 'click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });
  }

  /**
   * Open modal
   */
  open() {
    addClass(this.modal, 'active');
    setStyle(this.body, 'overflow', 'hidden');
  }

  /**
   * Close modal
   */
  close() {
    removeClass(this.modal, 'active');
    setStyle(this.body, 'overflow', '');
  }
}

export default ComingSoonModal;
