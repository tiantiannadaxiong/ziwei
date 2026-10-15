import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const source = { window: {} };
vm.runInNewContext(await readFile(new URL('site/poems.js', root), 'utf8'), source);
vm.runInNewContext(await readFile(new URL('site/review-data.js', root), 'utf8'), source);
vm.runInNewContext(await readFile(new URL('site/edition.js', root), 'utf8'), source);
const { POEMS, MATTER, ARTBOOK_REVIEW: edition } = source.window;
assert.equal(POEMS.length, 16);
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
const full = source.window.ARTBOOK_EDITION;
assert.equal(full.version, edition.version);
assert.equal(1 + MATTER.front.length + MATTER.back.length + POEMS.length * 4, 71);
const kongming = POEMS.find(poem => poem.id === 'kongming');
assert.ok(kongming, 'Kongming poem is included');
assert.deepEqual(['zh', 'en', 'fr'].map(language => kongming.verses[language].split('\n').length), [7, 14, 14]);
assert.equal(kongming.page, 54);
assert.deepEqual(Array.from(MATTER.back, item => item.folio), ['57', '58']);
for (const poem of POEMS) {
  assert.ok(poem.image && poem.imageAlt, `${poem.id}: artwork and description`);
  assert.equal(new URL(poem.image, 'https://example.test/').searchParams.get('v'), full.version);
  assert.ok(poem.sealPosition.x > 3 && poem.sealPosition.x < 97);
  assert.ok(poem.sealPosition.y > 6 && poem.sealPosition.y < 94);
}
for (const document of ['index.html', 'design-review.html']) {
  const html = await readFile(new URL(`site/${document}`, root), 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+\.(?:css|js)\?v=([^"]+))"/g)) {
    assert.equal(match[2], full.version, `${document}: ${match[1]} version`);
    await readFile(new URL(`site/${match[1].split('?')[0]}`, root));
  }
}
const images = [full.cover, ...POEMS.map(poem => poem.image), './images/seal-ziwei.svg', './images/seal-anxiangji.svg', edition.cover, ...Object.values(edition.artwork).map(art => art.image), './images/review/seal-ziwei.svg', './images/review/seal-anxiangji.svg'];
for (const url of images) {
  const svg = await readFile(new URL(`site/${url.replace(/^\.\//, '').split('?')[0]}`, root), 'utf8');
  assert.match(svg, /<title[\s>]/);
  assert.match(svg, /<desc[\s>]/);
  assert.doesNotMatch(svg, /<(?:image|text|script|foreignObject|feTurbulence)\b/);
  assert.doesNotMatch(svg, /(?:href|src)=["'](?:https?:|data:)/);
}
console.log(`Source: complete edition has 71 leaves and 16 vector plates; review has 28 leaves. All entry resources agree on ${full.version}.`);

// Regression: a review visit must not overwrite the published offline book.
// Exercise the actual service-worker fetch handler under a project subpath.
const handlers = {};
const storage = new Map();
const base = 'https://example.test/ziwei/';
const key = input => new URL(typeof input === 'string' ? input : input.url, base).href;
let online = true;
let responseBody = '';
const missingShell = [];
const preloaded = new Set();
const cache = {
  async put(input, response) { storage.set(key(input), response); },
  async add(input) {
    preloaded.add(key(input));
    try { await readFile(new URL(`site/${new URL(key(input)).pathname.slice('/ziwei/'.length) || 'index.html'}`, root)); }
    catch (error) { missingShell.push(input); throw error; }
  }
};
const cacheNames = new Set(['anxiangji-v44', 'another-app-v1']);
const environment = {
  URL, Response,
  self: { location: { origin: 'https://example.test', href: `${base}sw.js` }, async skipWaiting() {}, clients: { async claim() {} }, addEventListener(type, callback) { handlers[type] = callback; } },
  caches: { async open(name) { cacheNames.add(name); return cache; }, async keys() { return [...cacheNames]; }, async delete(name) { return cacheNames.delete(name); }, async match(input) { return storage.get(key(input))?.clone(); } },
  async fetch() { if (!online) throw new Error('offline'); return new Response(responseBody, { status: 200 }); }
};
vm.runInNewContext(await readFile(new URL('site/sw.js', root), 'utf8'), environment);
let lifecycle;
handlers.install({ waitUntil(promise) { lifecycle = promise; } });
await lifecycle;
assert.deepEqual(missingShell, [], 'every offline shell resource exists');
assert.ok(preloaded.has(key(kongming.image)), 'Kongming illustration is preloaded for offline reading');
handlers.activate({ waitUntil(promise) { lifecycle = promise; } });
await lifecycle;
assert.ok(!cacheNames.has('anxiangji-v44'));
assert.ok(cacheNames.has('another-app-v1'), 'unrelated applications keep their caches');
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
