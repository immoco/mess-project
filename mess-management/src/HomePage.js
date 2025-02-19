import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Modal from './Modal';
import { db, collection, query, where, getDocs } from './firebase'; // Ensure you have the correct path to your firebase configuration
import './css/HomePage.css'; // Create a CSS file for styles
import {Himalaya, Nilgiri, Canteen} from './mess_images'
import Mess from "./assets/Mess.png";
import Map from "./assets/Map_Nav.png";
import Remind from "./assets/Remind.png";
import Instructions from "./assets/Instructions.png"
import { subscribeToNotifications, unsubscribeFromNotifications, initializeDeviceId } from './push_notification';

const greetings = {
  English: {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    night: 'Good Night',
  },
  Tamil: {
    morning: 'இனிய காலை வணக்கம்',
    afternoon: 'இனிய மதிய வணக்கம்',
    evening: 'இனிய மாலை வணக்கம்',
    night: 'இனிய இரவு வணக்கம்',
  },
  Hindi: {
    morning: 'शुभ प्रभात',
    afternoon: 'शुभ दोपहर',
    evening: 'शुभ संध्या',
    night: 'शुभ रात्रि',
  },
  // Add more languages as needed
};


const getGreeting = (hour, language) => {
  const langGreetings = greetings[language] || greetings['English'];
  if (hour >= 5 && hour < 12) return langGreetings.morning;
  if (hour >= 12 && hour < 17) return langGreetings.afternoon;
  if (hour >= 17 && hour < 21) return langGreetings.evening;
  return langGreetings.night;
};

const nextMeal = ()=> {
  const now = new Date();
  const hour = now.getHours();


  if (hour >= 19 || hour < 7) return 'Breakfast';
  if (hour >= 7 && hour < 12) return 'Lunch';
  if (hour >= 12 && hour < 19) return 'Dinner';
}

const HomePage = ({ user}) => {
  const [messName, setMessName] = useState('');
  const [messImage, setMessImage] = useState('');
  const [messLocation, setMessLocation] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [language, setLanguage] = useState('English');


  const [attendance, setAttendance] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [loading, setLoading] = useState(true);

  // States for Reminder toggle
  const [remindMe, setRemindMe] = useState(false);
  const [notificationModal, setNotificationModal] = useState(false);

  const handleOpenModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleToggleReminder = () => {
    if (remindMe === false) {
      subscribeToNotifications(user)
    }
    else{
      unsubscribeFromNotifications()
    }
    setRemindMe(!remindMe);
    // Add logic to handle notification state on the backend if necessary
  };

  const deviceId = initializeDeviceId()

  useEffect(() => {
    const fetchReminderState = async () => {
      try {
        // Reference to the 'subscribedUsers' collection
        const subscriptionRef = collection(db, 'subscribedUsers');

        const q = query(subscriptionRef, where('device_id', '==', deviceId));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            const userData = doc.data();
            // Check if 'reminder_state' is true and update the state
            if (userData.reminder_state === true) {
              setRemindMe(userData.reminder_state);
            }
          });
        }
      } catch (error) {
        console.error('Error fetching reminder state:', error);
      }
    };

    if (deviceId) {
      fetchReminderState();
    }
  }, [deviceId]);

  useEffect(() => {
    const fetchLanguage = async () => {
      const userDoc = doc(db, 'students', user.email);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        setLanguage(userData.language || 'English');
      }
    };
    fetchLanguage();
  }, [user.email]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = getGreeting(hour, language);

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'students', user.email));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setMessName(userData.messName);
          const messDoc = await getDoc(doc(db, 'mess', userData.messName));
          if (messDoc.exists){
            console.log(messDoc.data());
            setMessLocation(messDoc.data().messLocation);
            setMessImage(messDoc.data().messName);
          }
        }
      } catch (error) {
        console.error('Error fetching user mess details:', error);
      }
    };

    fetchMessDetails();
  }, [user.email]);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const q = query(collection(db, 'attendance'), where('studentEmail', '==', user.email));
        const querySnapshot = await getDocs(q);
        const userAttendance = {
          breakfast: false,
          lunch: false,
          dinner: false,
        };

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const mealTimestamp = data.timestamp ? data.timestamp.toDate() : null; // Convert Firestore timestamp to JavaScript Date
          const mealDate = mealTimestamp.toDateString(); // Get the date part
          const currentDate = new Date().toDateString(); // Get the current date part

          if (data.meal === 'BREAKFAST' && mealDate === currentDate) userAttendance.breakfast = true;
          if (data.meal === 'LUNCH' && mealDate === currentDate) userAttendance.lunch = true;
          if (data.meal === 'DINNER' && mealDate === currentDate) userAttendance.dinner = true;
        });

        console.log(userAttendance.breakfast)
        console.log(userAttendance.lunch)
        console.log(userAttendance.dinner)

        setAttendance(userAttendance);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user.email]);

  if (loading) return <p>Loading...</p>;
  const currentHour = new Date().getHours(); // Get the current hour
let mealMessage;
if (attendance.breakfast && currentHour < 11) { // Assuming breakfast is until 11 AM
  mealMessage = <p>Hope you had a healthy Breakfast.</p>;
} else if (!attendance.breakfast && currentHour < 11) {
  mealMessage = <p>Have your breakfast now!</p>;
} else if (attendance.lunch && currentHour >= 12 && currentHour < 16) { // Assuming lunch is between 11 AM and 5 PM
  mealMessage = <p>Hope you had a healthy Lunch.</p>;
} else if (!attendance.lunch && currentHour >= 12 && currentHour < 16) {
  mealMessage = <p>Have your Lunch now!</p>;
  console.log(attendance.lunch)
} else if (attendance.dinner && currentHour >= 19) { // Assuming dinner starts at 5 PM
  mealMessage = <p>Hope you had a healthy Dinner.</p>;
} else if (!attendance.dinner && currentHour >= 19) {
  mealMessage = <p>Have your Dinner now!</p>;
}

const UserProfile = () => (
  <div className="user-profile">
    <div className="profile-info">
      <h3>{greeting}, {user.displayName}</h3>
      {mealMessage}
    </div>
    <img src={user.photoURL} alt="userProfile" className="profile-image" />
  </div>
);

const ImageComponent = ({ imageName }) => {
  // Select the image based on the `imageName` prop
  const images = { Himalaya, Nilgiri, Canteen}; // Add other images if needed
  return (
      <img src={images[imageName]} alt={imageName} />
  );
};  


  return (
    <div className="homepage">
      <UserProfile />
      <div className="box-container">
        <div className="box" onClick={() => handleOpenModal('messDetails')}>
        My Dining Hall
        <img src={Mess} alt="My Dining Hall" className="box-image" />
        </div>
        <a className="box" href={messLocation} target="_blank" rel="noopener noreferrer">
          Navigate Me
          <img src={Map} alt="Map" className="box-image" />
        </a>
        <div className="box" onClick={() => setNotificationModal(true)}>
          Remind Me!
          <img src={Remind} alt="Remind" className="box-image" />
        </div>

        {/* Notification Toggle Modal */}
      {notificationModal && (
        <Modal show={notificationModal} handleClose={() => setNotificationModal(false)}>
        <div className="reminder-modal">
          <h2>Set Reminder</h2>
            <p>Do you want to receive notifications?</p>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="remindToggle" 
                checked={remindMe} 
                onChange={handleToggleReminder} 
              />
              <label htmlFor="remindToggle" className="switch">
                <span className="slider"></span>
                <span className="status">{remindMe ? "On" : "Off"}</span>
              </label>
            </div>
            <p>We will remind you for {nextMeal()}</p>
        </div>
        </Modal>
      )}

        <div className="box" onClick={() => handleOpenModal('instructions')}>
          Instructions
          <img src={Instructions} alt="Instructions" className="box-image" />
        </div>
      </div>

      <Modal show={showModal} handleClose={handleCloseModal}>
      {modalContent === 'instructions' && (
      <>
      <h2>How to Use This Web App</h2>
      <p>Welcome to the Mess Management Web App! Here are the steps to use this application:</p>
      <div className="instructions-container">
        <div className="instruction-point left">
          <h3>1. Logging In</h3>
          <p>To get started, please log in using your Google account. Click on the "Sign in with Google" button on the main page.</p>
        </div>
        <div className="instruction-point right">
          <h3>2. QR Code Scanning</h3>
          <p>To mark your attendance, go to the QR Code Scanner tab and scan the QR code available at the mess. The system will automatically record your attendance.</p>
        </div>
        <div className="instruction-point left">
          <h3>3. Viewing Attendance</h3>
          <p>You can view your attendance record by navigating to the Attendance Card tab. This will display your attendance history, including the dates and times of your meals.</p>
        </div>
        <div className="instruction-point right">
          <h3>4. Codeword Input</h3>
          <p>If you are unable to scan the QR code, you can use the Codeword Input tab. Enter the provided codeword to mark your attendance.</p>
        </div>
        <div className="instruction-point left">
          <h3>5. User Profile</h3>
          <p>Your profile information, including your display name and email, can be viewed in the Home tab. You can also see a greeting message based on the time of day and the current meal details.</p>
        </div>
        <div className="instruction-point right">
          <h3>6. Notifications</h3>
          <p>You will receive notifications reminding you to have your meals. Ensure notifications are enabled in your browser settings to stay updated.</p>
        </div>
        <div className="instruction-point left">
          <h3>7. Feedback</h3>
          <p>We value your feedback! Click the button below to provide your feedback on the application.</p>
        </div>
      </div>
      <button className="feedback-button" onClick={() => window.open('https://messmanagementfeedbackform.paperform.co', '_blank')}>Give Feedback</button>
    </>
        )}
        {modalContent === 'messDetails' && (
          <>
            <h2>My Dining Hall</h2>
            <ImageComponent imageName={messImage} />
            <p><b>{messName}</b></p>
            <p>Mess Location: {messLocation}</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
