/**
 * Schools Map
 *
 * An interactive map of the schools using NOVAR, driven entirely by
 * `AppConfig.schools` — adding a school is one entry in that array.
 *
 * Leaflet is loaded lazily, only once the map scrolls into view. A large
 * share of this audience is on metered mobile data, so a visitor who never
 * reaches the About section never pays for the library.
 */

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.css`;
const LEAFLET_JS = `https://cdnjs.cloudflare.com/ajax/libs/leaflet/${LEAFLET_VERSION}/leaflet.min.js`;

// Standard OpenStreetMap tiles: no API key, no billing. CARTO's basemaps
// now watermark every tile with "API KEY REQUIRED", so they are not usable
// unkeyed. A muted tone is applied in CSS instead.
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

class SchoolsMap {
  constructor() {
    this.el = document.getElementById('schools-map');
    if (!this.el) return;

    const config = window.AppConfig || {};
    this.schools = Array.isArray(config.schools) ? config.schools : [];
    this.mapConfig = config.map || {};
    this.impact = config.impact || {};

    this.renderStats();

    if (!this.schools.length) {
      this.showFallback('No school locations are configured yet.');
      return;
    }

    this.observe();
  }

  /** Stats above the map. School count derives from the pins, so they agree. */
  renderStats() {
    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el && value !== undefined && value !== null) el.textContent = value;
    };
    set('stat-schools', String(this.schools.length));
    set('stat-learners', this.impact.learnersReached);
    set('stat-passrate', this.impact.improvedPassRate);
  }

  observe() {
    if (!('IntersectionObserver' in window)) {
      this.load();
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        this.load();
      }
    }, { rootMargin: '300px' });
    io.observe(this.el);
  }

  async load() {
    try {
      await this.injectLeaflet();
      this.init();
    } catch (error) {
      console.error('Schools map failed to load:', error);
      this.showFallback(this.schoolsSentence());
    }
  }

  /** A readable sentence for when the map cannot render at all. */
  schoolsSentence() {
    const list = this.schools.map((s) => `${s.name} (${s.area})`).join(', ');
    return `NOVAR is used at ${list}.`;
  }

  showFallback(text) {
    this.el.innerHTML = `<p class="impact-map-fallback">${text}</p>`;
  }

  injectLeaflet() {
    if (window.L) return Promise.resolve();

    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      // Insert ahead of main.css so the site's own pin styles win ties;
      // appended to <head> Leaflet would load last and override them.
      const siteCss = document.querySelector('link[href*="css/main.css"]');
      if (siteCss && siteCss.parentNode) siteCss.parentNode.insertBefore(link, siteCss);
      else document.head.appendChild(link);
    }

    let script = document.querySelector(`script[src="${LEAFLET_JS}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = LEAFLET_JS;
      script.async = true;
      document.head.appendChild(script);
    }

    return new Promise((resolve, reject) => {
      script.addEventListener('load', () => (window.L ? resolve() : reject(new Error('Leaflet loaded but L is missing'))));
      script.addEventListener('error', () => reject(new Error('Could not load Leaflet')));
    });
  }

  init() {
    const L = window.L;
    const center = this.mapConfig.center || [this.schools[0].lat, this.schools[0].lng];

    this.map = L.map(this.el, {
      center,
      zoom: this.mapConfig.zoom || 12,
      minZoom: this.mapConfig.minZoom || 4,
      maxZoom: this.mapConfig.maxZoom || 17,
      scrollWheelZoom: false,   // don't hijack the page scroll
      attributionControl: true
    });

    // Wheel-zoom only once the map has focus, so scrolling past it works.
    this.map.on('click', () => this.map.scrollWheelZoom.enable());
    this.map.on('mouseout', () => this.map.scrollWheelZoom.disable());

    L.tileLayer(TILES, { attribution: ATTRIBUTION, maxZoom: 19 }).addTo(this.map);

    const markers = this.schools.map((school) => this.addSchool(L, school));

    // Frame every pin once there is more than one.
    if (markers.length > 1) {
      this.map.fitBounds(L.featureGroup(markers).getBounds().pad(0.25));
    }
  }

  addSchool(L, school) {
    const logo = school.logo
      ? `<img src="${school.logo}" alt="" class="school-pin-logo">`
      : '<span class="school-pin-dot"></span>';

    const icon = L.divIcon({
      className: 'school-pin',
      html: `<span class="school-pin-inner">${logo}</span>`,
      iconSize: [46, 46],
      iconAnchor: [23, 46],
      popupAnchor: [0, -44]
    });

    const approximate = school.confirmed === false
      ? '<span class="school-popup-note">Location approximate</span>'
      : '';

    return L.marker([school.lat, school.lng], { icon, title: school.name, alt: school.name })
      .addTo(this.map)
      .bindPopup(
        `<span class="school-popup-name">${school.name}</span>` +
        `<span class="school-popup-area">${school.area}</span>` +
        approximate
      );
  }
}

export default SchoolsMap;
