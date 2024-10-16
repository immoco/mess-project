// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, setPersistence, browserLocalPersistence, onAuthStateChanged} from "firebase/auth";
import { getFirestore, collection, getDoc ,doc, addDoc, query, Timestamp, where, getDocs} from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyCTVuQATpUPd4w9b177VPw5irx5-xLO1mk",
    authDomain: "mess-management-25.firebaseapp.com",
    projectId: "mess-management-25",
    storageBucket: "mess-management-25.appspot.com",
    messagingSenderId: "83770132440",
    appId: "1:83770132440:web:de603ac125383b5f0854ad",
    measurementId: "G-J786ZD8JDN"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut , getDoc, collection, 
  getFirestore, doc, db, addDoc, query, Timestamp, 
  where, getDocs, setPersistence, browserLocalPersistence, onAuthStateChanged};

