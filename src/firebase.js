import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Auth ke liye
import { getFirestore } from "firebase/firestore"; // Database ke liye
import { getStorage } from "firebase/storage"; // Gallery upload ke liye

const firebaseConfig = {
  apiKey: "AIzaSyDEB2zcGj6HDsZL5LPvK7QeaemcLajkcSU",
  authDomain: "staypg-3f373.firebaseapp.com",
  projectId: "staypg-3f373",
  storageBucket: "staypg-3f373.firebasestorage.app",
  messagingSenderId: "1050823728657",
  appId: "1:1050823728657:web:3a3abf1982693c86b01bb0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Modules ko initialize aur export karo
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;