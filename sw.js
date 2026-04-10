self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'MINISTRY OF GROOVE';
  const options = {
    body: data.body || 'New operational update received.',
    icon: '/logo.png',
    badge: '/logo.png',
    data: { url: data.url || '/dispatch.html' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
