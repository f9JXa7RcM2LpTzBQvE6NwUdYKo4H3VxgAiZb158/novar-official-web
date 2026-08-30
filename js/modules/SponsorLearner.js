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
    this.totalEl = document.getElementById('sponsor-total');
    this.breakdownEl = document.getElementById('sponsor-breakdown');
    this.nameInput = document.getElementById('sponsor-name');
    this.emailInput = document.getElementById('sponsor-email');
    this.button = document.getElementById('sponsor-button');

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
    const countEl = document.getElementById('sponsor-progress-count');
    const goalEl = document.getElementById('sponsor-progress-goal');
    const barEl = document.getElementById('sponsor-progress-bar');
    const tilesEl = document.getElementById('sponsor-tiles');

    if (countEl) countEl.textContent = this.sponsored.toLocaleString(LOCALE);
    if (goalEl) goalEl.textContent = this.goal.toLocaleString(LOCALE);

    if (barEl && this.goal > 0) {
      const pct = Math.min(100, (this.sponsored / this.goal) * 100);
      barEl.style.width = `${pct}%`;
    }

    if (tilesEl && this.goal > 0) {
      const tileCount = Math.ceil(this.goal / this.learnersPerTile);
      const filled = Math.floor(this.sponsored / this.learnersPerTile);
      tilesEl.innerHTML = Array.from({ length: tileCount }, (_, i) =>
        `<span class="sponsor-tile${i < filled ? ' is-filled' : ''}"></span>`
      ).join('');
    }
  }

  validate() {
    if (!isValidLearnerCount(this.learnerCount)) {
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

    const total = calculateTotal(this.learnerCount, new Date(), this.pricePerMonth);
    const amount = toCents(total);

    openCheckout({
      key: this.paystackPublicKey,
      email: this.emailInput.value,
      amount,
      reference: `NOVAR_SPONSOR_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Sponsor', variable_name: 'sponsor_name', value: this.nameInput.value },
          { display_name: 'Learners Sponsored', variable_name: 'learners_sponsored', value: String(this.learnerCount) },
          { display_name: 'Months Covered', variable_name: 'months_covered', value: `${this.months} (to December)` }
        ]
      },
      onSuccess: () => {
        alert(`Thank you! You have sponsored ${this.learnerCount} learner(s) until December.`);
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
    this.setCount(1, { fromPreset: true });
  }
}

export default SponsorLearner;
