// Ladwannou — Service Worker
// Caches the app shell (this single-page app) and the pdf-lib script so the
// site keeps working (search, calculators, PDF generation) even with no or
// poor internet connection after the first visit — important for the target
// audience in Haiti where connectivity can be unreliable.

const CACHE_NAME = 'ladwannou-v1';
const URLS_TO_CACHE = [
  './',
  './index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache what we can; don't fail install if one resource (e.g. Google
      // Fonts, which changes URLs) can't be fetched right now.
      return Promise.all(
        URLS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn('SW: could not cache', url, err))
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests; let everything else (if any) pass through.
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Cache-first for speed and offline support, but refresh the cache
      // in the background when online so updates eventually propagate.
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => cached); // offline and not cached: nothing we can do

      return cached || fetchPromise;
    })
  );
});
