/* ═══════════════════════════════════════════════════
   M.O.G. SERVICE WORKER v3.0
   Cache-first for assets, network-first for API
   Background sync, push notifications
═══════════════════════════════════════════════════ */

const CACHE_VERSION = 'mog-v3';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/login.html',
  '/pages/directorate.html',
  '/assets/images/logo.png',
  '/js/config.js',
  '/js/supabase-client.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://unpkg.com/alpinejs@3.x.x/dist/cdn.min.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap',
];

/* ── Install ── */
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS).catch(() => {}))
  );
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE && k !== DYNAMIC_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch strategy ── */
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and Supabase API calls (always network)
  if (request.method !== 'GET') return;
  if (url.hostname.includes('supabase.co')) return;

  // Static assets: cache-first
  if (STATIC_ASSETS.some(a => request.url.includes(a)) || url.pathname.match(/\.(png|jpg|webp|svg|ico|woff2?|css)$/)) {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(STATIC_CACHE).then(c => c.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // HTML pages: network-first with cache fallback
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

  // Default: stale-while-revalidate
  e.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(res => {
        caches.open(DYNAMIC_CACHE).then(c => c.put(request, res.clone()));
        return res;
      });
      return cached || networkFetch;
    })
  );
});

/* ── Push Notifications ── */
self.addEventListener('push', e => {
  const data = e.data?.json() || { title: 'M.O.G. Network', body: 'New transmission received.' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'M.O.G. Network', {
      body: data.body || 'New transmission',
      icon: '/assets/images/logo.png',
      badge: '/assets/images/logo.png',
      tag: data.tag || 'mog-push',
      renotify: true,
      vibrate: [100, 50, 100],
      data: { url: data.url || '/index.html' },
      actions: [
        { action: 'open',    title: 'Open Hub' },
        { action: 'dismiss', title: 'Dismiss'  },
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cs => {
      const url = e.notification.data?.url || '/index.html';
      const existing = cs.find(c => c.url.includes(url));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});

/* ── Background Sync ── */
self.addEventListener('sync', e => {
  if (e.tag === 'mog-activity-sync') {
    e.waitUntil(syncOfflineActivity());
  }
});

async function syncOfflineActivity() {
  // Flush any queued offline actions when connectivity returns
  try {
    const cache = await caches.open('mog-offline-queue');
    const keys  = await cache.keys();
    for (const req of keys) {
      await fetch(req);
      await cache.delete(req);
    }
  } catch(_) {}
}
