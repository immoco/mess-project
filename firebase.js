// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC6SLEdC0nOMM-lk-xQ9paXPFnLJxgtU7c",
  authDomain: "messmanagement-25.firebaseapp.com",
  projectId: "messmanagement-25",
  storageBucket: "messmanagement-25.appspot.com",
  messagingSenderId: "185135556717",
  appId: "1:185135556717:web:e5d9a96126504143c97764",
  measurementId: "G-SSDCFY6C80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);