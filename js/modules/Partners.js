/**
 * Partners
 *
 * Renders the partner brands from `AppConfig.partners`. Adding a brand is
 * one config entry — the grid reflows on its own, and a lone partner gets
 * the wider horizontal treatment rather than sitting in a narrow column.
 */

class Partners {
  constructor() {
    this.grid = document.getElementById('partners-grid');
    if (!this.grid) return;

    const config = window.AppConfig || {};
    this.partners = Array.isArray(config.partners) ? config.partners : [];

    this.render();
  }

  render() {
    const section = this.grid.closest('.partner');

    if (!this.partners.length) {
      if (section) section.hidden = true;
      return;
    }
    if (section) section.hidden = false;

    // One brand reads better as a wide logo-beside-copy card; several read
    // better as equal columns.
    this.grid.classList.toggle('is-single', this.partners.length === 1);
    this.grid.innerHTML = this.partners.map((p) => this.card(p)).join('');
  }

  card(partner) {
    const line = partner.line ? `<p class="partner-line">${partner.line}</p>` : '';
    const inner = `
      <div class="partner-logo-plate">
        <img src="${partner.logo}" alt="${partner.name}" class="partner-logo" loading="lazy">
      </div>
      <div class="partner-copy">
        <p class="partner-name">${partner.name}</p>
        ${line}
      </div>`;

    return partner.url
      ? `<a class="partner-card partner-card--link" href="${partner.url}" target="_blank" rel="noopener noreferrer">${inner}</a>`
      : `<div class="partner-card">${inner}</div>`;
  }
}

export default Partners;
