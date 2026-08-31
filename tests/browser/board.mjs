import { openPage } from './check.mjs';
const p = await openPage('http://localhost:8765/index.html');
const ev = p.evaluate;

console.log('map title      :', await ev(`(document.querySelector('.impact-map-title')||{}).textContent`));
console.log('board present  :', await ev(`!!document.querySelector('.board')`));
console.log('sample badge   :', await ev(`(function(){var b=document.getElementById('board-sample'); return b && !b.hidden ? b.textContent : 'hidden';})()`));

const rowsOf = (b) => ev(`
  JSON.stringify([...document.querySelectorAll('.board-panel[data-board="${b}"] .board-row')].map(function (r) {
    return r.querySelector('.board-rank').textContent + ' ' +
           r.querySelector('.board-name').textContent + ' — ' +
           r.querySelector('.board-score').textContent;
  }))
`);

console.log('\nlearners :', await rowsOf('learners'));
console.log('educators:', await rowsOf('educators'));
console.log('schools  :', await rowsOf('schools'));

console.log('\ninitial visible panel:', await ev(`[...document.querySelectorAll('.board-panel')].filter(function(x){return !x.hidden;}).map(function(x){return x.dataset.board;}).join(',')`));
console.log('initial aria-selected:', await ev(`document.querySelector('.board-tab[aria-selected="true"]').dataset.board`));

await ev(`document.getElementById('tab-schools').click()`);
await new Promise((r) => setTimeout(r, 300));
console.log('after Schools click  :', await ev(`[...document.querySelectorAll('.board-panel')].filter(function(x){return !x.hidden;}).map(function(x){return x.dataset.board;}).join(',')`),
  '| aria:', await ev(`document.querySelector('.board-tab[aria-selected="true"]').dataset.board`));

// keyboard: ArrowRight from educators should land on schools
await ev(`document.getElementById('tab-educators').click(); document.getElementById('tab-educators').focus();`);
await ev(`document.getElementById('tab-educators').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}))`);
await new Promise((r) => setTimeout(r, 250));
console.log('ArrowRight ->        :', await ev(`document.querySelector('.board-tab[aria-selected="true"]').dataset.board`), '| focus:', await ev(`document.activeElement.dataset.board`));

console.log('\nexceptions:', p.errors.join(' | ') || '(none)');
process.exit(0);
