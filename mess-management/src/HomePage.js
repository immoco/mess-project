import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import Modal from './Modal';
import { db, collection, query, where, getDocs } from './firebase'; // Ensure you have the correct path to your firebase configuration
import './css/HomePage.css'; // Create a CSS file for styles
import HimalayaMessImage from "./assets/Himalaya_Mess.png"
import Mess from "./assets/Mess.png";
import Map from "./assets/Map.png";
import Remind from "./assets/Remind.png";

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

const HomePage = ({ user}) => {
  const [messName, setMessName] = useState('');
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
    setRemindMe(!remindMe);
    // Add logic to handle notification state on the backend if necessary
  };

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
          setMessLocation(userData.messLocation);
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
        <p>Current Meal</p>
        <p>Today's Breakfast is Dosa & Toasted Bread with Jammy.</p>
        {mealMessage}
      </div>
      <img src={user.photoURL} alt="userProfile" className="profile-image" />
    </div>
  );

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
        </div>
        </Modal>
      )}

        <div className="box" onClick={() => handleOpenModal('instructions')}>
          Instructions
        </div>
      </div>
      <Modal show={showModal} handleClose={handleCloseModal}>
      {modalContent === 'instructions' && (
    <>
      <h2>How to Use This Web App</h2>
        <p>Welcome to the Mess Management Web App! Here are the steps to use this application:</p>
        
        <h3>1. Logging In</h3>
        <p>To get started, please log in using your Google account. Click on the "Sign in with Google" button on the main page.</p>
        
        <h3>2. QR Code Scanning</h3>
        <p>To mark your attendance, go to the QR Code Scanner tab and scan the QR code available at the mess. The system will automatically record your attendance.</p>
        
        <h3>3. Viewing Attendance</h3>
        <p>You can view your attendance record by navigating to the Attendance Card tab. This will display your attendance history, including the dates and times of your meals.</p>
        
        <h3>4. Codeword Input</h3>
        <p>If you are unable to scan the QR code, you can use the Codeword Input tab. Enter the provided codeword to mark your attendance.</p>
        
        <h3>5. User Profile</h3>
        <p>Your profile information, including your display name and email, can be viewed in the Home tab. You can also see a greeting message based on the time of day and the current meal details.</p>

        <h3>6. Notifications</h3>
        <p>You will receive notifications reminding you to have your meals. Ensure notifications are enabled in your browser settings to stay updated.</p>
        
        <h3>7. Feedback</h3>
        <p>We value your feedback! Click the button below to provide your feedback on the application.</p>
        <button className="feedback-button" onClick={() => window.open('https://messmanagementfeedbackform.paperform.co', '_blank')}>Give Feedback</button>
        </>
        )}
        {modalContent === 'messDetails' && (
          <>
            <h2>My Dining Hall</h2>
            <img src={HimalayaMessImage} alt="Mess" className="mess-image" />
            <p><b>{messName}</b></p>
            <p>Mess Location: {messLocation}</p>
            <p>Other details about the mess can be added here.</p>
          </>
        )}
      </Modal>
    </div>
  );
};

export default HomePage;
