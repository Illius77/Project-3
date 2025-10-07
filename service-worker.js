const CACHE_NAME = 'auto-quiz-v1';
const urlsToCache = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.json',
  './questions.json',
  './images/accident_sign.png',
  './images/parked_car.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
