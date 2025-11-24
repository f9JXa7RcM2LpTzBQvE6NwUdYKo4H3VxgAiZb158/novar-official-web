# NOVAR Web - Clean Architecture

A modern, scalable educational platform website built with clean code principles and modular architecture.

## 📁 Project Structure

```
novar web/
├── assets/                 # Static assets (images, logos, etc.)
│   └── NOVAR logo.jpeg
├── config/                 # Configuration files
│   └── app.config.js      # Centralized app configuration
├── css/                   # Stylesheets
│   └── main.css          # Main stylesheet with all custom styles
├── js/                    # JavaScript modules
│   ├── main.js           # Application entry point
│   ├── modules/          # Feature modules
│   │   ├── BackToTop.js
│   │   ├── ComingSoonModal.js
│   │   ├── ContactForm.js
│   │   ├── MobileMenu.js
│   │   ├── Navigation.js
│   │   └── ScrollAnimations.js
│   └── utils/            # Utility functions
│       ├── dom.js        # DOM manipulation utilities
│       └── smoothScroll.js
├── index.html            # Main HTML file
└── README.md             # This file
```

## 🏗️ Architecture Principles

### 1. **Separation of Concerns**
- **HTML**: Structure and content only
- **CSS**: All styling in external stylesheet
- **JavaScript**: Modular, feature-based organization

### 2. **Modular Design**
- Each feature is a self-contained module
- Modules are independent and reusable
- Clear interfaces between modules

### 3. **Configuration Management**
- Centralized configuration in `config/app.config.js`
- Easy to update contact info, selectors, and settings
- No hardcoded values in modules

### 4. **Utility Functions**
- Reusable DOM manipulation functions
- DRY (Don't Repeat Yourself) principle
- Consistent API across the codebase

## 📦 Modules

### Core Modules

#### `MobileMenu.js`
Handles mobile menu toggle, animations, and navigation link behavior.

#### `Navigation.js`
Manages navigation bar styling and scroll behavior.

#### `ScrollAnimations.js`
Implements scroll-triggered animations using Intersection Observer API.

#### `BackToTop.js`
Controls the back-to-top button visibility and functionality.

#### `ComingSoonModal.js`
Manages the "Coming Soon" modal for iOS app download.

#### `ContactForm.js`
Handles contact form submission via email and WhatsApp.

### Utility Modules

#### `dom.js`
Provides helper functions for DOM manipulation:
- `getElementById()`
- `querySelector()`
- `addEventListener()`
- `toggleClass()`, `addClass()`, `removeClass()`
- `setStyle()`

#### `smoothScroll.js`
Implements smooth scrolling for anchor links.

## ⚙️ Configuration

All configuration is centralized in `config/app.config.js`:

```javascript
const AppConfig = {
  contact: {
    email: 'support@novarapp.com',
    phone: '+27634888362',
    whatsapp: '27634888362'
  },
  animation: {
    scrollThreshold: 0.1,
    backToTopThreshold: 300
  },
  navigation: {
    offsetTop: 80,
    mobileBreakpoint: 768
  },
  selectors: {
    // All DOM selectors
  }
};
```

## 🚀 Getting Started

1. **Open the project**: Simply open `index.html` in a web browser
2. **No build step required**: The project uses ES6 modules natively
3. **Development**: Edit files directly and refresh the browser

## 🔧 Customization

### Adding a New Feature

1. Create a new module in `js/modules/YourModule.js`
2. Follow the existing module pattern:
   ```javascript
   class YourModule {
     constructor() {
       this.init();
     }
     init() {
       // Initialization code
     }
   }
   export default YourModule;
   ```
3. Import and initialize in `js/main.js`

### Updating Styles

- All custom styles are in `css/main.css`
- Organized by section with clear comments
- Follow existing naming conventions

### Modifying Configuration

- Edit `config/app.config.js`
- All modules automatically use the updated configuration
- No need to modify individual modules

## 📝 Code Quality

### Best Practices Implemented

- ✅ **Single Responsibility Principle**: Each module has one clear purpose
- ✅ **DRY (Don't Repeat Yourself)**: Reusable utilities and functions
- ✅ **Separation of Concerns**: HTML, CSS, and JS are separated
- ✅ **Modularity**: Features are independent and testable
- ✅ **Configuration Management**: Centralized settings
- ✅ **Documentation**: JSDoc comments on all functions
- ✅ **Error Handling**: Graceful fallbacks for missing elements
- ✅ **Accessibility**: ARIA labels and semantic HTML

## 🌐 Browser Support

- Modern browsers with ES6 module support
- Intersection Observer API (with fallback)
- CSS Grid and Flexbox
- CSS Custom Properties

## 📄 License

© 2025 NOVAR Web. All rights reserved.

## 🤝 Contributing

When adding new features:
1. Follow the existing module structure
2. Add JSDoc comments
3. Update this README if needed
4. Test across different browsers
5. Ensure mobile responsiveness

