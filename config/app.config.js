/**
 * Application Configuration
 * Centralized configuration for the NOVAR Web application
 */
const AppConfig = {
  // Contact Information
  contact: {
    email: 'support@novarapp.com',
    phone: '+27634888362',
    phoneDisplay: '+27 (63) 488-8362',
    phoneDisplay2: '+27 (78) 127-1344',
    whatsapp: '27634888362' // No + or spaces for WhatsApp link
  },

  // App Store Links
  appStore: {
    ios: {
      enabled: false, // Set to true when iOS app is available
      url: 'https://apps.apple.com/app/novar'
    },
    android: {
      enabled: true,
      url: 'https://play.google.com/store/apps/details?id=com.k2024009747.novar&hl=en_ZA'
    }
  },

  // Animation Settings
  animation: {
    scrollThreshold: 0.1,
    scrollMargin: '0px 0px -50px 0px',
    backToTopThreshold: 300
  },

  // Navigation Settings
  navigation: {
    offsetTop: 80, // Offset for smooth scroll
    mobileBreakpoint: 768
  },

  // Paystack Configuration
  paystack: {
    publicKey: 'pk_live_8ef4b153100191894aaa7e9ab4e9aca0c1ae7cd3'
  },

  // Selectors
  selectors: {
    nav: '#main-nav',
    mobileMenuButton: '#mobile-menu-button',
    mobileMenu: '#mobile-menu',
    mobileMenuOverlay: '#mobile-menu-overlay',
    backToTop: '#back-to-top',
    comingSoonModal: '#coming-soon-modal',
    closeComingSoon: '#close-coming-soon',
    iosDownloadBtn: '#ios-download-btn',
    sendEmailBtn: '#send-email-btn',
    sendWhatsAppBtn: '#send-whatsapp-btn',
    donateButton: '#donate-button'
  }
};

// Make AppConfig available globally
window.AppConfig = AppConfig;
