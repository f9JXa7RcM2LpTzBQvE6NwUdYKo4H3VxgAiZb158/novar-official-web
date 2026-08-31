import { openPage } from './check.mjs';

// 1. The config switch
const p = await openPage('http://localhost:8765/index.html');
await p.evaluate(`
  window.AppConfig.motion.enabled = false;
  document.documentElement.classList.remove('motion-on');
`);
await p.evaluate(`(async()=>{ const m = await import('/js/modules/Motion.js?v=off'); new m.default(); })()`, { awaitPromise: true });
await new Promise((r) => setTimeout(r, 500));
console.log('motion.enabled = false:');
console.log('  motion-on class  :', await p.evaluate(`document.documentElement.classList.contains('motion-on')`));
console.log('  tiles visible    :', await p.evaluate(`getComputedStyle(document.querySelectorAll('#sponsor-tiles .sponsor-tile')[5]).opacity`));
console.log('  phone transform  :', await p.evaluate(`getComputedStyle(document.querySelector('.phone-mockup-inner')).transform`));
console.log('  stats intact     :', await p.evaluate(`document.getElementById('stat-learners').textContent`));

// 2. prefers-reduced-motion
const tab = await (await fetch('http://127.0.0.1:9333/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
let id = 0; const pend = new Map();
const send = (m, pr = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method: m, params: pr })); });
await new Promise((r) => (ws.onopen = r));
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend.has(m.id)) { pend.get(m.id)(m.result); pend.delete(m.id); } };
await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
await send('Network.setCacheDisabled', { cacheDisabled: true });
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
await send('Page.navigate', { url: 'http://localhost:8765/index.html' });
await new Promise((r) => setTimeout(r, 4000));
const ev = async (x) => (await send('Runtime.evaluate', { expression: x, returnByValue: true })).result?.value;
console.log('\nprefers-reduced-motion: reduce');
console.log('  motion-on class  :', await ev(`document.documentElement.classList.contains('motion-on')`));
console.log('  tiles visible    :', await ev(`getComputedStyle(document.querySelectorAll('#sponsor-tiles .sponsor-tile')[5]).opacity`));
console.log('  stats intact     :', await ev(`document.getElementById('stat-learners').textContent`));
process.exit(0);
