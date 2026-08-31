import { openPage } from './check.mjs';
const p = await openPage('http://localhost:8765/index.html');
const ev = p.evaluate;

console.log('label       :', await ev(`document.querySelector('.partner-label').textContent`));
console.log('cards       :', await ev(`document.querySelectorAll('.partner-card').length`));
console.log('is-single   :', await ev(`document.getElementById('partners-grid').classList.contains('is-single')`));
console.log('layout      :', await ev(`getComputedStyle(document.querySelector('.partner-card')).flexDirection`));
console.log('name        :', await ev(`document.querySelector('.partner-name').textContent`));

// simulate a second brand to prove the grid reflows
await ev(`
  window.AppConfig.partners.push({ name: 'Second Brand', logo: 'assets/novar.png', line: 'Placeholder partner.', url: 'https://example.com' });
`);
await ev(`(async()=>{ const m = await import('/js/modules/Partners.js?v=retest'); new m.default(); })()`, { awaitPromise: true });
await new Promise((r) => setTimeout(r, 600));
console.log('\nafter adding a 2nd brand:');
console.log('cards       :', await ev(`document.querySelectorAll('.partner-card').length`));
console.log('is-single   :', await ev(`document.getElementById('partners-grid').classList.contains('is-single')`));
console.log('grid columns:', await ev(`getComputedStyle(document.getElementById('partners-grid')).gridTemplateColumns`));
console.log('2nd is link :', await ev(`!!document.querySelectorAll('.partner-card')[1].closest('a')`));
console.log('exceptions  :', p.errors.join(' | ') || '(none)');
process.exit(0);
