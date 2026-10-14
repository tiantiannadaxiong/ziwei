import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const source = { window: {} };
vm.runInNewContext(await readFile(new URL('site/poems.js', root), 'utf8'), source);
vm.runInNewContext(await readFile(new URL('site/review-data.js', root), 'utf8'), source);
const { POEMS, MATTER, ARTBOOK_REVIEW: edition } = source.window;
assert.equal(POEMS.length, 14);
const selected = POEMS.filter(poem => edition.poemIds.includes(poem.id));
assert.equal(selected.length, 6);
assert.deepEqual(Array.from(selected, poem => poem.id), Array.from(edition.poemIds));
const count = 1 + MATTER.front.length + MATTER.back.length + selected.length * 3 + Object.keys(edition.artwork).length;
assert.equal(count, 28);
for (const [id, artwork] of Object.entries(edition.artwork)) {
  assert.ok(POEMS.some(poem => poem.id === id));
  assert.ok(artwork.sealPosition.x > 0 && artwork.sealPosition.x < 100);
  assert.ok(artwork.sealPosition.y > 0 && artwork.sealPosition.y < 100);
}
const images = [edition.cover, ...Object.values(edition.artwork).map(art => art.image), './images/review/seal-ziwei.svg', './images/review/seal-anxiangji.svg'];
for (const url of images) {
  const svg = await readFile(new URL(`site/${url.replace(/^\.\//, '').split('?')[0]}`, root), 'utf8');
  assert.match(svg, /<title[\s>]/);
  assert.match(svg, /<desc[\s>]/);
  assert.doesNotMatch(svg, /<(?:image|text|script|foreignObject|feTurbulence)\b/);
  assert.doesNotMatch(svg, /(?:href|src)=["'](?:https?:|data:)/);
}
console.log('Source: 14 poems preserved; review has 28 leaves, 6 poems, 3 new plates and vector-only seals.');

// Regression: a review visit must not overwrite the published offline book.
// Exercise the actual service-worker fetch handler under a project subpath.
const handlers = {};
const storage = new Map();
const base = 'https://example.test/ziwei/';
const key = input => new URL(typeof input === 'string' ? input : input.url, base).href;
let online = true;
let responseBody = '';
const cache = {
  async put(input, response) { storage.set(key(input), response); },
  async add() {}
};
const environment = {
  URL, Response,
  self: { location: { origin: 'https://example.test', href: `${base}sw.js` }, addEventListener(type, callback) { handlers[type] = callback; } },
  caches: { async open() { return cache; }, async match(input) { return storage.get(key(input))?.clone(); } },
  async fetch() { if (!online) throw new Error('offline'); return new Response(responseBody, { status: 200 }); }
};
vm.runInNewContext(await readFile(new URL('site/sw.js', root), 'utf8'), environment);
async function navigate(path) {
  let result;
  handlers.fetch({ request: { url: `${base}${path}`, method: 'GET', mode: 'navigate' }, respondWith(promise) { result = promise; } });
  return (await result).text();
}
responseBody = 'PUBLISHED';
assert.equal(await navigate('index.html'), 'PUBLISHED');
responseBody = 'REVIEW';
assert.equal(await navigate('design-review.html'), 'REVIEW');
responseBody = '<svg>DIRECT ART</svg>';
assert.equal(await navigate('images/review/jiaolong.svg'), '<svg>DIRECT ART</svg>');
online = false;
assert.equal(await navigate(''), 'PUBLISHED');
assert.equal(await navigate('index.html?edition=latest'), 'PUBLISHED');
assert.equal(await navigate('design-review.html?edition=latest'), 'REVIEW');
assert.equal(await navigate('images/review/jiaolong.svg'), '<svg>DIRECT ART</svg>');
console.log('Offline: published book, review and directly opened SVG keep separate fallback documents under /ziwei/.');
