const CACHE_NAME = 'hawa-daily-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/admin-manifest.json',
  '/favicon.svg',
  '/HAWA LOGO.jpg',
  '/fonts/Dhivehi.ttf',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestURL = new URL(event.request.url);
  const isUnsupportedDevAsset = requestURL.pathname.startsWith('/@vite')
    || requestURL.pathname.startsWith('/@react-refresh')
    || requestURL.pathname.startsWith('/src/');

  if (isUnsupportedDevAsset) {
    return;
  }

  const isApiRequest = requestURL.pathname.startsWith('/api/') || requestURL.pathname === '/jobs-fallback.json';
  const isNavigationRequest = event.request.mode === 'navigate' || requestURL.pathname === '/';
  const isStaticAsset = /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|json|ttf|woff2?)$/i.test(requestURL.pathname);

  event.respondWith(
    (isApiRequest || isNavigationRequest || isStaticAsset
      ? fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok && (isApiRequest || isNavigationRequest || isStaticAsset)) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch(() => caches.match(event.request).then((cachedResponse) => cachedResponse || caches.match('/favicon.svg')))
      : caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              return caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            })
            .catch(() => caches.match('/favicon.svg'));
        }))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      )
    )
  );
});
