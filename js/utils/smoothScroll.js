/**
 * Smooth Scroll Utility
 * Provides a function to scroll smoothly to a target element
 */

import { querySelector } from './dom.js';

/**
 * Scroll smoothly to a target element
 * @param {string} targetId - The ID of the target element (including #)
 */
export function scrollToElement(targetId) {
  if (targetId === '#' || !targetId) return;
  
  const targetElement = querySelector(targetId);
  if (targetElement) {
    const offset = window.AppConfig?.navigation?.offsetTop || 80;
    window.scrollTo({
      top: targetElement.offsetTop - offset,
      behavior: 'smooth'
    });
  }
}

/**
 * Initialize smooth scrolling for anchor links
 * This version updates the hash and lets the router handle the scroll logic
 */
export function initSmoothScroll() {
  const anchors = document.querySelectorAll('a[href^="#"]');
  
  anchors.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') {
        e.preventDefault();
        return;
      }
      // We don't prevent default so the hash changes, 
      // but we add smooth scroll logic if needed here or in Router
    });
  });
}

