const CACHE_NAME = 'bolbaat-v2';
const ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/app.js',
  './js/storage.js',
  './js/scenarios.js',
  './js/ai.js',
  './js/chat.js',
  './js/voice.js',
  './js/wordbank.js',
  './js/grammar.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Don't cache API calls
  if (
    e.request.url.includes('googleapis.com') ||
    e.request.url.includes('openai.com') ||
    e.request.url.includes('anthropic.com')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cached) => cached || fetch(e.request))
  );
});
