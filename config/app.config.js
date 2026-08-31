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

  // Partner brands. Add an entry to render another card; the grid reflows
  // on its own. `line` and `url` are optional.
  partners: [
    {
      name: 'Liberty Group SA',
      logo: 'assets/liberty-logo.png?v=1',
      line: 'Backing NOVAR through the #DriveHope initiative — a R1 million commitment to keep learners learning.',
      url: ''
    }
  ],

  // Leaderboards. `sample: true` renders a visible "Sample data" badge —
  // set it to false only once every list below holds real records.
  // Rows are deliberately anonymous: these boards concern minors and named
  // school staff, so no invented names ship here.
  leaderboards: {
    sample: true,
    // Scores stay in the data below but are not displayed. Flip to true
    // once the numbers are real and their unit is decided.
    showScores: false,
    units: { learners: '', educators: '', schools: 'pts' },
    learners: [
      { rank: 1, name: 'Learner 1', detail: 'Alexandra Secondary School', score: 2480 },
      { rank: 2, name: 'Learner 2', detail: 'Alexandra Secondary School', score: 2310 },
      { rank: 3, name: 'Learner 3', detail: 'Alexandra Secondary School', score: 2150 },
      { rank: 4, name: 'Learner 4', detail: 'Alexandra Secondary School', score: 1990 },
      { rank: 5, name: 'Learner 5', detail: 'Alexandra Secondary School', score: 1870 }
    ],
    educators: [
      { rank: 1, name: 'Educator 1', detail: 'Alexandra Secondary School', score: 1640 },
      { rank: 2, name: 'Educator 2', detail: 'Alexandra Secondary School', score: 1520 },
      { rank: 3, name: 'Educator 3', detail: 'Alexandra Secondary School', score: 1410 },
      { rank: 4, name: 'Educator 4', detail: 'Alexandra Secondary School', score: 1280 },
      { rank: 5, name: 'Educator 5', detail: 'Alexandra Secondary School', score: 1150 }
    ],
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
