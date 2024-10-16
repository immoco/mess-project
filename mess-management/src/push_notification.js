import React from 'react';

const NotificationComponent = () => {
  const subscribeToNotifications = async () => {
    // Request permission for notifications
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BKmzKoRVsgYU6M_5JYvk_Qjn93jcg4kx_lUExRo-nHGehSOr8uj2XA1UBEUKgU2LHKcuKG-hkyZeQjhqBIg_R3w', // Replace with your VAPID key
        });

        const user = {
            email: 'immocompany01@gmail.com',  // Replace with the variable holding the user's email
            displayName: 'IMMO',  // Replace with the variable holding the user's display name
            subscription: subscription // Your existing subscription object
          };

        // Send subscription to the backend
        await fetch('https://notify-backend-47z5.onrender.com/subscribe', {
          method: 'POST',
          body: JSON.stringify(user),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('User subscribed to notifications!', subscription);
      } catch (error) {
        console.error('Subscription failed:', error);
      }
    } else if (permission === 'denied') {
      console.log('Notification permission denied.');
    } else {
      console.log('Notification permission dismissed.');
    }
  };

  return (
    <div>
      <button onClick={subscribeToNotifications}>
        Subscribe to Notifications
      </button>
    </div>
  );
};

export default NotificationComponent;
