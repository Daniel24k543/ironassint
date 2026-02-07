// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyARs87GzRmKrLGMPxSBIIkZw9b3mIYaRBo",
  authDomain: "tabbup-148b1.firebaseapp.com",
  databaseURL: "https://tabbup-148b1-default-rtdb.firebaseio.com",
  projectId: "tabbup-148b1",
  storageBucket: "tabbup-148b1.firebasestorage.app",
  messagingSenderId: "276193988776",
  appId: "1:276193988776:web:ee0cc4a1bd46dd5f21f29d",
  measurementId: "G-VWM27FST54"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics (optional for React Native)
let analytics;
try {
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} catch (error) {
  console.log('Analytics not available in this environment');
}

export { analytics };
export default app;