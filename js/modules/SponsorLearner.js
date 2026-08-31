/**
 * Sponsor a Learner
 * Quantity-based sponsorship: R10.81 per learner per month, charged upfront
 * for the months remaining until December.
 */

import {
  PRICE_PER_LEARNER_PER_MONTH,
  monthsUntilDecember,
  calculateTotal,
  toCents,
  isValidLearnerCount
} from '../utils/sponsorshipPricing.js';
import { isKeyConfigured, openCheckout } from '../utils/paystack.js';

const LOCALE = 'en-ZA';

class SponsorLearner {
  constructor() {
    const config = window.AppConfig || {};
    this.settings = config.sponsorship || {};
    this.pricePerMonth = this.settings.pricePerLearnerPerMonth || PRICE_PER_LEARNER_PER_MONTH;
    this.goal = this.settings.goal || 0;
    this.sponsored = this.settings.learnersSponsored || 0;
    this.learnersPerTile = this.settings.learnersPerTile || 100;
    this.paystackPublicKey = config.paystack?.publicKey || '';

    this.form = document.getElementById('sponsor-form');
    if (!this.form) return;

    this.quantities = document.getElementById('sponsor-quantities');
    this.customInput = document.getElementById('sponsor-custom-quantity');
    this.amountInput = document.getElementById('sponsor-amount');
    this.totalEl = document.getElementById('sponsor-total');
    this.breakdownEl = document.getElementById('sponsor-breakdown');
    this.nameInput = document.getElementById('sponsor-name');
    this.emailInput = document.getElementById('sponsor-email');
    this.button = document.getElementById('sponsor-button');

    this.months = monthsUntilDecember(new Date());
    this.learnerCount = 1;
    this.mode = 'sponsor';   // 'sponsor' = N learners, 'amount' = free-form gift

    this.init();
  }

  init() {
    this.quantities?.querySelectorAll('button[data-learners]').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.setCount(parseInt(btn.getAttribute('data-learners'), 10), { fromPreset: true });
      });
    });

    this.customInput?.addEventListener('input', () => {
      const raw = this.customInput.value;
      if (raw === '') return;
      if (isValidLearnerCount(raw)) this.setCount(parseInt(raw, 10), { fromPreset: false });
    });

    this.amountInput?.addEventListener('input', () => {
      const raw = this.amountInput.value;
      if (raw === '' || Number(raw) <= 0) {
        this.mode = 'sponsor';
        this.setCount(this.learnerCount, { fromPreset: true });
        return;
      }
      this.mode = 'amount';
      if (this.customInput) this.customInput.value = '';
      this.quantities?.querySelectorAll('button[data-learners]')
        .forEach((btn) => btn.classList.remove('active'));
      this.renderTotal();
    });

    this.button?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSponsor();
    });

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSponsor();
    });

    this.setCount(1, { fromPreset: true });
    this.renderProgress();
  }

  /**
   * @param {number} count
   * @param {{fromPreset: boolean}} options
   */
  setCount(count, { fromPreset }) {
    this.learnerCount = count;
    this.mode = 'sponsor';
    if (this.amountInput) this.amountInput.value = '';

    this.quantities?.querySelectorAll('button[data-learners]').forEach((btn) => {
      const matches = fromPreset && parseInt(btn.getAttribute('data-learners'), 10) === count;
      btn.classList.toggle('active', matches);
    });

    if (fromPreset && this.customInput) this.customInput.value = '';

    this.renderTotal();
  }

  /** @returns {number} the amount to charge, in rands, for the active mode */
  currentTotal() {
    if (this.mode === 'amount') return Number(this.amountInput?.value) || 0;
    return calculateTotal(this.learnerCount, new Date(), this.pricePerMonth);
  }

  renderTotal() {
    const total = this.currentTotal();
    if (this.totalEl) this.totalEl.textContent = `R${total.toFixed(2)}`;

    if (this.breakdownEl) {
      if (this.mode === 'amount') {
        this.breakdownEl.textContent = 'One-off gift to NOVAR';
      } else {
        const learnerWord = this.learnerCount === 1 ? 'learner' : 'learners';
        const monthWord = this.months === 1 ? 'month' : 'months';
        this.breakdownEl.textContent =
          `${this.learnerCount} ${learnerWord} × ${this.months} ${monthWord} to December`;
      }
    }

    if (this.button) {
      this.button.textContent = this.mode === 'amount' ? 'Give →' : 'Sponsor a learner →';
    }
  }

  renderProgress() {
    const panel = document.querySelector('.sponsor-progress');

    // A stale cached config leaves `sponsorship` undefined, which would render
    // a meaningless "0 of 0" panel with no tiles. Hide it rather than lie.
    if (!this.goal) {
      if (panel) panel.hidden = true;
      console.warn('Sponsorship config missing — progress panel hidden.');
      return;
    }
    if (panel) panel.hidden = false;

    const pct = Math.min(100, (this.sponsored / this.goal) * 100);
    const remaining = Math.max(0, this.goal - this.sponsored);

    const set = (id, value) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    };
    set('sponsor-progress-pct', pct.toFixed(1));
    set('sponsor-progress-count', this.sponsored.toLocaleString(LOCALE));
    set('sponsor-progress-goal', this.goal.toLocaleString(LOCALE));
    set('sponsor-progress-remaining', remaining.toLocaleString(LOCALE));

    const tilesEl = document.getElementById('sponsor-tiles');
    if (!tilesEl) return;

    // One tile per `learnersPerTile`; at 300 per tile against a 30 000 goal
    // that is 100 tiles, so each tile is exactly 1%.
    const tileCount = Math.round(this.goal / this.learnersPerTile);
    const filled = Math.min(tileCount, Math.floor(this.sponsored / this.learnersPerTile));

    tilesEl.innerHTML = Array.from({ length: tileCount }, (_, i) => {
      let cls = 'sponsor-tile';
      if (i < filled) cls += ' is-filled';
      else if (i === filled) cls += ' is-next';   // the next tile to fund
      return `<span class="${cls}"></span>`;
    }).join('');
  }

  validate() {
    if (this.mode === 'amount') {
      if (!(Number(this.amountInput?.value) > 0)) {
        alert('Please enter an amount to give.');
        this.amountInput?.focus();
        return false;
      }
    } else if (!isValidLearnerCount(this.learnerCount)) {
      alert('Please choose how many learners you would like to sponsor.');
      return false;
    }
    const name = this.nameInput?.value;
    if (!name || name.trim().length < 2) {
      alert('Please enter your name or company.');
      this.nameInput?.focus();
      return false;
    }
    const email = this.emailInput?.value;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address.');
      this.emailInput?.focus();
      return false;
    }
    return true;
  }

  handleSponsor() {
    if (!this.validate()) return;

    if (!isKeyConfigured(this.paystackPublicKey)) {
      alert('Payments are not configured. Please contact the administrator.');
      return;
    }

    const total = this.currentTotal();
    const amount = toCents(total);
    const isGift = this.mode === 'amount';

    openCheckout({
      key: this.paystackPublicKey,
      email: this.emailInput.value,
      amount,
      reference: `${isGift ? 'NOVAR_GIFT' : 'NOVAR_SPONSOR'}_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'sponsor_name', value: this.nameInput.value },
          { display_name: 'Type', variable_name: 'contribution_type', value: isGift ? 'donation' : 'sponsorship' },
          ...(isGift ? [] : [
            { display_name: 'Learners Sponsored', variable_name: 'learners_sponsored', value: String(this.learnerCount) },
            { display_name: 'Months Covered', variable_name: 'months_covered', value: `${this.months} (to December)` }
          ])
        ]
      },
      onSuccess: () => {
        alert(isGift
          ? 'Thank you for supporting NOVAR.'
          : `Thank you! You have sponsored ${this.learnerCount} learner(s) until December.`);
        this.reset();
      },
      onClose: () => console.log('Sponsorship checkout closed')
    }).catch((error) => {
      console.error('Sponsorship payment error:', error);
      alert('An error occurred while starting your payment. Please try again.');
    });
  }

  reset() {
    if (this.nameInput) this.nameInput.value = '';
    if (this.emailInput) this.emailInput.value = '';
    if (this.amountInput) this.amountInput.value = '';
    this.mode = 'sponsor';
    this.setCount(1, { fromPreset: true });
  }
}

export default SponsorLearner;
