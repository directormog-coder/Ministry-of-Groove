/**
 * M.O.G. SERVICE WORKER — v4.0
 * ==============================
 * Cache strategy:
 *   - App shell (HTML/JS/CSS)  → Network first, cache fallback
 *   - Static assets (images)   → Cache first, network fallback
 *   - /api/*                   → Network only (never cache credentials)
 *   - External CDN scripts     → Cache first, stale-while-revalidate
 */

const CACHE_VERSION  = 'mog-v4';
const SHELL_CACHE    = `${CACHE_VERSION}-shell`;
const ASSET_CACHE    = `${CACHE_VERSION}-assets`;
const CDN_CACHE      = `${CACHE_VERSION}-cdn`;

// App shell — always network-first, cached for offline fallback
const SHELL_URLS = [
    '/',
    '/index.html',
    '/login.html',
    '/pages/gallery.html',
    '/pages/frequency.html',
    '/pages/dispatch.html',
    '/pages/archives.html',
    '/pages/dossier.html',
    '/pages/privacy.html',
    '/pages/tos.html',
    '/js/config.js',
    '/js/supabase-client.js',
    '/js/auth.js',
    '/js/crypto-utils.js',
];

// CDN scripts — cache aggressively, they rarely change
const CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
    'https://unpkg.com/lucide@latest',
];

// ── INSTALL ────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
    console.log(`[MOG SW] Installing ${CACHE_VERSION}`);
    event.waitUntil(
        Promise.all([
            // Shell: cache as many as possible, ignore individual failures
            caches.open(SHELL_CACHE).then(cache =>
                Promise.allSettled(SHELL_URLS.map(url => cache.add(url)))
            ),
            // CDN: cache external scripts
            caches.open(CDN_CACHE).then(cache =>
                Promise.allSettled(CDN_URLS.map(url => cache.add(url)))
            ),
        ]).then(() => {
            console.log('[MOG SW] Install complete — assets archived');
            self.skipWaiting(); // Activate immediately
        })
    );
});

// ── ACTIVATE & PURGE OLD CACHES ────────────────────────────────────
self.addEventListener('activate', (event) => {
    const KNOWN_CACHES = [SHELL_CACHE, ASSET_CACHE, CDN_CACHE];
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => !KNOWN_CACHES.includes(key))
                    .map(key => {
                        console.log(`[MOG SW] Purging deprecated cache: ${key}`);
                        return caches.delete(key);
                    })
            )
        ).then(() => self.clients.claim()) // Take control of all tabs immediately
    );
});

// ── FETCH ──────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 1. Never cache API calls — always go to network
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(fetch(request));
        return;
    }

    // 2. Never cache Supabase requests
    if (url.hostname.includes('supabase.co') || url.hostname.includes('supabase.in')) {
        event.respondWith(fetch(request));
        return;
    }

    // 3. CDN scripts — cache first, network fallback
    if (CDN_URLS.some(cdn => request.url.startsWith(cdn.split('@')[0]))) {
        event.respondWith(
            caches.open(CDN_CACHE).then(cache =>
                cache.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(response => {
                        if (response.ok) cache.put(request, response.clone());
                        return response;
                    });
                })
            )
        );
        return;
    }

    // 4. Static assets (images, fonts) — cache first
    if (
        url.pathname.startsWith('/assets/') ||
        url.pathname.startsWith('/css/') ||
        request.destination === 'image' ||
        request.destination === 'font'
    ) {
        event.respondWith(
            caches.open(ASSET_CACHE).then(cache =>
                cache.match(request).then(cached => {
                    if (cached) return cached;
                    return fetch(request).then(response => {
                        if (response.ok) cache.put(request, response.clone());
                        return response;
                    }).catch(() => cached); // Return stale if network fails
                })
            )
        );
        return;
    }

    // 5. App shell — network first, cache fallback
    event.respondWith(
        fetch(request)
            .then(response => {
                if (response.ok && request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(SHELL_CACHE).then(cache => cache.put(request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(request).then(cached => {
                    if (cached) return cached;
                    // Final fallback — serve index.html for navigation requests
                    if (request.destination === 'document') {
                        return caches.match('/index.html');
                    }
                    return new Response('Offline', { status: 503 });
                })
            )
    );
});

// ── MESSAGE HANDLER ────────────────────────────────────────────────
// Allow pages to send 'SKIP_WAITING' to force SW update
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
