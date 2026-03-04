const CACHE_NAME = 'mog-hq-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/tos.html',
  '/privacy.html',
  '/manifest.json',
  '/logo.png',
  '/404.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Direct Supabase and OneSignal calls to network only
  if (event.request.url.includes('supabase.co') || event.request.url.includes('onesignal')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
