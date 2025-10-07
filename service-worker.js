const CACHE_NAME = 'auto-quiz-v3';
const BASE_PATH = '/Project-3'; // GitHub Pages path

const ASSETS_TO_CACHE = [
  // HTML and core assets
  '.',
  'index.html',
  'app.js',
  'style.css',
  'manifest.json',
  'questions.json',
  
  // Images
  'images/accident_sign.png',
  'images/parked_car.png',
  'images/icon-192.png',
  'images/icon-512.png'
].map(path => BASE_PATH + '/' + path);

// Install event - cache all static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => caches.delete(cacheName))
        );
      })
  );
});

// Fetch event with improved image handling
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request)
          .then(response => {
            // Cache successful responses without type checking
            if (response.ok) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
      })
      .catch(() => {
        // Return default offline image if image request fails
        if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
          return caches.match('images/offline-image.png');
        }
        return new Response('Offline content not available');
      })
  );
});
