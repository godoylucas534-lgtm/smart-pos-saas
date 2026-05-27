const CACHE_NAME = 'pos-static-v2';
const STATIC_ASSET_EXTENSIONS = [
  '.js',
  '.css',
  '.html',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.woff',
  '.woff2',
];
const SENSITIVE_PATH_SEGMENTS = ['/api/', '/auth', '/sales', '/cash-register', '/credits', '/users'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/'])).catch(() => undefined),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isSensitivePath = SENSITIVE_PATH_SEGMENTS.some((segment) => url.pathname.includes(segment));
  const isStaticAsset = STATIC_ASSET_EXTENSIONS.some((ext) => url.pathname.endsWith(ext));

  if (!isSameOrigin || isSensitivePath || !isStaticAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      });
    }),
  );
});
