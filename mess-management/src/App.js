import React, { useState, useEffect } from 'react';
import './App.css';
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './Footer.js'; // Import the footer component
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';
import QRScanner from './qr-scanner.js';
import AttendanceCard from './attendanceCard.js';
import CodewordInput from './codeword.js';
import HomePage from './HomePage.js';
import Notification from './Notification'; // Import Notification component

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');


  // Monitor auth state on page load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // User is signed in
      } else {
        setUser(null); // No user is signed in
      }
    });

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.log('Error occurred during login:', error);
    }
  };

  const handleLogout = () => {
    signOut(auth).then(() => {
      setUser(null);
    }).catch((error) => {
      console.error("Error signing out: ", error);
    });
  };

  const showNotification = (msg) => {
    setMessage(msg);
    if ("vibrate" in navigator) {
      navigator.vibrate(200);
    }
    setTimeout(() => {
      setMessage('');
    }, 3000); // Hide notification after 3 seconds
  };

  return (
    <div className="App">
      <h1>Mess Management</h1>
      {user ? (
        <>
          <div className="logout-icon" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> {/* Logout Icon */}
          </div>
          <Routes>
            <Route path="/" element={<HomePage user={user} showNotification={showNotification} />} />
            <Route path="/qr-scanner" element={<QRScanner user={user} showNotification={showNotification} />} />
            <Route path="/attendance" element={<AttendanceCard userEmail={user.email} />} />
            <Route path="/codeword" element={<CodewordInput user={user} showNotification={showNotification} />} />
          </Routes>

          <Footer /> {/* Include the footer for navigation */}
          {message && <Notification message={message} />} {/* Render the notification */}
        </>
      ) : (
        <div className="sign-in-container">
          <img src="logo.png" alt="Logo" className="logo" />
          <h2>Sign In</h2>
          <button className="google-signin-btn" onClick={handleLogin}>
            <i className="fab fa-google"></i> Sign in with Google
          </button>
          <p>
            By Signing in, you agree to our <a href="/terms">Terms & Conditions</a>.
          </p>
        </div>
      )}
    </div>
  );
}

export default App;
