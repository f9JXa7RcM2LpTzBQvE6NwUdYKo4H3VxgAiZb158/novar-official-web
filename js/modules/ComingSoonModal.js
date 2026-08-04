/**
 * Coming Soon Modal Module
 * Handles the "Coming Soon" modal for iOS app download
 */

import { getElementById, addClass, removeClass, setStyle, addEventListener } from '../utils/dom.js';

class ComingSoonModal {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    this.iosStoreConfig = (config.appStore && config.appStore.ios) || {};
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
    if (!this.iosButton) {
      console.warn('iOS download button not found');
      return;
    }

    // Open App Store link when available, otherwise show "coming soon" modal.
    addEventListener(this.iosButton, 'click', () => {
      const { enabled, url } = this.iosStoreConfig;
      if (enabled && url) {
        window.location.href = url;
        return;
      }
      this.open();
    });

    if (this.modal && this.closeButton) {
      // Close modal when close button is clicked
      addEventListener(this.closeButton, 'click', () => this.close());

      // Close modal when clicking outside
      addEventListener(this.modal, 'click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }
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
