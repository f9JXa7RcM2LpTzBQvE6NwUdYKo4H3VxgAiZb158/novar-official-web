/**
 * Donation Module
 * Handles donation functionality using Paystack payment gateway
 */

import { getElementById, addEventListener, querySelector } from '../utils/dom.js';

class Donation {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    this.selectors = selectors;
    
    // Helper to strip # from selector if present
    const getId = (selector) => {
      if (!selector) return null;
      return selector.startsWith('#') ? selector.substring(1) : selector;
    };
    
    this.donateButton = getElementById(getId(selectors.donateButton) || 'donate-button');
    this.amountInput = getElementById('donation-amount');
    this.customAmountInput = getElementById('custom-amount');
    this.emailInput = getElementById('donation-email');
    this.nameInput = getElementById('donation-name');
    this.presetButtons = querySelector('.preset-amounts');
    this.paystackPublicKey = config.paystack?.publicKey || '';
    
    console.log('Donation module initialized', {
      donateButton: !!this.donateButton,
      paystackKey: this.paystackPublicKey ? 'configured' : 'not configured'
    });
    
    this.init();
  }

  /**
   * Initialize donation module
   */
  init() {
    // Check if Paystack key is configured (not placeholder)
    const isPlaceholder = !this.paystackPublicKey || 
                         this.paystackPublicKey.includes('YOUR_PUBLIC_KEY') ||
                         this.paystackPublicKey.trim() === '';
    
    if (isPlaceholder) {
      console.warn('Paystack public key not configured. Please add your Paystack public key in config/app.config.js');
      // Still setup the button to show an error message
      if (this.donateButton) {
        addEventListener(this.donateButton, 'click', () => {
          alert('Paystack is not configured. Please contact the administrator.');
        });
      }
      return;
    }

    // Load Paystack inline script if not already loaded
    this.loadPaystackScript();

    // Setup preset amount buttons
    this.setupPresetAmounts();

    // Setup custom amount input
    if (this.customAmountInput) {
      addEventListener(this.customAmountInput, 'input', () => this.handleCustomAmount());
      addEventListener(this.customAmountInput, 'focus', () => this.handleCustomAmountFocus());
    }

    // Setup donate button
    if (this.donateButton) {
      addEventListener(this.donateButton, 'click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleDonation();
      });
    } else {
      console.error('Donate button not found. Selector:', this.selectors?.donateButton || 'donate-button');
    }

    // Prevent form submission
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
      addEventListener(donationForm, 'submit', (e) => {
        e.preventDefault();
        this.handleDonation();
      });
    }
  }

  /**
   * Load Paystack inline script
   */
  loadPaystackScript() {
    if (window.PaystackPop) {
      return; // Already loaded
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      console.log('Paystack script loaded');
    };
    script.onerror = () => {
      console.error('Failed to load Paystack script');
    };
    document.head.appendChild(script);
  }

  /**
   * Setup preset amount buttons
   */
  setupPresetAmounts() {
    if (!this.presetButtons) return;

    const buttons = this.presetButtons.querySelectorAll('button[data-amount]');
    buttons.forEach(button => {
      addEventListener(button, 'click', () => {
        const amount = button.getAttribute('data-amount');
        this.selectPresetAmount(amount);
      });
    });
  }

  /**
   * Select preset amount
   * @param {string} amount - Amount in ZAR
   */
  selectPresetAmount(amount) {
    if (this.amountInput) {
      this.amountInput.value = amount;
    }
    if (this.customAmountInput) {
      this.customAmountInput.value = '';
    }

    // Update active state
    const buttons = this.presetButtons?.querySelectorAll('button[data-amount]');
    buttons?.forEach(btn => {
      if (btn.getAttribute('data-amount') === amount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /**
   * Handle custom amount input
   */
  handleCustomAmount() {
    const value = this.customAmountInput.value;
    if (value) {
      // Remove active state from preset buttons
      const buttons = this.presetButtons?.querySelectorAll('button[data-amount]');
      buttons?.forEach(btn => btn.classList.remove('active'));

      // Update amount input
      if (this.amountInput) {
        this.amountInput.value = value;
      }
    }
  }

  /**
   * Handle custom amount focus
   */
  handleCustomAmountFocus() {
    // Clear preset selection when custom amount is focused
    const buttons = this.presetButtons?.querySelectorAll('button[data-amount]');
    buttons?.forEach(btn => btn.classList.remove('active'));
  }

  /**
   * Validate donation form
   * @returns {boolean} True if valid
   */
  validateForm() {
    const amount = this.amountInput?.value || this.customAmountInput?.value;
    const email = this.emailInput?.value;
    const name = this.nameInput?.value;

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid donation amount');
      return false;
    }

    if (!email || !this.isValidEmail(email)) {
      alert('Please enter a valid email address');
      this.emailInput?.focus();
      return false;
    }

    if (!name || name.trim().length < 2) {
      alert('Please enter your name');
      this.nameInput?.focus();
      return false;
    }

    return true;
  }

  /**
   * Validate email format
   * @param {string} email - Email address
   * @returns {boolean} True if valid
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Handle donation button click
   */
  handleDonation() {
    console.log('Donate button clicked');
    
    if (!this.validateForm()) {
      return;
    }

    const amount = parseFloat(this.amountInput?.value || this.customAmountInput?.value) * 100; // Convert to kobo (cents)
    const email = this.emailInput?.value;
    const name = this.nameInput?.value;

    console.log('Processing payment:', { amount, email, name });

    // Wait for Paystack to be available
    if (!window.PaystackPop) {
      console.log('Paystack not loaded yet, waiting...');
      // Try loading again
      this.loadPaystackScript();
      setTimeout(() => {
        if (window.PaystackPop) {
          this.processPayment(amount, email, name);
        } else {
          alert('Payment system is loading. Please try again in a moment.');
        }
      }, 1000);
    } else {
      this.processPayment(amount, email, name);
    }
  }

  /**
   * Process payment with Paystack
   * @param {number} amount - Amount in kobo (cents)
   * @param {string} email - Donor email
   * @param {string} name - Donor name
   */
  processPayment(amount, email, name) {
    if (!window.PaystackPop) {
      alert('Payment system is loading. Please try again in a moment.');
      return;
    }

    const isPlaceholder = !this.paystackPublicKey || 
                         this.paystackPublicKey.includes('YOUR_PUBLIC_KEY') ||
                         this.paystackPublicKey.trim() === '';
    
    if (isPlaceholder) {
      alert('Paystack is not properly configured. Please contact the administrator.');
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: this.paystackPublicKey,
        email: email,
        amount: amount,
        currency: 'ZAR',
        ref: `NOVAR_${Date.now()}`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Donor Name',
              variable_name: 'donor_name',
              value: name
            }
          ]
        },
        callback: (response) => {
          console.log('Payment callback:', response);
          this.handlePaymentSuccess(response);
        },
        onClose: () => {
          console.log('Payment window closed');
          this.handlePaymentClose();
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing your payment. Please try again.');
    }
  }

  /**
   * Handle successful payment
   * @param {Object} response - Paystack response
   */
  handlePaymentSuccess(response) {
    console.log('Payment successful:', response);
    
    // Show success message
    alert('Thank you for your donation! Your support helps us continue providing quality education.');
    
    // Reset form
    this.resetForm();
    
    // Optional: Send confirmation or track donation
    // You can add analytics or backend notification here
  }

  /**
   * Handle payment close
   */
  handlePaymentClose() {
    console.log('Payment window closed');
  }

  /**
   * Reset donation form
   */
  resetForm() {
    if (this.amountInput) this.amountInput.value = '';
    if (this.customAmountInput) this.customAmountInput.value = '';
    if (this.emailInput) this.emailInput.value = '';
    if (this.nameInput) this.nameInput.value = '';

    // Clear preset button states
    const buttons = this.presetButtons?.querySelectorAll('button[data-amount]');
    buttons?.forEach(btn => btn.classList.remove('active'));
  }
}

export default Donation;

