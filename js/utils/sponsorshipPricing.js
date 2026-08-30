/**
 * Sponsorship Pricing
 * Pure money maths for the sponsor-a-learner flow. No DOM access, so this
 * module can be unit-tested directly under `node --test`.
 */

export const PRICE_PER_LEARNER_PER_MONTH = 10.81;

/**
 * Months a sponsorship covers: next month through December of `date`'s year.
 * Clamped to a minimum of 1 — in December the naive count is 0, which would
 * make the form charge nothing.
 * @param {Date} date
 * @returns {number}
 */
export function monthsUntilDecember(date = new Date()) {
  return Math.max(1, 12 - (date.getMonth() + 1));
}

/**
 * Total sponsorship cost in rands.
 * @param {number} learnerCount
 * @param {Date} date
 * @param {number} pricePerMonth
 * @returns {number}
 */
export function calculateTotal(
  learnerCount,
  date = new Date(),
  pricePerMonth = PRICE_PER_LEARNER_PER_MONTH
) {
  return pricePerMonth * monthsUntilDecember(date) * learnerCount;
}

/**
 * Rands to cents for Paystack. Rounds exactly once, at the boundary, so
 * accumulated float error never reaches the charged amount.
 * @param {number} amount
 * @returns {number}
 */
export function toCents(amount) {
  return Math.round(amount * 100);
}

/**
 * @param {unknown} value
 * @returns {boolean} true when value is a whole number of learners, 1 or more
 */
export function isValidLearnerCount(value) {
  if (value === null || value === undefined || String(value).trim() === '') {
    return false;
  }
  const n = Number(value);
  return Number.isInteger(n) && n >= 1;
}
