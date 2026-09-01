import { openPage } from './check.mjs';
import { writeFileSync } from 'node:fs';
const [out, w = '1400', h = '1000', zoom = ''] = process.argv.slice(2);
const p = await openPage('http://localhost:8765/index.html', { width: Number(w), height: Number(h) });
await p.evaluate(`document.querySelector('.impact-block').scrollIntoView({block:'center'})`);
await new Promise((r) => setTimeout(r, 4500));
if (zoom) {
  await p.evaluate(`(function(){var m=document.querySelector('#schools-map')._leaflet_map; })()`);
}
await new Promise((r) => setTimeout(r, 1200));
await p.evaluate(`document.querySelector('.school-pin').click()`);
await new Promise((r) => setTimeout(r, 900));
const shot = await p.send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('saved', out);
process.exit(0);
