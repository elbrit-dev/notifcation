/**
 * DOM utility functions to help prevent hydration and DOM access errors
 */

/**
 * Check if the DOM is fully ready and accessible
 * @returns {boolean} True if DOM is ready
 */
export const isDOMReady = () => {
  if (typeof window === 'undefined') return false;
  if (!window.document) return false;
  if (!window.document.body) return false;
  if (!window.document.documentElement) return false;
  return true;
};

/**
 * Wait for DOM to be ready with a timeout
 * @param {number} timeout - Maximum time to wait in milliseconds
 * @returns {Promise<boolean>} Promise that resolves when DOM is ready
 */
export const waitForDOMReady = (timeout = 5000) => {
  return new Promise((resolve) => {
    if (isDOMReady()) {
      resolve(true);
      return;
    }

    const startTime = Date.now();
    
    const checkDOM = () => {
      if (isDOMReady()) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime > timeout) {
        console.warn('DOM ready timeout exceeded');
        resolve(false);
        return;
      }
      
      // Check again in 100ms
      setTimeout(checkDOM, 100);
    };
    
    checkDOM();
  });
};

/**
 * Safely access a DOM element property with fallback
 * @param {Element|Node|null} element - The DOM element
 * @param {string} property - The property to access
 * @param {*} fallback - Fallback value if property access fails
 * @returns {*} The property value or fallback
 */
export const safeDOMProperty = (element, property, fallback = null) => {
  try {
    if (!element) return fallback;
    if (typeof element[property] === 'undefined') return fallback;
    return element[property];
  } catch (error) {
    console.warn(`Failed to access DOM property '${property}':`, error);
    return fallback;
  }
};

/**
 * Safely call a DOM method with error handling
 * @param {Element|Node|null} element - The DOM element
 * @param {string} method - The method to call
 * @param {Array} args - Arguments to pass to the method
 * @param {*} fallback - Fallback value if method call fails
 * @returns {*} The method result or fallback
 */
export const safeDOMMethod = (element, method, args = [], fallback = null) => {
  try {
    if (!element) return fallback;
    if (typeof element[method] !== 'function') return fallback;
    return element[method](...args);
  } catch (error) {
    console.warn(`Failed to call DOM method '${method}':`, error);
    return fallback;
  }
};

/**
 * Check if an element is a valid DOM node
 * @param {*} element - The element to check
 * @returns {boolean} True if it's a valid DOM node
 */
export const isValidDOMNode = (element) => {
  try {
    return element && 
           typeof element === 'object' && 
           element.nodeType !== undefined &&
           element.nodeType !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Safely get the parent node of an element
 * @param {Element|Node|null} element - The DOM element
 * @returns {Element|Node|null} The parent node or null
 */
export const safeParentNode = (element) => {
  try {
    if (!isValidDOMNode(element)) return null;
    return safeDOMProperty(element, 'parentNode', null);
  } catch (error) {
    console.warn('Failed to get parent node:', error);
    return null;
  }
};

/**
 * Safely get child nodes of an element
 * @param {Element|Node|null} element - The DOM element
 * @returns {NodeList|Array} The child nodes or empty array
 */
export const safeChildNodes = (element) => {
  try {
    if (!isValidDOMNode(element)) return [];
    return safeDOMProperty(element, 'childNodes', []);
  } catch (error) {
    console.warn('Failed to get child nodes:', error);
    return [];
  }
};

/**
 * Debounce function for DOM operations
 * @param {Function} func - The function to debounce
 * @param {number} wait - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function for DOM operations
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 * @returns {Function} The throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Create a safe wrapper for DOM operations
 * @param {Function} operation - The DOM operation to perform
 * @param {*} fallback - Fallback value if operation fails
 * @returns {Function} The safe wrapper function
 */
export const createSafeDOMWrapper = (operation, fallback = null) => {
  return (...args) => {
    try {
      if (!isDOMReady()) {
        console.warn('DOM not ready, deferring operation');
        return fallback;
      }
      return operation(...args);
    } catch (error) {
      console.warn('DOM operation failed:', error);
      return fallback;
    }
  };
};
