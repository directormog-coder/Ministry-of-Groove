// 1. Import OneSignal SDK first for Push Notification Support
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// 2. Define Cache Constants
const CACHE_NAME = 'mog-ncc-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

// 3. Install Service Worker & Cache Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('NCC Local Cache: Initializing Assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// 4. Activate & Clean Old Caches (Version Control)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  console.log('NCC Local Cache: Active and Cleaned.');
});

// 5. Fetch Strategy: Cache-First, falling back to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached asset if found, otherwise fetch from National Grid (Network)
      return response || fetch(event.request);
    })
  );
});
