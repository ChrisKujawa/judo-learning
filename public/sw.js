const CACHE_VERSION = 'v1';
const CACHE_NAME = `judo-learning-${CACHE_VERSION}`;
const BASE_PATH = '/judo-learning/';
const INDEX_URL = `${BASE_PATH}index.html`;
const APP_SHELL_URLS = [
  BASE_PATH,
  INDEX_URL,
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
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE_PATH)) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheBuildAssets(cache) {
  const response = await fetch(INDEX_URL, { cache: 'reload' });
  if (!response.ok) {
    throw new Error(`App-Shell konnte nicht geladen werden: ${response.status}`);
  }

  await cache.put(INDEX_URL, response.clone());
  const html = await response.text();
  const assetUrls = Array.from(html.matchAll(/(?:href|src)="([^"]+)"/g), ([, url]) => url)
    .filter((url) => url.startsWith(BASE_PATH) && url.includes('/assets/'));

  if (assetUrls.length > 0) {
    await cache.addAll([...new Set(assetUrls)]);
  }
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(INDEX_URL, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(INDEX_URL) || await cache.match(BASE_PATH);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }
  return response;
}
