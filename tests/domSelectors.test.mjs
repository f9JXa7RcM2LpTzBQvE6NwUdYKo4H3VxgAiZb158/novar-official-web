/**
 * config/app.config.js stores selectors '#'-prefixed. Modules passed them to
 * getElementById, which found nothing, so the App Store button and the
 * contact buttons never got click handlers. These lock the fix in.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { stripHash } from '../js/utils/dom.js';

test('stripHash: removes a leading hash', () => {
  assert.equal(stripHash('#ios-download-btn'), 'ios-download-btn');
  assert.equal(stripHash('#coming-soon-modal'), 'coming-soon-modal');
});

test('stripHash: leaves a bare id untouched', () => {
  assert.equal(stripHash('ios-download-btn'), 'ios-download-btn');
});

test('stripHash: only strips the first character', () => {
  assert.equal(stripHash('#a#b'), 'a#b');
});

test('stripHash: passes non-strings through', () => {
  assert.equal(stripHash(null), null);
  assert.equal(stripHash(undefined), undefined);
});

test('every selector in app.config.js resolves to a real id in index.html', () => {
  const config = readFileSync('config/app.config.js', 'utf8');
  const html = readFileSync('index.html', 'utf8');
  const block = config.slice(config.indexOf('selectors:'));
  const pairs = [...block.matchAll(/(\w+):\s*'#([\w-]+)'/g)];
  assert.ok(pairs.length > 5, 'expected to find the selector block');

  const missing = pairs
      .map((m) => ({name: m[1], id: m[2]}))
      .filter((s) => !html.includes(`id="${s.id}"`))
      .map((s) => `${s.name} -> #${s.id}`);

  assert.deepEqual(missing, [], `selectors with no matching element: ${missing}`);
});
