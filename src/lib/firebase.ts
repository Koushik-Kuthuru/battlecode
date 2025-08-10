
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "battlecode-45xsz",
  "appId": "1:996854652234:web:e7957387b9ff9b3b856e72",
  "storageBucket": "battlecode-45xsz.appspot.com",
  "apiKey": "AIzaSyAz_mH_vB9t-0-dH5IqaxqJ9p95Y56iN0",
  "authDomain": "battlecode-45xsz.firebaseapp.com",
  "messagingSenderId": "996854652234"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
