import { openPage } from './check.mjs';
const p = await openPage('http://localhost:8765/index.html');
const ev = p.evaluate;

console.log('motion-on class :', await ev(`document.documentElement.classList.contains('motion-on')`));
console.log('motion.css loaded:', await ev(`[...document.styleSheets].some(function(s){return /motion\\.css/.test(s.href||'')})`));

// counters
await ev(`document.querySelector('.impact-stats').scrollIntoView({block:'center'})`);
await new Promise((r) => setTimeout(r, 2000));
console.log('\nafter count-up:');
console.log('  schools  :', await ev(`document.getElementById('stat-schools').textContent`));
console.log('  learners :', await ev(`document.getElementById('stat-learners').textContent`));
console.log('  passrate :', await ev(`document.getElementById('stat-passrate').textContent`));

// tiles
await ev(`document.getElementById('sponsor-tiles').scrollIntoView({block:'center'})`);
await new Promise((r) => setTimeout(r, 1800));
console.log('\ntiles revealed  :', await ev(`document.getElementById('sponsor-tiles').classList.contains('is-revealed')`));
console.log('tile --i set    :', await ev(`document.querySelectorAll('#sponsor-tiles .sponsor-tile')[42].style.getPropertyValue('--i')`));
console.log('tile opacity    :', await ev(`getComputedStyle(document.querySelectorAll('#sponsor-tiles .sponsor-tile')[3]).opacity`));

// magnetic
console.log('\nmagnetic marked :', await ev(`document.querySelectorAll('.is-magnetic').length`));

// board rows indexed
console.log('board row --i   :', await ev(`document.querySelectorAll('.board-row')[2].style.getPropertyValue('--i')`));

console.log('\nexceptions      :', p.errors.join(' | ') || '(none)');
process.exit(0);
