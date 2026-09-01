import { openPage } from './check.mjs';
const p = await openPage('http://localhost:8765/index.html');
const ev = p.evaluate;

console.log('block under About :', await ev(`!!document.querySelector('#purpose .impact-block')`));
console.log('stats             :', await ev(`
  JSON.stringify([...document.querySelectorAll('.impact-stat')].map(function (s) {
    return s.querySelector('.impact-stat-value').textContent + ' ' + s.querySelector('.impact-stat-label').textContent;
  }))
`));
console.log('Leaflet before view:', await ev('typeof window.L !== "undefined"'), '(should be false — lazy)');

// scroll the map into view to trigger the lazy load
await ev(`document.getElementById('schools-map').scrollIntoView({block:'center'})`);
await new Promise((r) => setTimeout(r, 4000));

console.log('Leaflet after view :', await ev('typeof window.L !== "undefined"'));
console.log('map initialised    :', await ev(`document.querySelectorAll('#schools-map .leaflet-tile-pane').length > 0`));
console.log('tiles loaded       :', await ev(`[...document.querySelectorAll('#schools-map img.leaflet-tile')].filter(function(i){return i.complete && i.naturalWidth>0;}).length`));
console.log('pins               :', await ev(`document.querySelectorAll('.school-pin').length`));
console.log('pin logo loaded    :', await ev(`(function(){var i=document.querySelector('.school-pin-logo'); return !!i && i.complete && i.naturalWidth>0;})()`));
console.log('attribution        :', await ev(`(document.querySelector('.leaflet-control-attribution')||{}).textContent`));

// open the popup
await ev(`document.querySelector('.school-pin').click()`);
await new Promise((r) => setTimeout(r, 700));
console.log('popup name         :', await ev(`(document.querySelector('.school-popup-name')||{}).textContent`));
console.log('popup area         :', await ev(`(document.querySelector('.school-popup-area')||{}).textContent`));
console.log('approx badge       :', await ev(`(document.querySelector('.school-popup-note')||{}).textContent`));

console.log('exceptions         :', p.errors.join(' | ') || '(none)');
process.exit(0);
