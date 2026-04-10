/**
 * M.O.G. SERVICE WORKER v1.0
 * Handles Background Push Notifications
 */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MINISTRY OF GROOVE';
  const options = {
    body: data.body || 'New operational update received from Command.',
    icon: '/logo.png',
    badge: '/logo.png',
    tag: data.tag || 'message',
    data: { url: data.url || '/dispatch.html' },
    actions: [
      { action: 'open', title: 'Open Dispatch' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data?.url || '/dispatch.html';
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
