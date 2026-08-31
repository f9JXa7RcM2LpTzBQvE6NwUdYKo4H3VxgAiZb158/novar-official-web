/**
 * Local CSS and JS must carry a ?v= cache-buster.
 *
 * config/app.config.js shipped without one, so returning visitors kept a
 * stale copy and the sponsorship panel rendered "0 of 0" with no tiles.
 * Browser probes ran with the cache disabled and never saw it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const PAGES = ['index.html', 'r/index.html'];

function localAssetRefs(html) {
  const refs = [];
  const patterns = [
    /<script[^>]+src="([^"]+)"/g,
    /<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g
  ];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html)) !== null) {
      const url = m[1];
      if (/^https?:\/\//.test(url)) continue; // third-party CDNs are out of our hands
      refs.push(url);
    }
  }
  return refs;
}

for (const page of PAGES) {
  test(`${page}: every local script and stylesheet is cache-busted`, () => {
    const html = readFileSync(page, 'utf8');
    const unversioned = localAssetRefs(html).filter((url) => !/[?&]v=/.test(url));
    assert.deepEqual(
      unversioned,
      [],
      `missing ?v= cache-buster: ${unversioned.join(', ')}`
    );
  });
}
