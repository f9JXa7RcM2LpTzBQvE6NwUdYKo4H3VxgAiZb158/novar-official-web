# Sponsor a Learner — Design Spec

**Date:** 2026-08-30
**Status:** Approved (pending final user review of this doc)
**Scope:** New sponsorship flow on the NOVAR homepage — companies and individuals sponsor a chosen number of learners for the remaining months of the year

## Goal

Give companies a way to fund learner access at a per-learner price, presented with the clarity of a product offer rather than a charity appeal. Modelled on Matric Live's `sponsor.matriclive.com`: a quantity-based sponsorship paired with a visible progress-toward-goal panel.

The existing `#donate` section serves individuals giving an arbitrary amount. This is deliberately different: a **fixed unit price**, a **countable outcome** ("you sponsored 5 learners"), and a **shared goal**.

## Pricing model

| Input | Value |
|---|---|
| Price per learner, per month | **R10.81** |
| Months covered | Next month through **December of the current year** |
| Months as of Aug 2026 | 4 (Sep, Oct, Nov, Dec) |
| **Price per learner today** | **R43.24** |
| Sponsorship goal | **15,400 learners** |

### Month calculation

```
monthsUntilDecember(date):
    monthIndex = date.getMonth()        // 0 = January
    return max(1, 12 - (monthIndex + 1))
```

| Month | monthIndex | Months charged | Price per learner |
|---|---|---|---|
| Aug | 7 | 4 | R43.24 |
| Sep | 8 | 3 | R32.43 |
| Oct | 9 | 2 | R21.62 |
| Nov | 10 | 1 | R10.81 |
| Dec | 11 | **1** (clamped) | R10.81 |

The clamp matters: without it December yields 0 months and the form would charge R0. The figure re-derives on every page load, so the price stays correct as months pass with no code edit.

### Total

```
total = 10.81 × monthsUntilDecember(today) × learnerCount
```

Paystack takes amounts in cents, so the transaction value is `Math.round(total * 100)`. Rounding happens **once, at the cent conversion** — never on the intermediate per-learner figure — so 3 learners bill as R129.72, not 3 × R43.24 rounded independently.

## Billing shape

A **single upfront Paystack transaction** covering all remaining months. The UI displays the per-month rate for transparency ("R10.81 per learner per month") alongside the one-time total.

This is *not* a recurring subscription. Recurring billing would require Paystack Plans, a server to create and cancel them, and secret-key handling — `functions/index.js` is currently empty boilerplate, and the existing donation flow is client-only. Matching the established pattern keeps this shippable without standing up a backend.

## Progress counter

`learnersSponsored` is a **hardcoded number in `config/app.config.js`**, updated by hand.

A live counter would need a Paystack webhook, signature verification, and a Firestore counter — out of scope. The number will go stale between edits; this is accepted for v1.

Because a progress *bar* pinned near 0% of 15,400 reads as an unloved page, the **tile grid is the primary visual** and the bar is secondary. 15,400 ÷ 100 learners per tile = **154 tiles**, laid out 14 × 11.

## Architecture

### New: `js/utils/paystack.js`

Both the donation and sponsorship flows need to load the Paystack inline script and open a checkout. That logic currently lives inside `Donation.js`. Duplicating it into a second module is how two payment paths quietly drift apart, so it is extracted first.

```
loadPaystackScript()        → Promise, resolves when window.PaystackPop exists
isKeyConfigured(key)        → boolean, rejects placeholder/empty keys
openCheckout({ key, email, amount, reference, metadata, onSuccess, onClose })
```

### New: `js/modules/SponsorLearner.js`

Owns the sponsorship section only. Responsibilities:

- Read `sponsorship` config; compute months and unit price on construction
- Quantity selection — presets **1 / 2 / 5 / 10** plus a custom number input
- Recompute and render the live total on every quantity change
- Validate quantity (integer ≥ 1), name, and email before checkout
- Open Paystack with `learners_sponsored` and `months_covered` in metadata, so a sponsorship is distinguishable from a donation in the Paystack dashboard
- Render the progress panel (count, goal, bar, tile grid) from config

Exports `monthsUntilDecember` and `calculateTotal` as pure functions for direct unit testing.

### Modified: `js/modules/Donation.js`

Refactored to consume `utils/paystack.js`. **No behavioural change** — the existing donate flow must work exactly as it does today.

### Modified: `index.html`

New `<section id="sponsor">` placed between `#features` and `#donate`. Two-column on desktop, stacked on mobile:

- **Left** — sponsor card: quantity presets, custom quantity, live total with per-month breakdown, name, email, pay button
- **Right** — dark progress panel: count, goal, progress bar, 154-tile grid, explanatory footnote

Nav gains a **Sponsor** link in both the desktop pill and the mobile panel.

### Modified: `js/main.js`

Register `SponsorLearner`; add `sponsor` to the routes array.

### Modified: `css/main.css`

Sponsor card, quantity selector states, dark progress panel, progress bar, tile grid. The grid must scroll or reflow rather than force horizontal page scroll on narrow screens.

## Copy

Consistent with the platform positioning already on the page — no use of the word "free".

- Heading: **Sponsor a learner**
- Sub: R10.81 gives a learner a month of NOVAR — curriculum-aligned lessons and content from top creators.
- Total line: *"R43.24 — 1 learner × 4 months to December"*
- Tile footnote: *"Each tile is 100 learners."*

## Testing

**Unit (pure functions):**
- `monthsUntilDecember` for all 12 months, asserting the December clamp returns 1
- `calculateTotal` against stated figures: 1 → R43.24, 2 → R86.48, 5 → R216.20, 10 → R432.40
- Cent conversion rounds once: 3 learners → 12972 cents

**Browser (Chrome via DevTools Protocol):**
- Section renders; tile grid shows 154 tiles; no horizontal page overflow at 375px
- Selecting each preset updates the displayed total correctly
- Custom quantity updates the total; rejects 0, negatives, and non-integers
- Validation blocks checkout on bad email / empty name
- **Regression:** existing donate flow still opens Paystack; nav, scroll reveals, and the `js-anim` guard still pass

**Not tested by me:** a real card payment. The flow is verified up to opening the Paystack modal; completing a live transaction is the user's to confirm.

## Out of scope

- Recurring/monthly subscriptions
- Live sponsored-count via webhook
- Company logos / "trusted by" strip
- Sponsor receipts or certificates
- Backend payment verification (the existing donation flow has none either; this does not make that worse, but it does not fix it)

## Risks

| Risk | Mitigation |
|---|---|
| Refactoring `Donation.js` breaks live donations | Behaviour-preserving extraction; donate flow re-verified in browser before completion |
| Hardcoded counter goes stale | Documented; single config value, easy to bump |
| Client-side price could be tampered with before submission | Pre-existing property of the client-only Paystack setup; noted, not solved here. Amounts should be verified server-side before any sponsorship is honoured |
| 154 tiles on mobile | Grid reflows; verified at 375px |
