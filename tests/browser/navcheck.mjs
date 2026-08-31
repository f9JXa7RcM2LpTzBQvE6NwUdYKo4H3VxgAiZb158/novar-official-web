import { openPage } from './check.mjs';
for (const w of [768, 900, 1024, 1280, 1440]) {
  const p = await openPage('http://localhost:8765/index.html', { width: w, height: 400 });
  const ev = p.evaluate;
  const box = (sel) => ev(`
    (function(){var e=document.querySelector('${sel}'); if(!e) return 'absent';
     var r=e.getBoundingClientRect(); return Math.round(r.width)+'x'+Math.round(r.height)+' @'+Math.round(r.x);})()
  `);
  const gap = await ev(`
    (function(){
      var brand=document.querySelector('.nav-pill-brand').getBoundingClientRect();
      var first=document.querySelector('.nav-pill-links--desktop .nav-pill-link').getBoundingClientRect();
      return Math.round(first.x - brand.right);
    })()
  `);
  const overflow = await ev(`document.querySelector('.nav-pill-top').scrollWidth > document.querySelector('.nav-pill-top').clientWidth`);
  console.log(`${String(w).padStart(4)}px | contact ${await box('.nav-pill-btn-ghost')} | getapp ${await box('.nav-pill-btn-primary')} | logo→tabs gap ${String(gap).padStart(3)}px | row overflow: ${overflow}`);
}
process.exit(0);
