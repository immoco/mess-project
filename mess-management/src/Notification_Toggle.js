import React, { useEffect, useState } from 'react';
import { db } from './firebase'; //
import './css/NotificationToggle.css'; // 

const NotificationToggle = () => {
  const [permission, setPermission] = useState(Notification.permission);
  const [mealPreferences, setMealPreferences] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  useEffect(() => {
    const checkSubscription = async () => {
      // Fetch user preferences from Firestore if already subscribed
      const userDoc = await db.collection('subscribedUsers').doc('<USER_ID>').get(); // Replace <USER_ID> with actual user ID
      if (userDoc.exists) {
        setMealPreferences(userDoc.data().meals || mealPreferences);
      }
    };

    checkSubscription();
  }, []);

  const requestNotificationPermission = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const handleToggle = async (meal) => {
    const updatedMeals = { ...mealPreferences, [meal]: !mealPreferences[meal] };
    setMealPreferences(updatedMeals);

    try {
      await db.collection('subscribedUsers').doc('<USER_ID>').update({
        meals: updatedMeals,
      }); // Update the meal preferences in Firestore
    } catch (error) {
      console.error('Error updating meal preferences:', error);
    }
  };

  return (
    <div className="notification-toggle">
      {permission !== 'granted' && (
        <div className="notification-prompt">
          <p>Please enable notifications for meal reminders.</p>
          <button onClick={requestNotificationPermission}>Enable Notifications</button>
        </div>
      )}
      {permission === 'granted' && (
        <div className="meal-preferences">
          <h3>Meal Preferences</h3>
          <label>
            Breakfast
            <input
              type="checkbox"
              checked={mealPreferences.breakfast}
              onChange={() => handleToggle('breakfast')}
            />
          </label>
          <label>
            Lunch
            <input
              type="checkbox"
              checked={mealPreferences.lunch}
              onChange={() => handleToggle('lunch')}
            />
          </label>
          <label>
            Dinner
            <input
              type="checkbox"
              checked={mealPreferences.dinner}
              onChange={() => handleToggle('dinner')}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default NotificationToggle;
