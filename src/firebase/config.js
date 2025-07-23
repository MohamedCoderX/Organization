// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBIlldRFMgQ9oF9DsIm5r867D1tNBsIZ0U",
  authDomain: "baithulmaal-b1d9e.firebaseapp.com",
  databaseURL: "https://baithulmaal-b1d9e-default-rtdb.firebaseio.com",
  projectId: "baithulmaal-b1d9e",
  storageBucket: "baithulmaal-b1d9e.firebasestorage.app",
  messagingSenderId: "523604958317",
  appId: "1:523604958317:web:6bae4c08a9fe747f9df364"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
