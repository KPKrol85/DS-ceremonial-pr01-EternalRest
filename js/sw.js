// Eternal Rest service worker (PWA-SW-01). `npm run build` turns this file into dist/sw.js:
// the serviceWorker() plugin in vite.config.js replaces the precache manifest placeholder
// below with the cache version and the URLs of the offline page and the files it needs.
// js/main.js registers the worker only in the production build.

const { version: VERSION, urls: PRECACHE_URLS } = __PRECACHE_MANIFEST__;

// Every cache name carries the version, so a new deployment fills its own caches and the
// old ones stay intact for open pages until the new worker activates and removes them.
const CACHE_PREFIX = "eternal-rest-";
const PRECACHE = `${CACHE_PREFIX}precache-${VERSION}`;
const PAGES = `${CACHE_PREFIX}pages-${VERSION}`;
const RUNTIME = `${CACHE_PREFIX}runtime-${VERSION}`;
const CURRENT_CACHES = new Set([PRECACHE, PAGES, RUNTIME]);

const OFFLINE_URL = "/offline.html";
const ASSETS_PATH = "/assets/";
// Upper bounds of the runtime caches; the oldest entries are removed first.
const MAX_PAGES = 20;
const MAX_RUNTIME_ENTRIES = 40;

const precachedPaths = new Set(PRECACHE_URLS);

// Only complete, same-origin, non-redirected responses are stored.
const isStorable = (response) =>
  response.status === 200 && response.type === "basic" && !response.redirected;

const isHtml = (response) =>
  (response.headers.get("Content-Type") ?? "").includes("text/html");

// Pages are stored by path: "/" equals "/index.html", and a query does not change the page.
// Netlify also serves each page without its extension, so "/services" equals "/services.html".
const pageKey = (requestUrl) => {
  const { origin, pathname } = new URL(requestUrl);
  if (pathname.endsWith("/")) return `${origin}${pathname}index.html`;
  const name = pathname.slice(pathname.lastIndexOf("/") + 1);
  return origin + (name.includes(".") ? pathname : `${pathname}.html`);
};

// Removes the oldest entries; Cache Storage keeps entries in the order they were stored.
const trimCache = async (cache, maxEntries) => {
  const keys = await cache.keys();
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - maxEntries))
      .map((key) => cache.delete(key)),
  );
};

// Runtime caching is best effort: a full or blocked storage must not break the response.
const store = async (cacheName, key, response, maxEntries) => {
  try {
    const cache = await caches.open(cacheName);
    await cache.put(key, response);
    await trimCache(cache, maxEntries);
  } catch {
    // The response was already delivered; it is simply not available offline.
  }
};

const precache = async () => {
  const cache = await caches.open(PRECACHE);
  try {
    await Promise.all(
      PRECACHE_URLS.map(async (url) => {
        // Revalidate with the server so an outdated HTTP cache copy is not stored.
        const response = await fetch(url, { cache: "no-cache" });
        if (response.status !== 200 || response.type !== "basic") {
          throw new Error(
            `Precache request failed: ${url} (${response.status})`,
          );
        }
        // A redirected response cannot answer a navigation, so a clean copy is stored.
        await cache.put(
          url,
          response.redirected
            ? new Response(await response.blob(), {
                headers: response.headers,
              })
            : response,
        );
      }),
    );
  } catch (error) {
    // An incomplete precache is discarded; the browser retries the installation later.
    await caches.delete(PRECACHE);
    throw error;
  }
};

// Stores the pages that were open before this worker could control them, such as the
// first page of a visit, so that they are also available offline.
const storeOpenPages = async () => {
  const windows = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });
  const keys = new Set(
    windows
      .map(({ url }) => url)
      .filter((url) => new URL(url).origin === self.location.origin)
      .map(pageKey),
  );
  await Promise.all(
    [...keys].map(async (key) => {
      try {
        const response = await fetch(key);
        if (isStorable(response) && isHtml(response)) {
          await store(PAGES, key, response, MAX_PAGES);
        }
      } catch {
        // Offline or unreachable: the page is stored on its next visit instead.
      }
    }),
  );
};

self.addEventListener("install", (event) => {
  // No skipWaiting(): a new version waits until no page uses the previous one.
  event.waitUntil(precache());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) =>
              name.startsWith(CACHE_PREFIX) && !CURRENT_CACHES.has(name),
          )
          .map((name) => caches.delete(name)),
      );
      await storeOpenPages();
      await self.clients.claim();
    })(),
  );
});

// Network first: a page from the server, stored for later; without a connection, the stored
// copy of that page or, when there is none, the offline page. HTTP errors such as 404 are
// passed on unchanged and never stored.
const handleNavigation = async (event) => {
  const { request } = event;
  const key = pageKey(request.url);
  try {
    const response = await fetch(request);
    if (isStorable(response) && isHtml(response)) {
      event.waitUntil(store(PAGES, key, response.clone(), MAX_PAGES));
    }
    return response;
  } catch {
    const cached =
      (await caches.match(key, { cacheName: PAGES })) ??
      (await caches.match(OFFLINE_URL, { cacheName: PRECACHE }));
    return cached ?? Response.error();
  }
};

const handlePrecached = async (request, pathname) =>
  (await caches.match(pathname, { cacheName: PRECACHE })) ?? fetch(request);

// Built files in /assets/ have content hashes in their names and never change, so a stored
// copy is always current; files not precached are stored on first use.
const handleAsset = async (event) => {
  const { request } = event;
  const cached = await caches.match(request, { cacheName: RUNTIME });
  if (cached) return cached;
  const response = await fetch(request);
  if (isStorable(response)) {
    event.waitUntil(
      store(RUNTIME, request, response.clone(), MAX_RUNTIME_ENTRIES),
    );
  }
  return response;
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Form submissions and every other non-GET request go to the network untouched.
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // External resources are not handled or stored.
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));
  } else if (precachedPaths.has(url.pathname)) {
    event.respondWith(handlePrecached(request, url.pathname));
  } else if (url.pathname.startsWith(ASSETS_PATH)) {
    event.respondWith(handleAsset(event));
  }
});
