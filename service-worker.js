/* ═══════════════════════════════════════════════════════════
   M.O.G. SERVICE WORKER v6.0.0 — BROADCAST EDITION
   Cache-first for assets, network-first for API
   Uplink Reliability: Active
═══════════════════════════════════════════════════════════ */

// 1. Increment Version to v6 to force update across all devices
const CACHE_VERSION = 'mog-v6';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// 2. Updated Asset List (Ensure frequency.html and new JS are here)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/pages/frequency.html',
  '/pages/directorate.html',
  '/css/style.css',
  '/js/auth.js',
  '/js/app.js',
  '/js/config.js',
  '/js/supabase-client.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap',
];

/* ── Install: Pre-cache the new UI ── */
self.addEventListener('install', e => {
  console.log('[M.O.G. SW] Installing v6.0.0 Uplink...');
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS).catch(err => {
      console.warn('[M.O.G. SW] Pre-cache warning:', err);
    }))
  );
});

/* ── Activate: Nukes v3/v5 caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE)
            .map(k => {
                console.log('[M.O.G. SW] Purging Legacy Cache:', k);
                return caches.delete(k);
            })
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch strategy ── */
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // CRITICAL UPGRADE: Never cache the Broadcast API or Supabase Auth
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
    return; // Bypass Service Worker entirely
  }

  // Skip non-GET
  if (request.method !== 'GET') return;

  // Static assets: cache-first with network fallback
  if (STATIC_ASSETS.some(a => request.url.includes(a)) || url.pathname.match(/\.(png|jpg|webp|svg|ico|woff2?|css)$/)) {
    e.respondWith(
      caches.match(request).then(cached => {
        return cached || fetch(request).then(res => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then(c => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // HTML pages: Network-first (Ensures you see the "Live" badge immediately)
  if (request.headers.get('accept')?.includes('text/html')) {
    e.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(DYNAMIC_CACHE).then(c => c.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Default Strategy: Stale-While-Revalidate
  e.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(res => {
        if (res.status === 200) {
            caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        }
        return res;
      }).catch(() => null);
      return cached || networkFetch;
    })
  );
});

/* ── Push Notifications ── */
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'M.O.G. Network', body: 'New transmission received.' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/images/logo.png',
      badge: '/assets/images/logo.png',
      vibrate: [200, 100, 200],
      data: { url: data.url || '/pages/frequency.html' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(cs => {
      const url = e.notification.data?.url || '/';
      for (const client of cs) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      return clients.openWindow(url);
    })
  );
});
