/**
 * Smooth Scroll Utility
 * Handles smooth scrolling behavior for navigation links
 */

import { querySelectorAll, querySelector, addEventListener } from './dom.js';

/**
 * Initialize smooth scrolling for anchor links
 */
export function initSmoothScroll() {
  const anchors = querySelectorAll('a[href^="#"]');
  
  anchors.forEach(anchor => {
    addEventListener(anchor, 'click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
        const targetElement = querySelector(targetId);
      if (targetElement) {
        const offset = window.AppConfig?.navigation?.offsetTop || 80;
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      }
    });
  });
}
