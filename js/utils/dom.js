/**
 * DOM Utility Functions
 * Provides helper functions for DOM manipulation
 */

/**
 * Get element by ID
 * @param {string} id - Element ID
 * @returns {HTMLElement|null}
 */
export function getElementById(id) {
  return document.getElementById(id);
}

/**
 * Query selector
 * @param {string} selector - CSS selector
 * @returns {HTMLElement|null}
 */
export function querySelector(selector) {
  return document.querySelector(selector);
}

/**
 * Query selector all
 * @param {string} selector - CSS selector
 * @returns {NodeList}
 */
export function querySelectorAll(selector) {
  return document.querySelectorAll(selector);
}

/**
 * Add event listener to element
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event type
 * @param {Function} handler - Event handler
 */
export function addEventListener(element, event, handler) {
  if (element) {
    element.addEventListener(event, handler);
  }
}

/**
 * Toggle class on element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to toggle
 */
export function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

/**
 * Add class to element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to add
 */
export function addClass(element, className) {
  if (element) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to remove
 */
export function removeClass(element, className) {
  if (element) {
    element.classList.remove(className);
  }
}

/**
 * Check if element has class
 * @param {HTMLElement} element - Target element
 * @param {string} className - Class name to check
 * @returns {boolean}
 */
export function hasClass(element, className) {
  return element ? element.classList.contains(className) : false;
}

/**
 * Set element style property
 * @param {HTMLElement} element - Target element
 * @param {string} property - CSS property
 * @param {string} value - CSS value
 */
export function setStyle(element, property, value) {
  if (element) {
    element.style[property] = value;
  }
}


