/**
 * Leaderboards
 *
 * Three ranked lists — learners, educators, schools — in one tabbed card,
 * rendered from `AppConfig.leaderboards`.
 *
 * Rows are anonymous by design. These boards concern minors and named school
 * staff, so the config ships placeholder labels rather than invented people,
 * and a "Sample data" badge stays visible until `sample` is set to false.
 */

const BOARDS = ['learners', 'educators', 'schools'];
const LOCALE = 'en-ZA';

class Leaderboards {
  constructor() {
    this.root = document.querySelector('.board');
    if (!this.root) return;

    const config = window.AppConfig || {};
    this.data = config.leaderboards || {};
    this.unit = this.data.unit || '';

    this.tabs = Array.from(this.root.querySelectorAll('.board-tab'));
    this.panels = Array.from(this.root.querySelectorAll('.board-panel'));

    this.init();
  }

  init() {
    const badge = document.getElementById('board-sample');
    if (badge) badge.hidden = !this.data.sample;

    BOARDS.forEach((board) => this.renderPanel(board));

    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.select(tab.dataset.board));
      tab.addEventListener('keydown', (e) => this.onKeydown(e));
    });

    this.select('learners');
  }

  /** Left/Right/Home/End move between tabs, per the tablist pattern. */
  onKeydown(e) {
    const i = this.tabs.indexOf(e.target);
    if (i === -1) return;

    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % this.tabs.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + this.tabs.length) % this.tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = this.tabs.length - 1;
    if (next === null) return;

    e.preventDefault();
    this.select(this.tabs[next].dataset.board);
    this.tabs[next].focus();
  }

  select(board) {
    this.tabs.forEach((tab) => {
      const on = tab.dataset.board === board;
      tab.setAttribute('aria-selected', String(on));
      tab.tabIndex = on ? 0 : -1;
      tab.classList.toggle('is-active', on);
    });
    this.panels.forEach((panel) => {
      panel.hidden = panel.dataset.board !== board;
    });
  }

  renderPanel(board) {
    const panel = this.root.querySelector(`.board-panel[data-board="${board}"]`);
    if (!panel) return;

    const rows = Array.isArray(this.data[board]) ? this.data[board] : [];
    if (!rows.length) {
      panel.innerHTML = '<p class="board-empty">No entries yet.</p>';
      return;
    }

    panel.innerHTML = `<ol class="board-list">${rows.map((r) => this.row(r)).join('')}</ol>`;
  }

  row(entry) {
    const pending = entry.score === null || entry.score === undefined;
    const score = pending
      ? '<span class="board-score board-score--pending">—</span>'
      : `<span class="board-score">${Number(entry.score).toLocaleString(LOCALE)}<span class="board-unit">${this.unit}</span></span>`;

    return `<li class="board-row${pending ? ' is-pending' : ''}">
        <span class="board-rank">${entry.rank}</span>
        <span class="board-who">
          <span class="board-name">${entry.name}</span>
          <span class="board-detail">${entry.detail || ''}</span>
        </span>
        ${score}
      </li>`;
  }
}

export default Leaderboards;
