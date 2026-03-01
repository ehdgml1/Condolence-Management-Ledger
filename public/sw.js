// Service Worker for 축의금 관리 대장
// Strategy: Network first for navigations, Cache first for static assets

const CACHE_NAME = 'wedding-app-v3';
const STATIC_CACHE = 'wedding-static-v3';

const APP_SHELL_ROUTES = [
  '/',
  '/login',
];

const STATIC_EXTENSIONS = [
  '.woff2',
  '.woff',
  '.ttf',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.ico',
  '.webp',
];

// Install: pre-cache app shell routes
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL_ROUTES).catch((err) => {
        console.warn('[SW] Pre-caching failed for some routes:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !currentCaches.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper: is this a static asset request?
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));
}

// Helper: is this a navigation request?
function isNavigation(request) {
  return request.mode === 'navigate';
}

// Strategy: Network first, fall back to cache
async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (isNavigation(request)) {
      const rootCache = await caches.open(CACHE_NAME);
      return rootCache.match('/') || new Response('오프라인입니다', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    throw new Error('Network and cache both failed');
  }
}

// Strategy: Cache first, fall back to network
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    throw new Error('Cache miss and network failed');
  }
}

// Fetch handler
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Static assets: cache first
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Next.js static files (_next/static): cache first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Page navigations and Next.js data: network first
  if (isNavigation(event.request) || url.pathname.startsWith('/_next/')) {
    event.respondWith(networkFirst(event.request, CACHE_NAME));
    return;
  }

  // Default: network first
  event.respondWith(networkFirst(event.request, CACHE_NAME));
});

// Listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data?.type === 'CLEAR_AUTH_CACHE') {
    caches.keys().then(names => Promise.all(names.map(name => caches.delete(name))));
  }
});
