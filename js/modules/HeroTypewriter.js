/**
 * Hero Typewriter
 * Types the hero headline on load with a blinking cursor
 */

class HeroTypewriter {
  constructor() {
    this.el = document.getElementById('hero-typewriter');
    this.cursor = document.getElementById('hero-cursor');
    this.fullText = "It's more than just learning";
    this.accentStart = this.fullText.indexOf('just learning');
    this.charIndex = 0;
    this.speed = 48;
    this.startDelay = 320;

    if (!this.el) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      this.renderFull();
      if (this.cursor) this.cursor.classList.add('hero-cursor--done');
      return;
    }

    this.el.textContent = '';
    if (this.cursor) this.cursor.classList.add('hero-cursor--blink');

    window.setTimeout(() => this.typeNext(), this.startDelay);
  }

  renderFull() {
    this.el.innerHTML = this.buildHtml(this.fullText.length);
  }

  buildHtml(length) {
    const typed = this.fullText.slice(0, length);
    if (length <= this.accentStart) {
      return this.escape(typed);
    }

    const before = this.escape(typed.slice(0, this.accentStart));
    const accent = this.escape(typed.slice(this.accentStart));
    return `${before}<span class="hero-title-accent">${accent}</span>`;
  }

  escape(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  typeNext() {
    this.charIndex += 1;
    this.el.innerHTML = this.buildHtml(this.charIndex);

    if (this.charIndex < this.fullText.length) {
      const ch = this.fullText[this.charIndex - 1];
      const pause = ch === ' ' ? this.speed * 1.6 : this.speed;
      window.setTimeout(() => this.typeNext(), pause);
      return;
    }

    if (this.cursor) {
      this.cursor.classList.add('hero-cursor--done');
    }
  }
}

export default HeroTypewriter;
