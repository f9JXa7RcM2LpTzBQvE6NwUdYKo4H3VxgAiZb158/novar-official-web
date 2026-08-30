/**
 * Paystack helpers shared by the donation and sponsorship flows.
 */

const PAYSTACK_SRC = 'https://js.paystack.co/v1/inline.js';

/**
 * @param {string} key
 * @returns {boolean} false for empty keys and the placeholder shipped in config
 */
export function isKeyConfigured(key) {
  return Boolean(key) && !key.includes('YOUR_PUBLIC_KEY') && key.trim() !== '';
}

/**
 * Loads the Paystack inline script once, reusing an in-flight tag if another
 * module already started it.
 * @returns {Promise<object>} resolves with window.PaystackPop
 */
export function loadPaystackScript() {
  if (window.PaystackPop) {
    return Promise.resolve(window.PaystackPop);
  }

  let script = document.querySelector(`script[src="${PAYSTACK_SRC}"]`);
  if (!script) {
    script = document.createElement('script');
    script.src = PAYSTACK_SRC;
    script.async = true;
    document.head.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    script.addEventListener('load', () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error('Paystack loaded but PaystackPop is missing'));
    });
    script.addEventListener('error', () =>
      reject(new Error('Failed to load the Paystack script'))
    );
  });
}

/**
 * Opens the Paystack checkout modal.
 * @param {object} options
 * @param {string} options.key Paystack public key
 * @param {string} options.email
 * @param {number} options.amount Amount in cents
 * @param {string} options.reference
 * @param {object} [options.metadata]
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onClose]
 * @returns {Promise<void>}
 */
export async function openCheckout({
  key,
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose
}) {
  await loadPaystackScript();

  const handler = window.PaystackPop.setup({
    key,
    email,
    amount,
    currency: 'ZAR',
    ref: reference,
    metadata: metadata || {},
    callback: (response) => {
      if (onSuccess) onSuccess(response);
    },
    onClose: () => {
      if (onClose) onClose();
    }
  });

  handler.openIframe();
}
