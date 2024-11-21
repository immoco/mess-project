import React, { useState, useEffect } from 'react';
import './css/App.css';
// eslint-disable-next-line
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './Footer.js'; // Import the footer component
import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase.js';
import Modal from './Modal';
import QRScanner from './qr-scanner.js';
import AttendanceCard from './attendanceCard.js';
import CodewordInput from './codeword.js';
import HomePage from './HomePage.js';
import Notification from './Notification'; // Import Notification component
import { SiGoogle } from 'react-icons/si';

function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleOpenModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

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
      
      {user ? (
        <>
        <h1>Mess Management</h1>
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
        <>
        <h1>Sign In</h1>
        <img src="logo.png" alt="Logo" className="logo" />
        <div className="sign-in-container">
          <h2>Sign In</h2>
          <button className="google-signin-btn" onClick={handleLogin}>
          <i><SiGoogle size={20} color="red" /></i> Sign in with Google
          </button>
          <p className='consent'>
            By Signing in, you agree to our 
          <div className="tac" onClick={() => handleOpenModal('TAC')}> Terms & Conditions</div>.
          </p>
       </div>
       </>
      )}

<Modal show={showModal} handleClose={handleCloseModal}>
          {modalContent === 'TAC' && (
          <>
          <h1>Terms and Conditions</h1>
            <section>
              <h2>Introduction</h2>
              <p>
                Welcome to Mess Management Web App. Our Web App is designed to simplify the management of mess facilities to the students who attend the Paradox festival. It allows users to keep track of meals, manage schedules, and be able to seek any kind of assistance regarding Mess Facilities. With a user-friendly interface, our app helps reduce administrative burdens, improves meal planning, and engages the overall dining experience with hassle-free mess management services. The mentioned Terms and Conditions outline the rules and regulations for the use of Mess Management’s services.
              </p>
            </section>

            <section>
              <h2>User Accounts</h2>
              <ul>
                <li>Users must provide an appropriate student mail ID.</li>
                <li>Users are responsible for maintaining the confidentiality of their account details.</li>
              </ul>
            </section>

            <section>
              <h2>Acceptable Use</h2>
              <ul>
                <li>Users must not use the service for any illegal or unauthorized purpose.</li>
                <li>Users must not engage in any activity that disrupts or interferes with the service.</li>
                <li>Users must not copy, modify, or distribute any content without permission.</li>
              </ul>
            </section>

            <section>
              <h2>Termination</h2>
              <p>We reserve the right to terminate accounts that violate our terms and conditions.</p>
            </section>

            <section>
              <h2>Changes to Terms</h2>
              <p>We may update these terms at any time. Users will be notified of any changes through the student's mail ID.</p>
            </section>

            <section>
              <h2>Contact Information</h2>
              <p>For any questions about these Terms and Conditions, please contact us at <a href="mailto:immocompany01@gmail.com">immocompany01@gmail.com</a></p>
            </section>

          <h1>Privacy Policy</h1>
            <section>
              <h2>Introduction</h2>
              <p>
                At Mess Management Web App, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information.
              </p>
            </section>

            <section>
              <h2>Data Collection</h2>
              <ul>
                <li>We collect student email IDs that you use to login in our web app.</li>
                <li>We also collect data automatically, such as profile image, name using the mail ID you provide to us.</li>
              </ul>
            </section>

            <section>
              <h2>Use of Data</h2>
              <p>We use your data to provide and improve our services.</p>
            </section>

            <section>
              <h2>Data Sharing</h2>
              <p>We do not share your personal information with third parties.</p>
            </section>

            <section>
              <h2>Data Security</h2>
              <p>We implement security measures to protect your data from unauthorized access.</p>
            </section>

            <section>
              <h2>Changes to Privacy Policy</h2>
              <p>We may update this Privacy Policy from time to time. Users will be notified of any changes.</p>
            </section>

            <section>
              <h2>Contact Information</h2>
              <p>For any questions about this Privacy Policy, please contact us at <a href="mailto:immocompany01@gmail.com">immocompany01@gmail.com</a></p>
            </section>
          </>
          )}
         </Modal>
    </div>
  );
}



export default App;
