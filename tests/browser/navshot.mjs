import { openPage } from './check.mjs';
import { writeFileSync } from 'node:fs';
const [out, w = '1400', hoverSel = ''] = process.argv.slice(2);
const p = await openPage('http://localhost:8765/index.html', { width: Number(w), height: 260 });
await new Promise((r) => setTimeout(r, 800));
if (hoverSel) {
  const box = await p.evaluate(`
    (function () { var r = document.querySelector('${hoverSel}').getBoundingClientRect();
      return JSON.stringify({ x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }); })()
  `);
  const { x, y } = JSON.parse(box);
  await p.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y });
  await new Promise((r) => setTimeout(r, 400));
}
const shot = await p.send('Page.captureScreenshot', { format: 'png' });
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log('saved', out);
process.exit(0);
