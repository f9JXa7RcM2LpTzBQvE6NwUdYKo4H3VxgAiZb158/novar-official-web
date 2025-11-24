/**
 * Contact Form Module
 * Handles contact form submission via email and WhatsApp
 */

import { getElementById, addEventListener } from '../utils/dom.js';

class ContactForm {
  constructor() {
    const config = window.AppConfig || {};
    const selectors = config.selectors || {};
    this.emailButton = getElementById(selectors.sendEmailBtn || 'send-email-btn');
    this.whatsappButton = getElementById(selectors.sendWhatsAppBtn || 'send-whatsapp-btn');
    this.nameInput = getElementById('name');
    this.emailInput = getElementById('email');
    this.subjectInput = getElementById('subject');
    this.messageInput = getElementById('message');
    this.init();
  }

  /**
   * Initialize contact form
   */
  init() {
    if (!this.emailButton || !this.whatsappButton) {
      console.warn('Contact form buttons not found');
      return;
    }

    addEventListener(this.emailButton, 'click', () => this.handleEmailSubmit());
    addEventListener(this.whatsappButton, 'click', () => this.handleWhatsAppSubmit());
  }

  /**
   * Get form values
   * @returns {Object} Form data
   */
  getFormData() {
    return {
      name: this.nameInput?.value || 'User',
      email: this.emailInput?.value || '',
      subject: this.subjectInput?.value || 'Inquiry from NOVAR Web',
      message: this.messageInput?.value || ''
    };
  }

  /**
   * Handle email submission
   */
  handleEmailSubmit() {
    const { name, email, subject, message } = this.getFormData();
    const config = window.AppConfig || {};
    const contact = config.contact || {};
    const contactEmail = contact.email || 'support@novarapp.com';
    
    // Construct email body
    let emailBody = message;
    if (email) {
      emailBody = `From: ${name}${email ? ' (' + email + ')' : ''}\n\n${message}`;
    }
    
    // Create mailto link
    const mailtoLink = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  }

  /**
   * Handle WhatsApp submission
   */
  handleWhatsAppSubmit() {
    const { name, email, subject, message } = this.getFormData();
    const config = window.AppConfig || {};
    const contact = config.contact || {};
    const whatsapp = contact.whatsapp || '27634888362';
    
    // Construct WhatsApp message
    let whatsappMessage = '';
    if (subject) {
      whatsappMessage += `*${subject}*\n\n`;
    }
    if (name || email) {
      whatsappMessage += `From: ${name}${email ? ' (' + email + ')' : ''}\n\n`;
    }
    whatsappMessage += message || 'Hello, I would like to get in touch.';
    
    // Create WhatsApp link
    const whatsappLink = `https://wa.me/${whatsapp}?text=${encodeURIComponent(whatsappMessage)}`;
    window.open(whatsappLink, '_blank');
  }
}

export default ContactForm;
