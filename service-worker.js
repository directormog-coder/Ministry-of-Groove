/**
 * MINISTRY OF GROOVE - SECURE SERVICE WORKER v2
 * Purpose: Offline assets, cache management, and OneSignal integration.
 */

const CACHE_NAME = 'mog-v2'; // Changed from v1 to force a browser refresh
const ASSETS = [
  '/',
  '/index.html',
  '/archives.html',
  '/dossier.html',
  '/gallery.html',
  '/terminal.html',
  '/tos.html',
  '/privacy.html',
  '/logo.png',
  '/manifest.json'
];

// 1. Install Phase: Cache the core infrastructure
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[MOG_SW]: Initializing Grid Cache...');
      return cache.addAll(ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// 2. Activate Phase: Cleanup old grid frequencies (v1)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[MOG_SW]: Purging Obsolete Cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
        // Take control of all open pages immediately
        return self.clients.claim();
    })
  );
});

// 3. Fetch Phase: Serve from Cache, fallback to Network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cache if found, otherwise fetch from network
      return response || fetch(event.request).catch(() => {
          // If both fail (offline and not cached), show index
          return caches.match('/index.html');
      });
    })
  );
});

/** * ONESIGNAL INTEGRATION
 * Handles background push notifications even when the app is closed.
 */
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
