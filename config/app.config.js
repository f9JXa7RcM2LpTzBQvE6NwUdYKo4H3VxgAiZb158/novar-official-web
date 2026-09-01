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
      enabled: true,
      url: 'https://apps.apple.com/app/id6757470243'
    },
    android: {
      enabled: true,
      url: 'https://play.google.com/store/apps/details?id=com.k2024009747.novar&hl=en_ZA'
    },
    appGallery: {
      enabled: true,
      url: 'https://appgallery.huawei.com/app/C116705113'
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

  // Motion layer. Set `enabled: false` to switch every effect below off in
  // one place — the page falls back to its static styling with no other
  // change. Individual effects can also be toggled on their own.
  // All of it is skipped automatically under prefers-reduced-motion.
  motion: {
    enabled: true,
    tilt: true,        // hero phone leans toward the pointer
    counters: true,    // figures count up when scrolled into view
    tiles: true,       // sponsor tile grid cascades in
    magnetic: true     // primary buttons pull slightly toward the cursor
  },

  // Schools using NOVAR — add an entry here to drop a new pin on the map.
  // `confirmed: false` means the coordinates are approximate and the pin
  // renders with a "location approximate" note in its popup.
  schools: [
    {
      name: 'Alexandra Secondary School',
      area: 'Alexandra, Sandton, Johannesburg',
      lat: -26.104444,
      lng: 28.098889,
      logo: 'assets/favicon-192.png',
      confirmed: false
    }
  ],

  map: {
    center: [-26.104444, 28.098889],
    zoom: 12,
    minZoom: 4,
    maxZoom: 17
  },

  // Impact figures shown above the map. The school count is derived from
  // `schools` above, so it never drifts out of step with the pins.
  impact: {
    learnersReached: '150k+',
    improvedPassRate: '10%'
  },

  // Partner brands. Add an entry to render another logo; the grid reflows
  // on its own. `url` is optional and turns the card into a link.
  partners: [
    {
      name: 'Liberty Group SA',   // used as the logo's alt text
      logo: 'assets/liberty-logo.png?v=1',
      url: ''
    }
  ],

  // Leaderboards. `sample: true` renders a visible "Sample data" badge —
  // set it to false only once every list below holds real records.
  // Rows are deliberately anonymous: these boards concern minors and named
  // school staff, so no invented names ship here.
  leaderboards: {
    sample: false,
    // Scores stay in the data below but are not displayed. Flip to true
    // once the numbers are real and their unit is decided.
    showScores: false,
    emptyMessage: 'To be updated',
    units: { learners: '', educators: '', schools: 'pts' },
    learners: [],
    educators: [],
    schools: [
      { rank: 1, name: 'Alexandra Secondary School', detail: 'Alexandra, Sandton', score: 8940 }
    ]
  },

  // Sponsorship (sponsor-a-learner)
  sponsorship: {
    pricePerLearnerPerMonth: 199.99,
    goal: 30000,
    learnersSponsored: 0,   // update by hand as sponsorships come in
    learnersPerTile: 300,   // 100 tiles → each tile is exactly 1% of the goal
    presets: [1, 2, 5, 10]
  },

  // Selectors
  selectors: {
    nav: '#main-nav',
    sponsorButton: '#sponsor-button',
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
