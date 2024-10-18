import { v4 as uuidv4 } from 'uuid'; // Import the uuid library

// Function to initialize or retrieve the device ID
export const initializeDeviceId = () => {
    // Check if a device ID already exists in localStorage
    let deviceId = localStorage.getItem('deviceId');

    // If no device ID exists, generate a new one and store it
    if (!deviceId) {
        deviceId = uuidv4(); // Generate a new UUID
        localStorage.setItem('deviceId', deviceId); // Store it in localStorage
    }

    return deviceId; // Return the device ID
};

// Usage
const deviceId = initializeDeviceId();

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
            subscription: subscription,
            device_id:deviceId, // Your existing subscription object
            reminder_state: true
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


  export const unsubscribeFromNotifications = async () => {
    try {
      const deviceId = localStorage.getItem('deviceId');
       if (deviceId){
        const payload = {
          device_id: deviceId
        }

        // Send the request to remove the subscription from the backend
        await fetch('https://notify-backend-47z5.onrender.com/unsubscribe', {
          method: 'POST',
          body: JSON.stringify(payload),  // Pass user email to identify the subscription
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
  