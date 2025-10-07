const CACHE_NAME = 'auto-quiz-v2';
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
        console.log('✅ Caching assets...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch(error => {
        console.error('❌ Error caching assets:', error);
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
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // Return cached version if available
        }
        return fetch(event.request) // Otherwise fetch from network
          .then(response => {
            // Cache new successful responses
            if (response.ok && response.type === 'basic') {
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
        // Return offline page if both cache and network fail
        return new Response('Offline - No connection available');
      })
  );
});
