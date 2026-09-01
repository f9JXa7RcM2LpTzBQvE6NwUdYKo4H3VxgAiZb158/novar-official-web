import { openPage } from './check.mjs';
const p = await openPage('http://localhost:8765/index.html');
const ev = p.evaluate;
console.log('strip inside #sponsor:', await ev(`!!document.querySelector('#sponsor .sponsor-partner')`));
console.log('label                :', await ev(`document.querySelector('.sponsor-partner-label').textContent`));
console.log('caption              :', await ev(`document.querySelector('.sponsor-partner-name').textContent`));

// lazy images only load once scrolled into view
await ev(`(async()=>{const h=document.body.scrollHeight;for(let y=0;y<h;y+=300){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}})()`);
await new Promise((r) => setTimeout(r, 2500));

console.log('Liberty images after scroll:', await ev(`
  JSON.stringify([...document.querySelectorAll('img')]
    .filter(function (i) { return /liberty/i.test(i.getAttribute('src') || ''); })
    .map(function (i) { return { cls: i.className.slice(0, 22) || 'leaders', ok: i.complete && i.naturalWidth > 0, nat: i.naturalWidth + 'x' + i.naturalHeight }; }))
`));
console.log('rendered logo size   :', await ev(`
  (function(){var r=document.querySelector('.sponsor-partner-logo').getBoundingClientRect();
   return Math.round(r.width)+'x'+Math.round(r.height);})()
`));
console.log('exceptions           :', p.errors.join(' | ') || '(none)');
process.exit(0);
