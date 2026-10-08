/* Offline shell for the poetry reader.
 *
 * Fonts, illustrations and music are immutable per URL, so they are cached on
 * first use and then served straight from the cache (this also spares the
 * reader a 5.9 MB revalidation of the poetry face on every visit). Styles,
 * scripts and pages stay network-first, so a new edition always arrives; the
 * cache is only the offline fallback. Bump CACHE when the shell changes. */
const CACHE = "anxiangji-v1";
const SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./poems.js",
  "./reader.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png"
];
const IMMUTABLE = /\.(?:ttf|otf|woff2?|png|jpe?g|svg|webp|avif|ico|mp3|m4a)$/i;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // one by one: a single failure must not abort the whole install
    await Promise.all(SHELL.map((url) => cache.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network first, cached copy as the offline fallback.
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        await put("./index.html", response.clone());
        return response;
      } catch {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // Immutable artwork and fonts: cache first.
  if (IMMUTABLE.test(url.pathname)) {
    event.respondWith((async () => {
      const hit = await caches.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) await put(request, response.clone());
      return response;
    })());
    return;
  }

  // Styles, scripts, JSON: network first so updates land, cache for offline.
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response.ok) {
        await put(request, response.clone());
        // keep the unversioned shell entry current too, so the offline fallback
        // is never an older build than the page that asked for it
        if (url.search) await put(url.origin + url.pathname, response.clone());
      }
      return response;
    } catch {
      const hit = await caches.match(request, { ignoreSearch: true });
      if (hit) return hit;
      throw new Error("offline and not cached");
    }
  })());
});

async function put(key, response) {
  try {
    const cache = await caches.open(CACHE);
    await cache.put(key, response);
  } catch {
    /* storage full or opaque response: caching is best effort */
  }
}
