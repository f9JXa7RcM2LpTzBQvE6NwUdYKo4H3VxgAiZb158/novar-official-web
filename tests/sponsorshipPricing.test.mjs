import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PRICE_PER_LEARNER_PER_MONTH,
  monthsUntilDecember,
  calculateTotal,
  toCents,
  isValidLearnerCount
} from '../js/utils/sponsorshipPricing.js';

test('price constant is R10.81', () => {
  assert.equal(PRICE_PER_LEARNER_PER_MONTH, 10.81);
});

test('monthsUntilDecember counts next month through December', () => {
  const expected = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1];
  expected.forEach((months, monthIndex) => {
    assert.equal(
      monthsUntilDecember(new Date(2026, monthIndex, 15)),
      months,
      `month index ${monthIndex}`
    );
  });
});

test('December clamps to 1 month, never 0', () => {
  assert.equal(monthsUntilDecember(new Date(2026, 11, 1)), 1);
  assert.equal(monthsUntilDecember(new Date(2026, 11, 31)), 1);
});

test('August 2026 totals match the agreed figures', () => {
  const aug = new Date(2026, 7, 30);
  assert.equal(calculateTotal(1, aug).toFixed(2), '43.24');
  assert.equal(calculateTotal(2, aug).toFixed(2), '86.48');
  assert.equal(calculateTotal(3, aug).toFixed(2), '129.72');
  assert.equal(calculateTotal(5, aug).toFixed(2), '216.20');
  assert.equal(calculateTotal(10, aug).toFixed(2), '432.40');
});

test('total tracks the shrinking month count', () => {
  assert.equal(calculateTotal(1, new Date(2026, 8, 15)).toFixed(2), '32.43');
  assert.equal(calculateTotal(1, new Date(2026, 10, 15)).toFixed(2), '10.81');
  assert.equal(calculateTotal(1, new Date(2026, 11, 15)).toFixed(2), '10.81');
});

test('toCents rounds once, absorbing float error', () => {
  const aug = new Date(2026, 7, 30);
  assert.equal(toCents(calculateTotal(1, aug)), 4324);
  assert.equal(toCents(calculateTotal(3, aug)), 12972);
  assert.equal(toCents(calculateTotal(5, aug)), 21620);
  assert.equal(toCents(calculateTotal(10, aug)), 43240);
});

test('isValidLearnerCount accepts positive integers only', () => {
  [1, 2, 100, '5'].forEach((v) => assert.equal(isValidLearnerCount(v), true, `${v}`));
  [0, -1, 1.5, '', ' ', 'abc', null, undefined, NaN]
    .forEach((v) => assert.equal(isValidLearnerCount(v), false, `${String(v)}`));
});
