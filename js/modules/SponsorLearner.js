/**
 * Sponsor a Learner
 *
 * Two independent contributions share one card and one pair of contact
 * fields:
 *   - Sponsorship — N learners at R199.99 per learner per month, charged
 *     upfront for the months remaining until December.
 *   - Donation — any amount, its own field and its own button.
 *
 * The total box always reflects the sponsorship; the donation is whatever
 * the giver types.
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
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    this.sponsorButton = document.getElementById('sponsor-button');
    this.donateButton = document.getElementById('sponsor-donate-button');

    this.months = monthsUntilDecember(new Date());
    this.learnerCount = 1;

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

    this.sponsorButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleSponsor();
    });

    this.donateButton?.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleDonate();
    });

    // Enter inside the form submits the sponsorship, the primary action
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

    this.quantities?.querySelectorAll('button[data-learners]').forEach((btn) => {
      const matches = fromPreset && parseInt(btn.getAttribute('data-learners'), 10) === count;
      btn.classList.toggle('active', matches);
    });

    if (fromPreset && this.customInput) this.customInput.value = '';

    this.renderTotal();
  }

  renderTotal() {
    const total = calculateTotal(this.learnerCount, new Date(), this.pricePerMonth);
    if (this.totalEl) this.totalEl.textContent = `R${total.toFixed(2)}`;

    if (this.breakdownEl) {
      const learnerWord = this.learnerCount === 1 ? 'learner' : 'learners';
      const monthWord = this.months === 1 ? 'month' : 'months';
      this.breakdownEl.textContent =
        `${this.learnerCount} ${learnerWord} × ${this.months} ${monthWord} to December`;
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

  /** Name and email are required by both flows. */
  validateContact() {
    const name = this.nameInput?.value;
    if (!name || name.trim().length < 2) {
      alert('Please enter your name or company.');
      this.nameInput?.focus();
      return false;
    }
    const email = this.emailInput?.value;
    if (!email || !EMAIL.test(email)) {
      alert('Please enter a valid email address.');
      this.emailInput?.focus();
      return false;
    }
    return true;
  }

  handleSponsor() {
    if (!isValidLearnerCount(this.learnerCount)) {
      alert('Please choose how many learners you would like to sponsor.');
      return;
    }
    if (!this.validateContact()) return;

    const total = calculateTotal(this.learnerCount, new Date(), this.pricePerMonth);
    this.checkout({
      amount: toCents(total),
      prefix: 'NOVAR_SPONSOR',
      fields: [
        { display_name: 'Type', variable_name: 'contribution_type', value: 'sponsorship' },
        { display_name: 'Learners Sponsored', variable_name: 'learners_sponsored', value: String(this.learnerCount) },
        { display_name: 'Months Covered', variable_name: 'months_covered', value: `${this.months} (to December)` }
      ],
      thanks: `Thank you! You have sponsored ${this.learnerCount} learner(s) until December.`
    });
  }

  handleDonate() {
    const amount = Number(this.amountInput?.value);
    if (!(amount > 0)) {
      alert('Please enter an amount to donate.');
      this.amountInput?.focus();
      return;
    }
    if (!this.validateContact()) return;

    this.checkout({
      amount: toCents(amount),
      prefix: 'NOVAR_DONATION',
      fields: [
        { display_name: 'Type', variable_name: 'contribution_type', value: 'donation' }
      ],
      thanks: 'Thank you for supporting NOVAR.'
    });
  }

  /**
   * @param {{amount: number, prefix: string, fields: object[], thanks: string}} options
   */
  checkout({ amount, prefix, fields, thanks }) {
    if (!isKeyConfigured(this.paystackPublicKey)) {
      alert('Payments are not configured. Please contact the administrator.');
      return;
    }

    openCheckout({
      key: this.paystackPublicKey,
      email: this.emailInput.value,
      amount,
      reference: `${prefix}_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Name', variable_name: 'sponsor_name', value: this.nameInput.value },
          ...fields
        ]
      },
      onSuccess: () => {
        alert(thanks);
        this.reset();
      },
      onClose: () => console.log('Checkout closed')
    }).catch((error) => {
      console.error('Payment error:', error);
      alert('An error occurred while starting your payment. Please try again.');
    });
  }

  reset() {
    if (this.nameInput) this.nameInput.value = '';
    if (this.emailInput) this.emailInput.value = '';
    if (this.amountInput) this.amountInput.value = '';
    this.setCount(1, { fromPreset: true });
  }
}

export default SponsorLearner;
