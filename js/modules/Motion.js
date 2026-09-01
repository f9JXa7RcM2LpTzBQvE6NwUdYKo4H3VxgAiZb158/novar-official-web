/**
 * Motion
 *
 * The page's motion layer, gated behind `AppConfig.motion`. Nothing here
 * runs — and `motion-on` is never added — when `enabled` is false or the
 * visitor has asked for reduced motion, so the page falls back to its
 * static styling with no other change.
 *
 * Deliberately CSS-driven: this module only writes custom properties and
 * toggles classes. No animation library, no per-frame layout work.
 */

const LOCALE = 'en-ZA';

class Motion {
  constructor() {
    const config = window.AppConfig || {};
    this.settings = config.motion || {};

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.settings.enabled !== true || reduced) return;

    document.documentElement.classList.add('motion-on');

    if (this.settings.tilt !== false) this.initTilt();
    if (this.settings.counters !== false) this.initCounters();
    if (this.settings.tiles !== false) this.initTiles();
    if (this.settings.magnetic !== false) this.initMagnetic();
    this.initBoardRows();
  }

  /** Pointer devices only — a tilt that never fires just costs listeners. */
  get finePointer() {
    return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  // ---------- hero phone ----------

  initTilt() {
    const inner = document.querySelector('.phone-mockup-inner');
    const hero = document.getElementById('download');
    if (!inner || !hero || !this.finePointer) return;

    const MAX = 9;   // degrees
    let frame = null;

    hero.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const r = hero.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;   // -0.5 … 0.5
        const ny = (e.clientY - r.top) / r.height - 0.5;
        inner.classList.add('is-tracking');
        inner.style.setProperty('--tilt-y', `${(nx * MAX * 2).toFixed(2)}deg`);
        inner.style.setProperty('--tilt-x', `${(-ny * MAX).toFixed(2)}deg`);
        inner.style.setProperty('--tilt-lift', '18px');
      });
    });

    hero.addEventListener('pointerleave', () => {
      inner.classList.remove('is-tracking');
      inner.style.setProperty('--tilt-y', '0deg');
      inner.style.setProperty('--tilt-x', '0deg');
      inner.style.setProperty('--tilt-lift', '0px');
    });
  }

  // ---------- counting figures ----------

  /**
   * Splits rendered text into a prefix, a number and a suffix so "150k+"
   * and "10%" animate their number without losing their unit.
   * @param {string} text
   */
  static parseFigure(text) {
    const m = String(text).match(/^(\D*?)([\d][\d\s .,]*)(.*)$/);
    if (!m) return null;
    const raw = m[2];
    const clean = raw.replace(/[\s ,]/g, '');
    const value = parseFloat(clean);
    if (!Number.isFinite(value)) return null;
    const dot = clean.indexOf('.');
    return {
      prefix: m[1],
      suffix: m[3],
      value,
      decimals: dot === -1 ? 0 : clean.length - dot - 1,
      grouped: /[\s ,]/.test(raw)
    };
  }

  initCounters() {
    // Figures that are written once at load. The sponsor total is left out
    // deliberately: it changes on every click, and animating it would make
    // the form feel laggy rather than alive.
    const ids = [
      'stat-schools', 'stat-learners', 'stat-passrate',
      'sponsor-progress-count', 'sponsor-progress-pct', 'sponsor-progress-remaining'
    ];

    const targets = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map((el) => ({ el, figure: Motion.parseFigure(el.textContent) }))
      .filter((t) => t.figure);

    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) return;   // leave final values in place

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        const t = targets.find((x) => x.el === entry.target);
        if (t) this.countUp(t.el, t.figure);
      });
    }, { threshold: 0.4 });

    targets.forEach((t) => {
      t.el.classList.add('is-counting');
      io.observe(t.el);
    });
  }

  countUp(el, figure, duration = 1100) {
    const { prefix, suffix, value, decimals, grouped } = figure;
    if (value === 0) return;   // nothing to count to

    const format = (n) => {
      const fixed = n.toFixed(decimals);
      const out = grouped
        ? Number(fixed).toLocaleString(LOCALE, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          })
        : fixed;
      return `${prefix}${out}${suffix}`;
    };

    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);   // ease-out cubic
      el.textContent = format(value * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = format(value);    // land exactly on the real value
    };

    el.textContent = format(0);
    requestAnimationFrame(step);
  }

  // ---------- sponsor tile grid ----------

  initTiles() {
    const grid = document.getElementById('sponsor-tiles');
    if (!grid) return;

    const stagger = () => {
      Array.from(grid.children).forEach((tile, i) => {
        tile.style.setProperty('--i', String(i));
      });
    };
    stagger();

    if (!('IntersectionObserver' in window)) {
      grid.classList.add('is-revealed');
      return;
    }

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        stagger();                       // in case the grid re-rendered
        grid.classList.add('is-revealed');
      }
    }, { threshold: 0.15 });
    io.observe(grid);
  }

  // ---------- magnetic buttons ----------

  initMagnetic() {
    if (!this.finePointer) return;

    const selectors = ['.sponsor-submit', '.sponsor-donate', '.hero-cta-btn', '.nav-pill-btn-primary'];
    const buttons = selectors.flatMap((s) => Array.from(document.querySelectorAll(s)));
    const STRENGTH = 0.28;
    const MAX = 6;   // px

    buttons.forEach((btn) => {
      btn.classList.add('is-magnetic');
      let frame = null;

      btn.addEventListener('pointermove', (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = null;
          const r = btn.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
          const dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
          btn.classList.add('is-pulling');
          btn.style.setProperty('--mag-x', `${Math.max(-MAX, Math.min(MAX, dx)).toFixed(1)}px`);
          btn.style.setProperty('--mag-y', `${Math.max(-MAX, Math.min(MAX, dy)).toFixed(1)}px`);
        });
      });

      btn.addEventListener('pointerleave', () => {
        btn.classList.remove('is-pulling');
        btn.style.setProperty('--mag-x', '0px');
        btn.style.setProperty('--mag-y', '0px');
      });
    });
  }

  // ---------- leaderboard rows ----------

  /** Indexes rows so the CSS can stagger them, including after a tab change. */
  initBoardRows() {
    const board = document.querySelector('.board');
    if (!board) return;

    const index = () => {
      board.querySelectorAll('.board-panel').forEach((panel) => {
        panel.querySelectorAll('.board-row').forEach((row, i) => {
          row.style.setProperty('--i', String(i));
        });
      });
    };
    index();

    board.querySelectorAll('.board-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const panel = board.querySelector('.board-panel:not([hidden])');
        if (!panel) return;
        // Re-trigger the row animation on the newly shown panel.
        panel.querySelectorAll('.board-row').forEach((row) => {
          row.style.animation = 'none';
          void row.offsetWidth;
          row.style.animation = '';
        });
      });
    });
  }
}

export default Motion;
