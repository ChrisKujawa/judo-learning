const CACHE_VERSION = 'v1';
const CACHE_NAME = `judo-learning-${CACHE_VERSION}`;
const SCOPE_URL = new URL(self.registration.scope);
const BASE_PATH = SCOPE_URL.pathname.endsWith('/') ? SCOPE_URL.pathname : `${SCOPE_URL.pathname}/`;
const BASE_PATH_WITHOUT_TRAILING_SLASH = BASE_PATH.replace(/\/$/, '');
const INDEX_URL = `${BASE_PATH}index.html`;
const APP_SHELL_URLS = [
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}icons/icon.svg`,
  `${BASE_PATH}icons/icon-192.png`,
  `${BASE_PATH}icons/icon-512.png`,
  `${BASE_PATH}icons/maskable-512.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL_URLS);
      await cacheBuildAssets(cache);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('judo-learning-') && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isAppPath =
    url.pathname === BASE_PATH_WITHOUT_TRAILING_SLASH ||
    url.pathname.startsWith(BASE_PATH);

  if (url.origin !== self.location.origin || !isAppPath) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, event));
});

async function cacheBuildAssets(cache) {
  const response = await fetch(INDEX_URL, { cache: 'reload' });
  if (!response.ok) {
    throw new Error(`App-Shell konnte nicht geladen werden: ${response.status}`);
  }

  await cacheIndexAndBuildAssets(cache, response);
}

async function cacheIndexAndBuildAssets(cache, response) {
  const indexResponse = response.clone();
  const html = await response.text();
  const assetUrls = Array.from(html.matchAll(/(?:href|src)="([^"]+)"/g), ([, url]) => url)
    .filter((url) => url.startsWith(BASE_PATH) && url.includes('/assets/'));

  if (assetUrls.length > 0) {
    await Promise.all([...new Set(assetUrls)].map((assetUrl) => cacheBuildAsset(cache, assetUrl)));
  }

  await cache.put(INDEX_URL, indexResponse);
}

async function cacheBuildAsset(cache, assetUrl) {
  const cached = await cache.match(assetUrl);
  if (cached) return;

  try {
    const response = await fetch(assetUrl);
    if (!response.ok) {
      console.warn(`Build-Asset konnte nicht zwischengespeichert werden: ${assetUrl}`);
      return;
    }

    await cache.put(assetUrl, response);
  } catch (error) {
    console.warn(`Build-Asset konnte nicht zwischengespeichert werden: ${assetUrl}`, error);
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cacheIndexAndBuildAssets(cache, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(INDEX_URL) || await cache.match(BASE_PATH);
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const refresh = fetch(request).then(async (response) => {
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  });

  if (cached) {
    event.waitUntil(refresh.catch(() => undefined));
    return cached;
  }

  return refresh;
}
