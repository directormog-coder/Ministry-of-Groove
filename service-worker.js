const CACHE_NAME = 'mog-v2';
const ASSETS = ['/', '/index.html', '/tos.html', '/privacy.html', '/logo.png', '/manifest.json'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('supabase.co')) return;
  e.respondWith(caches.match(e.request).then((res) => res || fetch(e.request)));
});
