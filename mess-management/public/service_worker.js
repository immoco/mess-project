self.addEventListener('push', event => {
    const data = event.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/logo.png',
    });
  });
  
  self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(
      clients.openWindow('https://mess-management-25.web.app/') // Redirect after clicking
    );
  });
  