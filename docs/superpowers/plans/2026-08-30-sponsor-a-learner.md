# Sponsor a Learner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a quantity-based "Sponsor a learner" flow to the NOVAR homepage that charges R10.81 per learner per month upfront for the remaining months to December, via a single Paystack transaction.

**Architecture:** A DOM-free pricing util holds all money maths so it can be unit-tested under `node --test`. A shared Paystack util is extracted from the existing `Donation.js` so both payment paths use one checkout implementation. A new `SponsorLearner.js` module owns the section's DOM: quantity selection, live total, validation, checkout, and the progress tile grid. All numbers come from a `sponsorship` block in `config/app.config.js`.

**Tech Stack:** Vanilla ES modules, Tailwind CDN + `css/main.css`, Paystack inline v1, `node --test` (built in, no dependencies), Chrome DevTools Protocol for browser verification.

**Spec:** `docs/superpowers/specs/2026-08-30-sponsor-a-learner-design.md`

## Global Constraints

- Price per learner per month: **R10.81** (exact, never rounded per-learner)
- Months charged: next month through December; **December clamps to 1**, never 0
- Price per learner as of Aug 2026: **R43.24**
- Sponsorship goal: **15,400** learners
- Tile grid: **154 tiles × 100 learners**, laid out 14 × 11
- Currency `ZAR`; Paystack amounts in **cents**, rounded exactly once at conversion
- Billing is a **single upfront charge** — no recurring subscription, no backend
- `learnersSponsored` is hardcoded in config, updated by hand
- Numbers are formatted with `toLocaleString('en-ZA')`, which groups thousands with a
  **non-breaking space** (`15 400`), not a comma. Static markup defaults must match this
  or the figure visibly reformats on load.
- Copy must **never use the word "free"** (site-wide rule)
- Existing donate flow behaviour must be **unchanged**
- No horizontal page scroll at 375px width
- Preserve the `js-anim` progressive-enhancement guard in `index.html`

**Spec refinement:** the spec placed the pure functions inside `SponsorLearner.js`. They go in `js/utils/sponsorshipPricing.js` instead — `SponsorLearner.js` touches the DOM, which `node --test` cannot import. Same functions, same behaviour, testable without a browser.

---

### Task 1: Pricing util (pure, no DOM)

**Files:**
- Create: `js/utils/sponsorshipPricing.js`
- Test: `tests/sponsorshipPricing.test.mjs`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `PRICE_PER_LEARNER_PER_MONTH: number` (10.81)
  - `monthsUntilDecember(date: Date) → number`
  - `calculateTotal(learnerCount: number, date: Date, pricePerMonth: number) → number` (rands)
  - `toCents(amount: number) → number`
  - `isValidLearnerCount(value: unknown) → boolean`

- [ ] **Step 1: Write the failing test**

Create `tests/sponsorshipPricing.test.mjs`:

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/sponsorshipPricing.test.mjs`
Expected: FAIL — `Cannot find module .../js/utils/sponsorshipPricing.js`

- [ ] **Step 3: Write minimal implementation**

Create `js/utils/sponsorshipPricing.js`:

```js
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/sponsorshipPricing.test.mjs`
Expected: PASS — 7 tests, 0 failures

- [ ] **Step 5: Commit**

```bash
git add js/utils/sponsorshipPricing.js tests/sponsorshipPricing.test.mjs
git commit -m "Add sponsorship pricing util with unit tests"
```

---

### Task 2: Shared Paystack util + Donation refactor

**Files:**
- Create: `js/utils/paystack.js`
- Modify: `js/modules/Donation.js` (replace `loadPaystackScript`, `processPayment`, and the placeholder checks)

**Interfaces:**
- Consumes: nothing from Task 1
- Produces:
  - `isKeyConfigured(key: string) → boolean`
  - `loadPaystackScript() → Promise<PaystackPop>`
  - `openCheckout({ key, email, amount, reference, metadata, onSuccess, onClose }) → Promise<void>`

**Why:** `Donation.js` currently owns script loading and checkout. Copying that into `SponsorLearner.js` would give the site two payment implementations that drift apart. Extract once, use twice.

- [ ] **Step 1: Create the shared util**

Create `js/utils/paystack.js`:

```js
/**
 * Paystack helpers shared by the donation and sponsorship flows.
 */

const PAYSTACK_SRC = 'https://js.paystack.co/v1/inline.js';

/**
 * @param {string} key
 * @returns {boolean} false for empty keys and the placeholder shipped in config
 */
export function isKeyConfigured(key) {
  return Boolean(key) && !key.includes('YOUR_PUBLIC_KEY') && key.trim() !== '';
}

/**
 * Loads the Paystack inline script once, reusing an in-flight tag if another
 * module already started it.
 * @returns {Promise<object>} resolves with window.PaystackPop
 */
export function loadPaystackScript() {
  if (window.PaystackPop) {
    return Promise.resolve(window.PaystackPop);
  }

  let script = document.querySelector(`script[src="${PAYSTACK_SRC}"]`);
  if (!script) {
    script = document.createElement('script');
    script.src = PAYSTACK_SRC;
    script.async = true;
    document.head.appendChild(script);
  }

  return new Promise((resolve, reject) => {
    script.addEventListener('load', () => {
      if (window.PaystackPop) resolve(window.PaystackPop);
      else reject(new Error('Paystack loaded but PaystackPop is missing'));
    });
    script.addEventListener('error', () =>
      reject(new Error('Failed to load the Paystack script'))
    );
  });
}

/**
 * Opens the Paystack checkout modal.
 * @param {object} options
 * @param {string} options.key Paystack public key
 * @param {string} options.email
 * @param {number} options.amount Amount in cents
 * @param {string} options.reference
 * @param {object} [options.metadata]
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onClose]
 * @returns {Promise<void>}
 */
export async function openCheckout({
  key,
  email,
  amount,
  reference,
  metadata,
  onSuccess,
  onClose
}) {
  await loadPaystackScript();

  const handler = window.PaystackPop.setup({
    key,
    email,
    amount,
    currency: 'ZAR',
    ref: reference,
    metadata: metadata || {},
    callback: (response) => {
      if (onSuccess) onSuccess(response);
    },
    onClose: () => {
      if (onClose) onClose();
    }
  });

  handler.openIframe();
}
```

- [ ] **Step 2: Point Donation.js at the util**

In `js/modules/Donation.js`, add to the imports at the top:

```js
import { isKeyConfigured, loadPaystackScript, openCheckout } from '../utils/paystack.js';
```

Replace the whole `loadPaystackScript()` method body with a delegation:

```js
  /**
   * Load Paystack inline script
   */
  loadPaystackScript() {
    loadPaystackScript().catch((error) => console.error(error.message));
  }
```

Replace the two inline placeholder checks (in `init()` and `processPayment()`) with `!isKeyConfigured(this.paystackPublicKey)`. In `init()`:

```js
    if (!isKeyConfigured(this.paystackPublicKey)) {
```

Replace the whole `processPayment(amount, email, name)` method with:

```js
  /**
   * Process payment with Paystack
   * @param {number} amount - Amount in cents
   * @param {string} email - Donor email
   * @param {string} name - Donor name
   */
  processPayment(amount, email, name) {
    if (!isKeyConfigured(this.paystackPublicKey)) {
      alert('Paystack is not properly configured. Please contact the administrator.');
      return;
    }

    openCheckout({
      key: this.paystackPublicKey,
      email,
      amount,
      reference: `NOVAR_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Donor Name', variable_name: 'donor_name', value: name }
        ]
      },
      onSuccess: (response) => this.handlePaymentSuccess(response),
      onClose: () => this.handlePaymentClose()
    }).catch((error) => {
      console.error('Error processing payment:', error);
      alert('An error occurred while processing your payment. Please try again.');
    });
  }
```

- [ ] **Step 3: Verify the donate flow is unchanged**

Start the server if not running:

```bash
cd "/Users/malungelo/Documents/VS Code/novar web" && python3 -m http.server 8765 &
```

Create `tests/browser/check.mjs` (reused by later tasks — a thin CDP driver):

```js
export async function openPage(url, { width = 1440, height = 900 } = {}) {
  const tab = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  const errors = [];
  const send = (method, params = {}) =>
    new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  await new Promise((r) => (ws.onopen = r));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
    if (m.method === 'Runtime.exceptionThrown')
      errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
  };
  await send('Runtime.enable'); await send('Page.enable'); await send('Network.enable');
  await send('Network.setCacheDisabled', { cacheDisabled: true });
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  await new Promise((r) => setTimeout(r, 3500));
  const evaluate = async (expr) =>
    (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.value;
  return { evaluate, errors, send };
}
```

Launch headless Chrome and check donate still works:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --no-first-run --remote-debugging-port=9333 --user-data-dir=/tmp/novar-cdp &
sleep 4
node --input-type=module -e '
import { openPage } from "./tests/browser/check.mjs";
const p = await openPage("http://localhost:8765/index.html");
console.log("donate button present:", await p.evaluate("!!document.getElementById(\"donate-button\")"));
console.log("app initialized:", await p.evaluate("!!window.__novarAppReady"));
console.log("exceptions:", p.errors.join(" | ") || "(none)");
process.exit(0);'
```

Expected: donate button present `true`, app initialized `true`, exceptions `(none)`

- [ ] **Step 4: Commit**

```bash
git add js/utils/paystack.js js/modules/Donation.js tests/browser/check.mjs
git commit -m "Extract shared Paystack util and use it in Donation"
```

---

### Task 3: Config, markup and styles for the sponsor section

**Files:**
- Modify: `config/app.config.js` (add `sponsorship` block and selectors)
- Modify: `index.html` (new `<section id="sponsor">`; nav links; CSS cache bump)
- Modify: `css/main.css` (sponsor card, quantity buttons, progress panel, tile grid)

**Interfaces:**
- Consumes: nothing
- Produces: DOM contract used by Task 4 — element ids
  `sponsor-form`, `sponsor-quantities`, `sponsor-custom-quantity`, `sponsor-total`,
  `sponsor-breakdown`, `sponsor-name`, `sponsor-email`, `sponsor-button`,
  `sponsor-progress-count`, `sponsor-progress-goal`, `sponsor-progress-bar`,
  `sponsor-tiles`; preset buttons carry `data-learners`.

- [ ] **Step 1: Add the config block**

In `config/app.config.js`, add after the `paystack` block:

```js
  // Sponsorship (sponsor-a-learner)
  sponsorship: {
    pricePerLearnerPerMonth: 10.81,
    goal: 15400,
    learnersSponsored: 0,   // update by hand as sponsorships come in
    learnersPerTile: 100,
    presets: [1, 2, 5, 10]
  },
```

And inside `selectors`, add:

```js
    sponsorButton: '#sponsor-button',
```

- [ ] **Step 2: Add the section markup**

In `index.html`, insert immediately **before** `<!-- Donation Section -->`:

```html
    <!-- Sponsor a Learner Section -->
    <section id="sponsor" class="py-12 md:py-16 bg-gradient-to-b from-white via-gray-50 to-white">
        <div class="container mx-auto px-4">
            <div class="text-center mb-8 md:mb-10 animate-on-scroll">
                <span class="purpose-badge mb-3 inline-block">
                    <i class="fas fa-graduation-cap mr-2"></i>
                    Sponsor
                </span>
                <h2 class="text-3xl md:text-4xl font-bold mb-2">
                    Sponsor a <span class="gradient-text">learner</span>
                </h2>
                <p class="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
                    R10.81 gives a learner a month of NOVAR — curriculum-aligned lessons
                    and content from top creators.
                </p>
            </div>

            <div class="sponsor-layout">
                <!-- Sponsor form -->
                <div class="sponsor-card contact-card rounded-2xl p-5 md:p-6 animate-on-scroll">
                    <form class="space-y-4" id="sponsor-form">
                        <div>
                            <label class="block text-gray-900 mb-2 font-semibold text-sm">How many learners?</label>
                            <div class="sponsor-quantities grid grid-cols-4 gap-2" id="sponsor-quantities">
                                <button type="button" data-learners="1" class="sponsor-qty-btn">1</button>
                                <button type="button" data-learners="2" class="sponsor-qty-btn">2</button>
                                <button type="button" data-learners="5" class="sponsor-qty-btn">5</button>
                                <button type="button" data-learners="10" class="sponsor-qty-btn">10</button>
                            </div>
                        </div>

                        <div>
                            <label class="block text-gray-900 mb-1.5 font-semibold text-sm" for="sponsor-custom-quantity">Or enter a number</label>
                            <input class="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                type="number" id="sponsor-custom-quantity" placeholder="e.g. 25" min="1" step="1">
                        </div>

                        <div class="sponsor-total-box rounded-xl p-4">
                            <div class="sponsor-total" id="sponsor-total">R43.24</div>
                            <div class="sponsor-breakdown" id="sponsor-breakdown">1 learner × 4 months to December</div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label class="block text-gray-900 mb-1.5 font-semibold text-sm" for="sponsor-name">Name / Company *</label>
                                <input class="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                    type="text" id="sponsor-name" placeholder="Your name or company" required>
                            </div>
                            <div>
                                <label class="block text-gray-900 mb-1.5 font-semibold text-sm" for="sponsor-email">Email *</label>
                                <input class="w-full px-3.5 py-2.5 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dark focus:border-transparent transition-all text-gray-900 placeholder-gray-400"
                                    type="email" id="sponsor-email" placeholder="Your email" required>
                            </div>
                        </div>

                        <button type="button" id="sponsor-button" class="sponsor-submit w-full py-3 rounded-xl font-semibold">
                            Sponsor a learner &rarr;
                        </button>
                    </form>
                </div>

                <!-- Progress panel -->
                <div class="sponsor-progress animate-on-scroll" aria-live="polite">
                    <p class="sponsor-progress-label">Learners sponsored</p>
                    <p class="sponsor-progress-figure">
                        <span id="sponsor-progress-count">0</span>
                        <span class="sponsor-progress-goal">of <span id="sponsor-progress-goal">15 400</span> learners</span>
                    </p>
                    <div class="sponsor-progress-track">
                        <div class="sponsor-progress-bar" id="sponsor-progress-bar"></div>
                    </div>
                    <div class="sponsor-tiles" id="sponsor-tiles" aria-hidden="true"></div>
                    <p class="sponsor-tile-note">Each tile is 100 learners.</p>
                </div>
            </div>
        </div>
    </section>

```

- [ ] **Step 3: Add nav links**

In `index.html`, in the desktop links block (`nav-pill-links--desktop`), add after the Donate link:

```html
                    <a href="#sponsor" class="nav-link nav-pill-link" data-section="sponsor">Sponsor</a>
```

In the mobile panel (`nav-pill-panel-inner`), add after the Donate link:

```html
                    <a href="#sponsor" class="nav-link nav-pill-panel-link" data-section="sponsor">Sponsor</a>
```

- [ ] **Step 4: Add the styles**

Append to `css/main.css`:

```css
/* ---------- Sponsor a learner ---------- */

.sponsor-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 64rem;
  margin: 0 auto;
}

@media (min-width: 1024px) {
  .sponsor-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
}

.sponsor-qty-btn {
  padding: 0.625rem 0.5rem;
  background: #fff;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
  transition: all 0.2s ease;
}

.sponsor-qty-btn:hover {
  border-color: #000;
  background: #f9fafb;
}

.sponsor-qty-btn.active {
  background: #000;
  border-color: #000;
  color: #fff;
}

.sponsor-total-box {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
}

.sponsor-total {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  line-height: 1.1;
}

.sponsor-breakdown {
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.sponsor-submit {
  background: #000;
  color: #fff;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.sponsor-submit:hover {
  transform: translateY(-2px);
  opacity: 0.92;
}

.sponsor-progress {
  background: #1a1333;
  border-radius: 1.25rem;
  padding: 1.5rem;
  color: #fff;
}

.sponsor-progress-label {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.sponsor-progress-figure {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 0.35rem 0 1rem;
}

#sponsor-progress-count {
  font-size: 2.75rem;
  font-weight: 700;
  color: #f0b429;
  line-height: 1;
}

.sponsor-progress-goal {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
}

.sponsor-progress-track {
  height: 0.375rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.12);
  overflow: hidden;
}

.sponsor-progress-bar {
  height: 100%;
  width: 0;
  border-radius: 9999px;
  background: #4ade80;
  transition: width 0.6s ease;
}

.sponsor-tiles {
  display: grid;
  grid-template-columns: repeat(14, minmax(0, 1fr));
  gap: 0.25rem;
  margin: 1rem 0 0.75rem;
}

.sponsor-tile {
  aspect-ratio: 1 / 1;
  border-radius: 0.1875rem;
  background: rgba(255, 255, 255, 0.07);
}

.sponsor-tile.is-filled {
  background: #f0b429;
}

.sponsor-tile-note {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}
```

- [ ] **Step 5: Bump the CSS cache-buster**

In `index.html`, change `css/main.css?v=nav23` to `css/main.css?v=nav24`.

- [ ] **Step 6: Verify the section renders with no overflow**

```bash
node --input-type=module -e '
import { openPage } from "./tests/browser/check.mjs";
for (const w of [1440, 375]) {
  const p = await openPage("http://localhost:8765/index.html", { width: w, height: 900 });
  console.log(`--- ${w}px ---`);
  console.log("section present:", await p.evaluate("!!document.getElementById(\"sponsor\")"));
  console.log("nav link present:", await p.evaluate("!!document.querySelector(\".nav-link[data-section=\\\"sponsor\\\"]\")"));
  console.log("horizontal overflow:", await p.evaluate("document.documentElement.scrollWidth > window.innerWidth"));
}
process.exit(0);'
```

Expected: section present `true`, nav link present `true`, horizontal overflow `false` at both widths

- [ ] **Step 7: Commit**

```bash
git add config/app.config.js index.html css/main.css
git commit -m "Add sponsor-a-learner section markup, styles and config"
```

---

### Task 4: SponsorLearner module

**Files:**
- Create: `js/modules/SponsorLearner.js`
- Modify: `js/main.js` (import, instantiate, add `sponsor` route, bump cache-buster)

**Interfaces:**
- Consumes:
  - `sponsorshipPricing.js`: `monthsUntilDecember`, `calculateTotal`, `toCents`, `isValidLearnerCount`
  - `paystack.js`: `isKeyConfigured`, `openCheckout`
  - DOM ids listed in Task 3
- Produces: `default export class SponsorLearner`

- [ ] **Step 1: Write the module**

Create `js/modules/SponsorLearner.js`:

```js
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

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

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

    if (countEl) countEl.textContent = this.sponsored.toLocaleString('en-ZA');
    if (goalEl) goalEl.textContent = this.goal.toLocaleString('en-ZA');

    if (barEl && this.goal > 0) {
      const pct = Math.min(100, (this.sponsored / this.goal) * 100);
      barEl.style.width = `${pct}%`;
    }

    if (tilesEl && this.goal > 0) {
      const tileCount = Math.ceil(this.goal / this.learnersPerTile);
      const filled = Math.floor(this.sponsored / this.learnersPerTile);
      const markup = Array.from({ length: tileCount }, (_, i) =>
        `<span class="sponsor-tile${i < filled ? ' is-filled' : ''}"></span>`
      ).join('');
      tilesEl.innerHTML = markup;
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
    const endMonth = MONTH_NAMES[11];

    openCheckout({
      key: this.paystackPublicKey,
      email: this.emailInput.value,
      amount,
      reference: `NOVAR_SPONSOR_${Date.now()}`,
      metadata: {
        custom_fields: [
          { display_name: 'Sponsor', variable_name: 'sponsor_name', value: this.nameInput.value },
          { display_name: 'Learners Sponsored', variable_name: 'learners_sponsored', value: String(this.learnerCount) },
          { display_name: 'Months Covered', variable_name: 'months_covered', value: `${this.months} (to ${endMonth})` }
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
```

- [ ] **Step 2: Register it in main.js**

In `js/main.js`, add the import alongside the others:

```js
import SponsorLearner from './modules/SponsorLearner.js?v=nav24';
```

Add to the `this.modules` array, after `new Donation()`:

```js
        new SponsorLearner()
```

(Add a comma to the `new Donation()` line above it.)

Add `'sponsor'` to the routes array in `initRoutes()`:

```js
    const sections = ['download', 'purpose', 'features', 'sponsor', 'donate', 'contact'];
```

In `index.html`, bump `js/main.js?v=nav23` to `js/main.js?v=nav24`.

- [ ] **Step 3: Verify behaviour in the browser**

```bash
node --input-type=module -e '
import { openPage } from "./tests/browser/check.mjs";
const p = await openPage("http://localhost:8765/index.html");
const ev = p.evaluate;
console.log("initial total  :", await ev("document.getElementById(\"sponsor-total\").textContent"));
console.log("initial detail :", await ev("document.getElementById(\"sponsor-breakdown\").textContent"));
for (const n of [2, 5, 10]) {
  await ev(`document.querySelector(\x27.sponsor-qty-btn[data-learners="${n}"]\x27).click()`);
  console.log(`preset ${n}  ->`, await ev("document.getElementById(\"sponsor-total\").textContent"));
}
await ev("(function(){var i=document.getElementById(\"sponsor-custom-quantity\");i.value=25;i.dispatchEvent(new Event(\"input\"));})()");
console.log("custom 25 ->", await ev("document.getElementById(\"sponsor-total\").textContent"));
console.log("tiles rendered:", await ev("document.querySelectorAll(\".sponsor-tile\").length"));
console.log("goal shown    :", await ev("document.getElementById(\"sponsor-progress-goal\").textContent"));
console.log("exceptions:", p.errors.join(" | ") || "(none)");
process.exit(0);'
```

Expected:
```
initial total  : R43.24
initial detail : 1 learner × 4 months to December
preset 2  -> R86.48
preset 5  -> R216.20
preset 10 -> R432.40
custom 25 -> R1081.00
tiles rendered: 154
goal shown    : 15 400   (en-ZA groups with a non-breaking space, U+00A0 — not a comma)
exceptions: (none)
```

- [ ] **Step 4: Commit**

```bash
git add js/modules/SponsorLearner.js js/main.js index.html
git commit -m "Add SponsorLearner module wiring quantity, pricing and checkout"
```

---

### Task 5: Full regression sweep

**Files:** none created; verification only

- [ ] **Step 1: Run the unit tests**

Run: `node --test tests/`
Expected: all pass, 0 failures

- [ ] **Step 2: Verify nav, reveals and the JS guard still work**

```bash
node --input-type=module -e '
import { openPage } from "./tests/browser/check.mjs";
const p = await openPage("http://localhost:8765/index.html");
const ev = p.evaluate;
await ev("(async()=>{const h=document.body.scrollHeight;for(let y=0;y<h;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,50));}})()");
await new Promise(r=>setTimeout(r,2500));
console.log("reveals:", await ev("document.querySelectorAll(\x27.animate-on-scroll.visible\x27).length"), "of", await ev("document.querySelectorAll(\x27.animate-on-scroll\x27).length"));
for (const s of ["purpose","features","sponsor","donate","contact"]) {
  await ev("window.scrollTo(0,0)"); await new Promise(r=>setTimeout(r,300));
  await ev(`document.querySelector(\x27.nav-link[data-section="${s}"]\x27).click()`);
  await new Promise(r=>setTimeout(r,1400));
  console.log(`#${s} -> active:`, await ev("document.querySelector(\x27.nav-link.active\x27)?.dataset.section"), "hash:", await ev("location.hash"));
}
console.log("appReady:", await ev("!!window.__novarAppReady"));
console.log("exceptions:", p.errors.join(" | ") || "(none)");
process.exit(0);'
```

Expected: all reveal blocks visible, each nav click sets the matching active link and hash, `appReady: true`, no exceptions

- [ ] **Step 3: Verify content survives a JS failure (the guard regression)**

Re-run the existing check that blocks `js/main.js` and asserts no content block is left at `opacity: 0`.

Expected: `PASS: content readable without JS`

- [ ] **Step 4: Confirm "free" has not re-entered the copy**

Run: `grep -rniE '\bfree\b' index.html r/index.html`
Expected: only the Liberty partnership paragraph and "economic freedom"

- [ ] **Step 5: Commit**

```bash
git add -A docs/superpowers/plans/2026-08-30-sponsor-a-learner.md
git commit -m "Verify sponsor-a-learner flow end to end"
```

---

## Manual verification left to the user

- **A real card payment.** Every step above stops at the Paystack modal opening. Completing a live transaction, and confirming the amount and metadata land correctly in the Paystack dashboard, is the user's to do.
- **Server-side amount verification.** The total is computed in the browser and can be tampered with before submission — a pre-existing property of the client-only setup, not introduced here. Amounts should be checked against Paystack before any sponsorship is honoured.
