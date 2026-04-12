/* eslint-disable no-undef */
/**
 * M.O.G. SERVICE WORKER v1.1
 * Handles Background Push Notifications & Client Sync
 */

// 1. Install & Activate - Ensures the SW takes control immediately
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 2. Push Notification Handling
self.addEventListener('push', (event) => {
  let data = {};
  
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.warn('MOG SW: Received push data that was not valid JSON.');
    data = { body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'MINISTRY OF GROOVE';
  const options = {
    body: data.body || 'New operational update received from Command.',
    icon: data.icon || '/logo.png', // Priority to data-driven icons
    badge: '/logo.png',
    tag: data.tag || 'mog-notification',
    renotify: true, // Vibrates/alerts even if same tag is used
    data: { 
      url: data.url || '/dispatch.html',
      timestamp: Date.now()
    },
    actions: [
      { action: 'open', title: 'Open Dispatch' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    vibrate: [100, 50, 100]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 3. Notification Interaction
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;

  notification.close();

  if (action === 'dismiss') {
    return;
  }

  // Handle opening the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const targetUrl = new URL(notification.data?.url || '/dispatch.html', self.location.origin).href;

      // If a window is already open at that URL, focus it
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }

      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
