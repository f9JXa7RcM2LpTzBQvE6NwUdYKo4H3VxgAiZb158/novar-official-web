import { openPage } from './check.mjs';

const p = await openPage('http://localhost:8765/index.html');
const ev = p.evaluate;

// Stub Paystack + alert so nothing opens a real modal or blocks.
await ev(`
  window.__alerts = [];
  window.alert = function (m) { window.__alerts.push(m); };
  window.__setup = null;
  window.PaystackPop = { setup: function (a) { window.__setup = a; return { openIframe: function () {} }; } };
`);

const field = (id, v) => ev(`document.getElementById('${id}').value = ${JSON.stringify(v)};`);
const click = (id) => ev(`document.getElementById('${id}').click();`);
const reset = () => ev('window.__setup = null; window.__alerts = [];');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

console.log('form order:', await ev(
  `JSON.stringify([...document.querySelectorAll('#sponsor-form > *')].map(function (e) { return e.id || e.className.split(' ')[0]; }))`
));
console.log('total box :', await ev(`document.getElementById('sponsor-total').textContent`),
  '|', await ev(`document.getElementById('sponsor-breakdown').textContent`));

await field('sponsor-name', 'Acme Ltd');
await field('sponsor-email', 'a@acme.co.za');

// --- sponsorship ---
await reset();
await ev(`document.querySelector('.sponsor-qty-btn[data-learners="5"]').click();`);
await click('sponsor-button');
await wait(500);
console.log('\nSPONSOR 5  -> cents:', await ev('window.__setup && window.__setup.amount'),
  '| ref:', await ev(`window.__setup && window.__setup.ref.split('_').slice(0,2).join('_')`),
  '| type:', await ev(`window.__setup && window.__setup.metadata.custom_fields[1].value`));

// --- donation, independent of the sponsorship total ---
await reset();
await field('sponsor-amount', '250');
await click('sponsor-donate-button');
await wait(500);
console.log('DONATE 250 -> cents:', await ev('window.__setup && window.__setup.amount'),
  '| ref:', await ev(`window.__setup && window.__setup.ref.split('_').slice(0,2).join('_')`),
  '| type:', await ev(`window.__setup && window.__setup.metadata.custom_fields[1].value`));
console.log('total box untouched by donate:', await ev(`document.getElementById('sponsor-total').textContent`));

// --- donation with no amount ---
await reset();
await field('sponsor-amount', '');
await click('sponsor-donate-button');
await wait(400);
console.log('DONATE empty -> opened:', await ev('!!window.__setup'), '| alert:', await ev('window.__alerts[0]'));

// --- sponsorship still works after a donation attempt ---
await reset();
await click('sponsor-button');
await wait(500);
console.log('SPONSOR again -> cents:', await ev('window.__setup && window.__setup.amount'));

console.log('\nexceptions:', p.errors.join(' | ') || '(none)');
process.exit(0);
