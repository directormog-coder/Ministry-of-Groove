/**
 * MINISTRY OF GROOVE | OFFLINE SHIELD (SERVICE WORKER)
 * VERSION: 2.0.26
 * FREQUENCY: eMalahleni Master Grid
 */

const CACHE_NAME = 'mog-cache-v2';
const OFFLINE_URL = '404.html';

// Assets to cache for immediate offline access
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style.css',
    '/logo.png',
    '/404.html',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

// 1. INSTALLATION: Warm up the cache
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[MOG_SW]: GRID_ASSETS_CACHED');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// 2. ACTIVATION: Purge old frequencies (caches)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[MOG_SW]: PURGING_OLD_FREQUENCY:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. FETCH: Intercept signals and serve from cache if offline
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests (like Supabase POST/INSERT)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached asset or fetch from network
            return response || fetch(event.request).catch(() => {
                // If both fail and it's a page navigation, show 404/Offline
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
            });
        })
    );
});

// 4. ONESIGNAL INTEGRATION
// This allows the OneSignal SDK to handle background notifications
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');
