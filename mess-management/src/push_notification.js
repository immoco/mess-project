export const subscribeToNotifications = async (user) => {
    // Request permission for notifications
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: 'BKmzKoRVsgYU6M_5JYvk_Qjn93jcg4kx_lUExRo-nHGehSOr8uj2XA1UBEUKgU2LHKcuKG-hkyZeQjhqBIg_R3w', // Replace with your VAPID key
        });

        const userData = {
            email: user.email,  // Replace with the variable holding the user's email
            displayName: user.displayName,  // Replace with the variable holding the user's display name
            subscription: subscription // Your existing subscription object
          };

        // Send subscription to the backend
        await fetch('https://notify-backend-47z5.onrender.com/subscribe', {
          method: 'POST',
          body: JSON.stringify(userData),
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


  export const unsubscribeFromNotifications = async (user) => {
    try {
      // Assuming the user has a service worker registration
      const registration = await navigator.serviceWorker.ready;
  
      // Get the current subscription
      const subscription = await registration.pushManager.getSubscription();
  
      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();
  
        // Send the request to remove the subscription from the backend
        await fetch('https://notify-backend-47z5.onrender.com/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ email: user.email }),  // Pass user email to identify the subscription
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        console.log('User unsubscribed from notifications!');
      } else {
        console.log('No subscription found for the user.');
      }
    } catch (error) {
      console.error('Unsubscription failed:', error);
    }
  };
  